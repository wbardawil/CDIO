import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  ARTIFACT_TABLE,
  assertCanActOnArtifact,
  type ApprovableArtifactType,
} from "@/lib/auth/role-gates";
import { assertPractitionerOwnsOrg, type PractitionerClientRole } from "@/lib/auth/assert-owns-org";
import { createServiceClient } from "@/lib/db/supabase";

// ============================================================
// Shared approval-action handlers (S2 — substrate correctness).
//
// S2 rewires every state transition through schema-v25 RPCs that
// atomically combine the state UPDATE + audit-event INSERT in one
// Postgres transaction. The handler is now a thin shell: auth check,
// expected-state pre-validate, RPC call, map typed return to HTTP.
//
// State machine (approval_status — the column on the artifact row):
//
//                ┌──── submit ─────────────────┐
//                │   (event: submitted)        │
//            draft ←──── withdraw ─────────── pending ──── approve ────── approved (TERMINAL)
//              ↑       (event: withdrawn)     │            (event: approved
//              │                              │             — S2 always; S3 adds
//              │                              │             approved_with_edits)
//              ├─ submit ─── returned ←── return ──┘
//                          (event: returned)
//                              │
//                              └── reject ──────────────→ rejected (TERMINAL)
//                                  (event: rejected)
//
// `approved_with_edits` is an event_type only — approval_status stays 'approved'.
//
// RPC data-flow (every transition; see schema-v25-substrate-correctness.sql):
//   1. Legal-transition guard (per-verb whitelist; codex X4).
//   2. SELECT … FROM <artifact> WHERE id=$1 FOR UPDATE — locks the row.
//   3. Status check: current_status vs p_expected_status → stale_state.
//   4. UPDATE artifact + INSERT approval_events row, inside an explicit
//      BEGIN/EXCEPTION subtransaction (codex X3) — both rollback together.
//   5. Return typed JSON {ok, code, current_status, new_status, event_id}.
//
// Mutation guards (codex X8, separate from this file): the 3 general PATCH
// routes + initiatives/[id]/step-status + audits/[id]/{run,companion} +
// audits/extract reject when approval_status ∈ {pending, approved, rejected}.
// PATCH allowed only on draft / returned. Strategic_approver creations now
// start in 'draft' (no auto-approval) so the immutability invariant holds.
//
// cso C7 — artifactType is bound at the route level via the closure;
// callers from the request body cannot influence which table is touched.
// ============================================================

// -------- typed RPC return + HTTP mapping --------

interface RpcResult {
  ok: boolean;
  code: "stale_state" | "not_found" | "internal" | null;
  current_status: string | null;
  message: string | null;
  new_status?: string;
  event_id?: string;
}

function mapRpcFailure(result: RpcResult): NextResponse {
  switch (result.code) {
    case "stale_state":
      return NextResponse.json(
        {
          error: "Stale state",
          details: `Artifact moved to '${result.current_status}' since you read it.`,
          current_status: result.current_status,
        },
        { status: 409 },
      );
    case "not_found":
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    case "internal":
      return NextResponse.json(
        { error: "Internal error", details: "Operation refused; state unchanged." },
        { status: 500 },
      );
    default:
      return NextResponse.json(
        { error: "Unexpected RPC failure", details: JSON.stringify(result) },
        { status: 500 },
      );
  }
}

function mapRpcOrCallError(
  data: unknown,
  callError: { message: string } | null,
): RpcResult | NextResponse {
  if (callError) {
    return NextResponse.json(
      { error: "RPC call failed", details: callError.message },
      { status: 500 },
    );
  }
  // The Supabase client unwraps single-value RPC returns; data is the jsonb.
  return data as RpcResult;
}

// Shared helper for approver-only handlers (approve, return, reject).
// Closes codex P1 #8 + S2-impl review #4: the previous shape (fetch artifact,
// then call assertCanApprove on artifact.org_id) leaked existence via the
// 403 response from assertCanApprove on cross-org artifact IDs. This helper
// returns 404 when the caller has no membership on the artifact's org —
// matching the submit/withdraw path that goes through assertCanActOnArtifact.
interface ApproverArtifactCtx {
  artifact: { id: string; org_id: string; approval_status: string };
  practitionerId: string;
  role: PractitionerClientRole;
}

