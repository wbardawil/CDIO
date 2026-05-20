import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/db/supabase";
import { assertPractitionerOwnsOrg } from "@/lib/auth/assert-owns-org";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { sendAssessmentEmail } from "@/lib/email/send-assessment-email";

const Schema = z.object({
  is_reminder: z.boolean().optional().default(false),
});

/**
 * POST /api/stakeholders/[id]/send-assessment-email
 * body: { is_reminder?: boolean }
 *
 * Sends the stakeholder's assessment link via Resend with the practitioner
 * as reply-to. Ownership-checked via the stakeholder's org_id.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let input: z.infer<typeof Schema>;
  try {
    input = Schema.parse(await request.json().catch(() => ({})));
  } catch (e) {
    return NextResponse.json({ error: "Bad request", details: String(e) }, { status: 400 });
  }

  const practitioner = await ensurePractitioner();
  if (!practitioner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createServiceClient();

  // Look up the stakeholder + org name in one shot
  const { data: stakeholder, error: stakeError } = await db
    .from("stakeholders")
    .select("id, org_id, name, email, assessment_token")
    .eq("id", id)
    .maybeSingle();

  if (stakeError || !stakeholder) {
    return NextResponse.json({ error: "Stakeholder not found" }, { status: 404 });
  }
  if (!stakeholder.assessment_token) {
    return NextResponse.json(
      { error: "Stakeholder has no assessment token (regenerate via re-onboarding)" },
      { status: 422 }
    );
  }

  const ownership = await assertPractitionerOwnsOrg(stakeholder.org_id);
  if (ownership.response) return ownership.response;

  const { data: org } = await db
    .from("organizations")
    .select("name, is_sandbox")
    .eq("id", stakeholder.org_id)
    .single();

  // Build absolute URL from the request
  const protoHeader = request.headers.get("x-forwarded-proto") ?? "http";
  const host = request.headers.get("host") ?? "localhost:3010";
  const assessmentUrl = `${protoHeader}://${host}/assess/${stakeholder.assessment_token}`;

  try {
    const sent = await sendAssessmentEmail({
      to: stakeholder.email,
      toName: stakeholder.name,
      fromName: practitioner.name ?? practitioner.email ?? "Your fractional CDIO",
      fromReplyTo: practitioner.email ?? "noreply@example.com",
      orgName: org?.name ?? "your organization",
      assessmentUrl,
      isReminder: input.is_reminder,
      isSandbox: org?.is_sandbox ?? false,
    });

    // Best-effort audit row in the unified agent_logs telemetry shape
    // (schema-v20). Sandbox-rerouting decision lives in metadata.
    // Wrapped in its own try/catch so an audit-row failure can never
    // turn a successful email send into a user-visible "Email send
    // failed" response. Mirrors the fire-and-forget pattern in
    // src/lib/observability/agent-logs.ts.
    try {
      const action = input.is_reminder
        ? "send_assessment_reminder"
        : "send_assessment_invite";
      await db.from("agent_logs").insert({
        org_id: stakeholder.org_id,
        practitioner_id: practitioner.id,
        agent_name: "email.sendAssessment",
        model: "resend",
        status: "ok",
        metadata: {
          action,
          is_reminder: input.is_reminder,
          is_sandbox: org?.is_sandbox ?? false,
          stakeholder_id: stakeholder.id,
          intended_email: stakeholder.email,
          resend_id: sent.id,
          routed_to: sent.routedTo,
        },
      });
    } catch {
      // Telemetry must never affect the user-facing response.
    }

    return NextResponse.json({
      ok: true,
      resend_id: sent.id,
      routed_to: sent.routedTo,
      sandbox: org?.is_sandbox ?? false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Send failed";
    console.error("send-assessment-email failed:", message);
    return NextResponse.json(
      { error: "Email send failed", details: message },
      { status: 500 }
    );
  }
}
