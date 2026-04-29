import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/db/supabase";
import { assertPractitionerOwnsOrg } from "@/lib/auth/assert-owns-org";
import { assignModulesByRole, inferInfluenceLevel } from "@/lib/playbook/role-mapping";

const PatchSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.string().min(1).optional(),
  influence_level: z.enum(["decision_maker", "influencer", "contributor"]).optional(),
  /** When provided, overrides the role-derived default. Empty array allowed = "use defaults". */
  relevant_modules: z.array(z.number().int().min(1).max(16)).optional(),
  /** When true and role changes, recompute relevant_modules from the new role. Default true unless relevant_modules is explicitly set. */
  recompute_modules_from_role: z.boolean().optional(),
});

/**
 * PATCH /api/stakeholders/[id]
 *
 * Edit a stakeholder. Ownership-checked via the stakeholder's org_id.
 * If `role` changes and `relevant_modules` is not explicitly provided,
 * recompute modules from the new role (so the practitioner doesn't have
 * to manually figure out which modules a CIO answers vs a CISO).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let input: z.infer<typeof PatchSchema>;
  try {
    input = PatchSchema.parse(await request.json());
  } catch (e) {
    return NextResponse.json(
      { error: "Validation failed", details: e instanceof z.ZodError ? e.issues : String(e) },
      { status: 400 }
    );
  }

  const db = createServiceClient();

  // Look up the stakeholder so we can verify ownership of its org
  const { data: existing, error: findError } = await db
    .from("stakeholders")
    .select("id, org_id, name, email, role, influence_level, relevant_modules")
    .eq("id", id)
    .maybeSingle();

  if (findError || !existing) {
    return NextResponse.json({ error: "Stakeholder not found" }, { status: 404 });
  }

  const ownership = await assertPractitionerOwnsOrg(existing.org_id);
  if (ownership.response) return ownership.response;

  // Build the update patch
  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.email !== undefined) updates.email = input.email;

  const roleChanged = input.role !== undefined && input.role !== existing.role;
  if (input.role !== undefined) {
    updates.role = input.role;
    // Re-derive influence if not explicitly set
    if (input.influence_level === undefined) {
      updates.influence_level = inferInfluenceLevel(input.role);
    }
  }

  if (input.influence_level !== undefined) {
    updates.influence_level = input.influence_level;
  }

  // Module derivation logic:
  // - explicit relevant_modules wins
  // - else if role changed and recompute is not false, recompute from role
  if (input.relevant_modules !== undefined) {
    updates.relevant_modules = input.relevant_modules;
  } else if (roleChanged && input.recompute_modules_from_role !== false && input.role) {
    updates.relevant_modules = assignModulesByRole(input.role);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true, stakeholder: existing, message: "No changes" });
  }

  const { data: updated, error: updateError } = await db
    .from("stakeholders")
    .update(updates)
    .eq("id", id)
    .select("id, org_id, name, email, role, influence_level, relevant_modules, assessment_token")
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update stakeholder", details: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, stakeholder: updated });
}
