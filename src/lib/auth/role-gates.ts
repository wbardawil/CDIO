import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/db/supabase";
import {
  assertPractitionerOwnsOrg,
  type OwnershipResult,
  type PractitionerClientRole,
} from "./assert-owns-org";

// ============================================================
// Role gates for S1 (operator + approval workflow).
//
// Layering on top of assertPractitionerOwnsOrg: it confirms the user has
// SOME access to the org and tells us their role; these helpers apply
// the role-specific rules for write actions.
// ============================================================

const WRITE_ROLES: PractitionerClientRole[] = ["owner", "collaborator", "operator"];
const APPROVE_ROLES: PractitionerClientRole[] = ["owner"];

/**
 * The 4 artifact tables that participate in the S1 approval workflow.
 * Bound at the route level (cso C7) — never accepted from request bodies.
 */
export type ApprovableArtifactType = "initiative" | "status_report" | "selection" | "audit";

const ARTIFACT_TABLE: Record<ApprovableArtifactType, string> = {
  initiative: "initiatives",
  status_report: "status_reports",
  selection: "selections",
  audit: "audits",
};

/**
 * The user can perform write actions (create/edit/submit) on this org's artifacts.
 * Viewers are rejected with 403. Other rejections follow assertPractitionerOwnsOrg.
 */
export async function assertCanWrite(orgId: string): Promise<OwnershipResult> {
  const r = await assertPractitionerOwnsOrg(orgId);
  if (!r.ok) return r;
  if (!WRITE_ROLES.includes(r.role)) {
    return {
      ok: false,
      practitionerId: null,
      role: null,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return r;
}

/**
 * The user can approve/return/edit submissions for this org. Owner-only.
 */
export async function assertCanApprove(orgId: string): Promise<OwnershipResult> {
  const r = await assertPractitionerOwnsOrg(orgId);
  if (!r.ok) return r;
  if (!APPROVE_ROLES.includes(r.role)) {
    return {
      ok: false,
      practitionerId: null,
      role: null,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return r;
}

export type ArtifactAuthResult =
  | {
      ok: true;
      practitionerId: string;
      role: PractitionerClientRole;
      artifact: ApprovableArtifact;
      response: null;
    }
  | { ok: false; practitionerId: null; role: null; artifact: null; response: NextResponse };

export interface ApprovableArtifact {
  id: string;
  org_id: string;
  approval_status: "draft" | "pending" | "approved" | "returned";
  submitted_by_practitioner_id: string | null;
  submitted_at: string | null;
  approved_by_practitioner_id: string | null;
  approved_at: string | null;
}

/**
 * Loads the artifact, derives its org from the row itself (matches the
 * established codebase pattern for /api/<artifact>/[id]/* routes), runs
 * the org-ownership check, and enforces operator-author rules:
 *   - owners can act on anything
 *   - collaborators can act on anything they authored OR unsubmitted drafts
 *   - operators can act on artifacts they authored OR unsubmitted drafts
 *   - viewers are blocked by the role check
 *
 * cso C4 — IDOR protection is enforced by `assertPractitionerOwnsOrg`
 * over the artifact's own org_id: an attacker who guesses an artifact id
 * in another org gets a 403 from the ownership helper (existing behavior).
 * 404 is returned only when the artifact id does not exist at all.
 */
export async function assertCanActOnArtifact(
  artifactType: ApprovableArtifactType,
  artifactId: string,
): Promise<ArtifactAuthResult> {
  const db = createServiceClient();
  const { data, error } = await db
    .from(ARTIFACT_TABLE[artifactType])
    .select("id, org_id, approval_status, submitted_by_practitioner_id, submitted_at, approved_by_practitioner_id, approved_at")
    .eq("id", artifactId)
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      practitionerId: null,
      role: null,
      artifact: null,
      response: NextResponse.json({ error: "Not found" }, { status: 404 }),
    };
  }

  const artifact = data as ApprovableArtifact;

  // Ownership check uses the artifact's org. The ownership helper returns
  // 403 if the caller has no role on that org — i.e. cross-org access
  // attempts get 403 (the artifact exists, you just can't see it). 404 is
  // reserved for "artifact does not exist".
  const r = await assertCanWrite(artifact.org_id);
  if (!r.ok) {
    return { ok: false, practitionerId: null, role: null, artifact: null, response: r.response };
  }

  if (r.role !== "owner") {
    const isAuthor = artifact.submitted_by_practitioner_id === r.practitionerId;
    const isUnclaimedDraft =
      artifact.submitted_by_practitioner_id === null && artifact.approval_status === "draft";
    if (!isAuthor && !isUnclaimedDraft) {
      return {
        ok: false,
        practitionerId: null,
        role: null,
        artifact: null,
        response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      };
    }
  }

  return {
    ok: true,
    practitionerId: r.practitionerId,
    role: r.role,
    artifact,
    response: null,
  };
}