async function fetchArtifactForApproverAction(
  artifactType: ApprovableArtifactType,
  artifactId: string,
): Promise<{ ok: true; ctx: ApproverArtifactCtx } | { ok: false; response: NextResponse }> {
  const db = createServiceClient();
  const { data: artifact } = await db
    .from(ARTIFACT_TABLE[artifactType])
    .select("id, org_id, approval_status")
    .eq("id", artifactId)
    .maybeSingle();
  if (!artifact) {
    return { ok: false, response: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }

  // Step 1: org membership; cross-org no-membership masked to 404 (codex P1 #8).
  // Keep 401 (unauthenticated) as-is; don't mask auth failure.
  const ownership = await assertPractitionerOwnsOrg(artifact.org_id);
  if (!ownership.ok) {
    const status = ownership.response.status;
    return {
      ok: false,
      response:
        status === 401
          ? ownership.response
          : NextResponse.json({ error: "Not found" }, { status: 404 }),
    };
  }

  // Step 2: approver-only. Member but wrong role → 403 (legit Forbidden,
  // not an existence leak — they can see the artifact exists in their org).
  if (ownership.role !== "strategic_approver") {
    return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return {
    ok: true,
    ctx: {
      artifact,
      practitionerId: ownership.practitionerId,
      role: ownership.role,
    },
  };
}

// -------- SUBMIT (any non-viewer; draft|returned → pending) --------

export async function handleSubmit(
  artifactType: ApprovableArtifactType,
  artifactId: string,
) {
  const auth = await assertCanActOnArtifact(artifactType, artifactId);
  if (!auth.ok) return auth.response;

  // Pre-validate state for a clean 409 (vs the RPC's legal-transition guard
  // refusing with code='internal' for the same situation).
  if (
    auth.artifact.approval_status !== "draft" &&
    auth.artifact.approval_status !== "returned"
  ) {
    return NextResponse.json(
      {
        error: "Invalid state transition",
        details: `Cannot submit an artifact in state '${auth.artifact.approval_status}'.`,
      },
      { status: 409 },
    );
  }

  const db = createServiceClient();
  const { data, error } = await db.rpc("apply_artifact_submit", {
    p_artifact_type: artifactType,
    p_artifact_id: artifactId,
    p_expected_status: auth.artifact.approval_status,
    p_actor_practitioner_id: auth.practitionerId,
    p_actor_role: auth.role,
    p_payload: {},
  });

  const r = mapRpcOrCallError(data, error);
  if (r instanceof NextResponse) return r;
  if (!r.ok) return mapRpcFailure(r);

  return NextResponse.json({
    ok: true,
    approval_status: "pending",
    event_id: r.event_id,
  });
}

// -------- WITHDRAW (artifact author; pending → draft) --------

export async function handleWithdraw(
  artifactType: ApprovableArtifactType,
  artifactId: string,
) {
  const auth = await assertCanActOnArtifact(artifactType, artifactId);
  if (!auth.ok) return auth.response;

  if (auth.artifact.approval_status !== "pending") {
    return NextResponse.json(
      {
        error: "Invalid state transition",
        details: `Cannot withdraw an artifact in state '${auth.artifact.approval_status}'.`,
      },
      { status: 409 },
    );
  }

  const db = createServiceClient();
  const { data, error } = await db.rpc("apply_artifact_withdraw", {
    p_artifact_type: artifactType,
    p_artifact_id: artifactId,
    p_expected_status: auth.artifact.approval_status,
    p_actor_practitioner_id: auth.practitionerId,
    p_actor_role: auth.role,
    p_payload: {},
  });

  const r = mapRpcOrCallError(data, error);
  if (r instanceof NextResponse) return r;
  if (!r.ok) return mapRpcFailure(r);

  return NextResponse.json({ ok: true, approval_status: "draft", event_id: r.event_id });
}

// -------- APPROVE (strategic_approver; pending → approved) --------
//
// S2 does not accept an `edits` payload in the body (codex X14: the prior
// "Approve with edits" UI button is being deleted because it lied — sent
// edits_made:true with no actual edits). S3 will add real approve-with-edits
// UX and re-enable inline edits via apply_artifact_approve's p_edits.

export async function handleApprove(
  _req: NextRequest,
  artifactType: ApprovableArtifactType,
  artifactId: string,
) {
  const a = await fetchArtifactForApproverAction(artifactType, artifactId);
  if (!a.ok) return a.response;

  if (a.ctx.artifact.approval_status !== "pending") {
    return NextResponse.json(
      {
        error: "Invalid state transition",
        details: `Cannot approve an artifact in state '${a.ctx.artifact.approval_status}'.`,
      },
      { status: 409 },
    );
  }

  const db = createServiceClient();
  const { data, error } = await db.rpc("apply_artifact_approve", {
    p_artifact_type: artifactType,
    p_artifact_id: artifactId,
    p_expected_status: a.ctx.artifact.approval_status,
    p_actor_practitioner_id: a.ctx.practitionerId,
    p_actor_role: a.ctx.role,
    p_payload: {},
    p_edits: null,
  });

  const r = mapRpcOrCallError(data, error);
  if (r instanceof NextResponse) return r;
  if (!r.ok) return mapRpcFailure(r);

  return NextResponse.json({ ok: true, approval_status: "approved", event_id: r.event_id });
}

// -------- RETURN (strategic_approver; pending → returned) --------

const returnSchema = z.object({
  comment: z.string().min(1).max(4000),
});

export async function handleReturn(
  req: NextRequest,
  artifactType: ApprovableArtifactType,
  artifactId: string,
) {
  const parsed = returnSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Comment required", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const a = await fetchArtifactForApproverAction(artifactType, artifactId);
  if (!a.ok) return a.response;

  if (a.ctx.artifact.approval_status !== "pending") {
    return NextResponse.json(
      {
        error: "Invalid state transition",
        details: `Cannot return an artifact in state '${a.ctx.artifact.approval_status}'.`,
      },
      { status: 409 },
    );
  }

  const db = createServiceClient();
  const { data, error } = await db.rpc("apply_artifact_return", {
    p_artifact_type: artifactType,
    p_artifact_id: artifactId,
    p_expected_status: a.ctx.artifact.approval_status,
    p_actor_practitioner_id: a.ctx.practitionerId,
    p_actor_role: a.ctx.role,
    p_payload: { comment: parsed.data.comment },
  });

  const r = mapRpcOrCallError(data, error);
  if (r instanceof NextResponse) return r;
  if (!r.ok) return mapRpcFailure(r);

  return NextResponse.json({ ok: true, approval_status: "returned", event_id: r.event_id });
}

// -------- REJECT (strategic_approver; pending → rejected; TERMINAL) --------
//
// New in S2 (codex P1 #7). Mirrors handleReturn's shape; the difference is
// the target state is terminal-no — no path back to draft. If the operator
// wants to rework a rejected idea, they create a new artifact.

const rejectSchema = z.object({
  comment: z.string().min(1).max(4000),
});

export async function handleReject(
  req: NextRequest,
  artifactType: ApprovableArtifactType,
  artifactId: string,
) {
  const parsed = rejectSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Comment required", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const a = await fetchArtifactForApproverAction(artifactType, artifactId);
  if (!a.ok) return a.response;

  if (a.ctx.artifact.approval_status !== "pending") {
    return NextResponse.json(
      {
        error: "Invalid state transition",
        details: `Cannot reject an artifact in state '${a.ctx.artifact.approval_status}'.`,
      },
      { status: 409 },
    );
  }

  const db = createServiceClient();
  const { data, error } = await db.rpc("apply_artifact_reject", {
    p_artifact_type: artifactType,
    p_artifact_id: artifactId,
    p_expected_status: a.ctx.artifact.approval_status,
    p_actor_practitioner_id: a.ctx.practitionerId,
    p_actor_role: a.ctx.role,
    p_payload: { comment: parsed.data.comment },
  });

  const r = mapRpcOrCallError(data, error);
  if (r instanceof NextResponse) return r;
  if (!r.ok) return mapRpcFailure(r);

  return NextResponse.json({ ok: true, approval_status: "rejected", event_id: r.event_id });
}
