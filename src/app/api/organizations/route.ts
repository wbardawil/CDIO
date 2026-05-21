import { NextRequest, NextResponse } from "next/server";
import { EngagementOrchestrator } from "@/lib/agents/orchestrator";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import { z } from "zod";

const OnboardSchema = z.object({
  name: z.string().min(1),
  employee_count: z.number().int().positive(),
  industry: z.enum([
    "healthcare", "financial_services", "manufacturing",
    "professional_services", "retail_ecommerce", "technology",
    "education", "other",
  ]),
  stakeholders: z.array(
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
      role: z.string().min(1),
    })
  ).min(1),
  is_sandbox: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  const practitioner = await ensurePractitioner();
  if (!practitioner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const input = OnboardSchema.parse(body);

    const orgId = crypto.randomUUID();
    const orchestrator = new EngagementOrchestrator(orgId);
    const result = await orchestrator.onboard(input);

    // Persist is_sandbox flag on the freshly-created org. Doing this as a
    // post-step keeps the orchestrator's onboard() signature stable for now;
    // we'll fold this into the upsert if it becomes a recurring pattern.
    if (input.is_sandbox) {
      const dbForFlag = createServiceClient();
      await dbForFlag.from("organizations").update({ is_sandbox: true }).eq("id", orgId);
    }

    // Map this client to the practitioner that created it. They become
    // the strategic_approver — the org's primary CDIO + sign-off authority
    // (handoff §4). schema-v24 renamed 'owner' to 'strategic_approver'.
    const db = createServiceClient();
    const { error: mapError } = await db.from("practitioner_clients").insert({
      practitioner_id: practitioner.id,
      org_id: orgId,
      role: "strategic_approver",
    });
    if (mapError) {
      // Roll back the org so we don't leave an orphan owned by no one.
      // ON DELETE CASCADE on stakeholders + assessments cleans those up.
      console.error("practitioner_clients insert failed; rolling back org:", mapError);
      await db.from("organizations").delete().eq("id", orgId);
      return NextResponse.json(
        { error: "Failed to register client", details: mapError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to onboard organization" },
      { status: 500 }
    );
  }
}
