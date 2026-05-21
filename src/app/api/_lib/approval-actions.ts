import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  assertCanActOnArtifact,
  assertCanApprove,
  type ApprovableArtifactType,
} from "@/lib/auth/role-gates";
import type { PractitionerClientRole } from "@/lib/auth/assert-owns-org";
import { createServiceClient } from "@/lib/db/supabase";

// ============================================================
// Shared approval-action handlers (S1.5 — Coach Mode substrate).
//
// cso C7 — artifactType is bound at the route level via the closure;
// callers from the request body cannot influence which table is touched.
//
// State machine (S1.5 vocabulary):
//   draft     → pending           via submit (any non-viewer)
//   pending   → approved          via approve (strategic_approver)
//   pending   → approved          via approveWithEdits (strategic_approver)
//   pending   → returned          via returnWithComment (strategic_approver)
//   pending   → draft             via withdraw (artifact author)
//   returned  → pending           via submit (artifact author)
//
// v24 substrate (handoff §5 columns added in schema-v24):
//   - Every approval_events row records actor_role (which of the 6 roles
//     the actor was acting under) — Phase D Coach Mode uses this to
//     differentiate "CDIO approved" from "operator self-edited".
//   - Every approval_events row records prior_version (the full JSON
//     snapshot of the artifact at the moment of the decision) — Phase D
//     Coach Mode diffs current state against this to surface "what the
//     CDIO changed". NULL would mean Coach Mode has nothing to learn from.
// ============================================================

const TABLE: Record<ApprovableArtifactType, string> = {
  initiative: "initiatives",
  status_report: "status_reports",
  selection: "selections",
  audit: "audits",
};

function nowIso() {
  return new Date().toISOString();
}

// -------- SUBMIT (any non-viewer; sets pending) --------

export async function handleSubmit(
  artifactType: ApprovableArtifactType,
  artifactId: string,
) {
  const auth = await assertCanActOnArtifact(artifactType, artifactId);
  if (!auth.ok) return auth.response;

  // Only draft and returned can transition to pending.
  if (auth.artifact.approval_status !== "draft" && auth.artifact.approval_status !== "returned") {
    return NextResponse.json(
      {
        error: "Invalid state transition",
        details: `Cannot submit an artifact in state '${auth.artifact.approval_status}'.`,
      },
      { status: 409 },
    );
  }

  const db = createServiceClient();
  const snapshot = await fetchArtifactSnapshot(db, artifactType, artifactId);
  const now = nowIso();
  const { error: updateErr } = await db
    .from(TABLE[artifactType])
    .update({
      approval_status: "pending",
      submitted_by_practitioner_id:
        auth.artifact.submitted_by_practitioner_id ?? auth.practitionerId,
      submitted_at: now,
    })
    .eq("id", artifactId);

  if (updateErr) {
    return NextResponse.json(
      { error: "Failed to submit", details: updateErr.message },
      { status: 500 },
    );
  }

  await appendEvent(db, {
    orgId: auth.artifact.org_id,
    artifactType,
    artifactId,
    eventType: "submitted",
    actorPractitionerId: auth.practitionerId,
    actorRole: auth.role,
    priorVersion: snapshot,
    payload: {},
  });

  return NextResponse.json({ ok: true, approval_status: "pending", submitted_at: now });
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
  const snapshot = await fetchArtifactSnapshot(db, artifactType, artifactId);
  const { error: updateErr } = await db
    .from(TABLE[artifactType])
    .update({ approval_status: "draft", submitted_at: null })
    .eq("id", artifactId);

  if (updateErr) {
    return NextResponse.json(
      { error: "Failed to withdraw", details: updateErr.message },
      { status: 500 },
    );
  }

  await appendEvent(db, {
    orgId: auth.artifact.org_id,
    artifactType,
    artifactId,
    eventType: "withdrawn",
    actorPractitionerId: auth.practitionerId,
    actorRole: auth.role,
    priorVersion: snapshot,
    payload: {},
  });

  return NextResponse.json({ ok: true, approval_status: "draft" });
}

// -------- APPROVE (strategic_approver; pending → approved) --------

const approveSchema = z.object({
  edits_made: z.boolean().optional().default(false),
});

export async function handleApprove(
  req: NextRequest,
  artifactType: ApprovableArtifactType,
  artifactId: string,
) {
  // Fetch artifact first so we know the org. 404 if it doesn't exist.
  const db = createServiceClient();
  const { data: artifact } = await db
    .from(TABLE[artifactType])
    .select("id, org_id, approval_status")
    .eq("id", artifactId)
    .maybeSingle();
  if (!artifact) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // strategic_approver-only on this artifact's org. 403 otherwise.
  const auth = await assertCanApprove(artifact.org_id);
  if (!auth.ok) return auth.response;

  if (artifact.approval_status !== "pending") {
    return NextResponse.json(
      {
        error: "Invalid state transition",
        details: `Cannot approve an artifact in state '${artifact.approval_status}'.`,
      },
      { status: 409 },
    );
  }

  // Optional body: { edits_made: true } indicates the approver already saved
  // edits via the artifact PATCH endpoint before clicking approve. We log
  // a different event_type so Coach Mode can fast-path "the CDIO edited"
  // without having to diff prior_version against current.
  let editsMade = false;
  if (req.headers.get("content-length") && parseInt(req.headers.get("content-length")!, 10) > 0) {
    const parsed = approveSchema.safeParse(await req.json().catch(() => ({})));
    if (parsed.success) editsMade = parsed.data.edits_made;
  }

  const snapshot = await fetchArtifactSnapshot(db, artifactType, artifactId);
  const now = nowIso();
  const { error: updateErr } = await db
    .from(TABLE[artifactType])
    .update({
      approval_status: "approved",
      approved_by_practitioner_id: auth.practitionerId,
      approved_at: now,
    })
    .eq("id", artifactId);

  if (updateErr) {
    return NextResponse.json(
      { error: "Failed to approve", details: updateErr.message },
      { status: 500 },
    );
  }

  await appendEvent(db, {
    orgId: artifact.org_id,
    artifactType,
    artifactId,
    eventType: editsMade ? "approved_with_edits" : "approved",
    actorPractitionerId: auth.practitionerId,
    actorRole: auth.role,
    priorVersion: snapshot,
    payload: {},
  });

  return NextResponse.json({ ok: true, approval_status: "approved", approved_at: now });
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

  const db = createServiceClient();
  const { data: artifact } = await db
    .from(TABLE[artifactType])
    .select("id, org_id, approval_status")
    .eq("id", artifactId)
    .maybeSingle();
  if (!artifact) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const auth = await assertCanApprove(artifact.org_id);
  if (!auth.ok) return auth.response;

  if (artifact.approval_status !== "pending") {
    return NextResponse.json(
      {
        error: "Invalid state transition",
        details: `Cannot return an artifact in state '${artifact.approval_status}'.`,
      },
      { status: 409 },
    );
  }

  const snapshot = await fetchArtifactSnapshot(db, artifactType, artifactId);
  const { error: updateErr } = await db
    .from(TABLE[artifactType])
    .update({ approval_status: "returned" })
    .eq("id", artifactId);

  if (updateErr) {
    return NextResponse.json(
      { error: "Failed to return", details: updateErr.message },
      { status: 500 },
    );
  }

  await appendEvent(db, {
    orgId: artifact.org_id,
    artifactType,
    artifactId,
    eventType: "returned",
    actorPractitionerId: auth.practitionerId,
    actorRole: auth.role,
    priorVersion: snapshot,
    payload: { comment: parsed.data.comment },
  });

  return NextResponse.json({ ok: true, approval_status: "returned" });
}

// -------- internals --------

interface ApprovalEventInput {
  orgId: string;
  artifactType: ApprovableArtifactType;
  artifactId: string;
  eventType: "submitted" | "approved" | "approved_with_edits" | "returned" | "withdrawn";
  actorPractitionerId: string;
  actorRole: PractitionerClientRole;
  priorVersion: Record<string, unknown> | null;
  payload: Record<string, unknown>;
}

async function appendEvent(
  db: ReturnType<typeof createServiceClient>,
  input: ApprovalEventInput,
): Promise<void> {
  const { error } = await db.from("approval_events").insert({
    org_id: input.orgId,
    artifact_type: input.artifactType,
    artifact_id: input.artifactId,
    event_type: input.eventType,
    actor_practitioner_id: input.actorPractitionerId,
    actor_role: input.actorRole,
    prior_version: input.priorVersion,
    payload: input.payload,
  });
  if (error) {
    // Don't fail the user-facing action just because event logging failed.
    // The state machine already moved; surface the discrepancy in console
    // for now. A structured logger lands in S2 telemetry.
    console.warn(
      `[approval_events] failed to insert event ${input.eventType} for ${input.artifactType}/${input.artifactId}: ${error.message}`,
    );
  }
}

/**
 * Fetches the full artifact row as JSON for the prior_version snapshot.
 * Phase D Coach Mode diffs this against the post-transition state to
 * surface "what the CDIO changed."
 *
 * Best-effort: if the read fails (rare), we return null and the event
 * gets stamped with prior_version=null. The state machine doesn't block
 * on snapshot failure — losing one snapshot is recoverable; blocking the
 * approval is not.
 */
async function fetchArtifactSnapshot(
  db: ReturnType<typeof createServiceClient>,
  artifactType: ApprovableArtifactType,
  artifactId: string,
): Promise<Record<string, unknown> | null> {
  const { data, error } = await db
    .from(TABLE[artifactType])
    .select("*")
    .eq("id", artifactId)
    .maybeSingle();
  if (error || !data) {
    console.warn(
      `[approval_events] could not snapshot ${artifactType}/${artifactId}: ${error?.message ?? "no data"}`,
    );
    return null;
  }
  return data as Record<string, unknown>;
}
