import { Resend } from "resend";

interface SendArgs {
  to: string;
  toName: string;
  fromName: string;             // practitioner name
  fromReplyTo: string;          // practitioner email
  orgName: string;
  assessmentUrl: string;
  isReminder?: boolean;
  /**
   * When true the email is treated as test traffic:
   *   - "to" is overridden to the practitioner's own inbox (so a real
   *     stakeholder address is never contacted from a sandbox engagement)
   *   - subject is prefixed with [TEST]
   *   - HTML body shows a sandbox warning strip
   *
   * The practitioner's inbox = `fromReplyTo` (their address).
   */
  isSandbox?: boolean;
}

/**
 * Send a stakeholder their assessment link via Resend.
 *
 * Default from: "<Practitioner> via AI-CDIO <onboarding@resend.dev>".
 * The `onboarding@resend.dev` sender is Resend's free testing address;
 * swap to a verified domain when the practitioner has one. The reply-to
 * lands replies in the practitioner's own inbox.
 *
 * **Sandbox safety:** when `isSandbox=true` the email is rerouted to
 * the practitioner's own inbox so a real stakeholder is never emailed
 * from a test engagement. Subject is prefixed with `[TEST]` so the
 * practitioner can recognize it instantly.
 *
 * Throws on Resend API errors. Caller should catch and surface as 500.
 */
export async function sendAssessmentEmail(args: SendArgs): Promise<{ id: string; routedTo: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY not set in environment");
  }

  const resend = new Resend(apiKey);

  const senderDisplay = args.fromName
    ? `${args.fromName} via AI-CDIO`
    : "AI-CDIO";

  const baseSubject = args.isReminder
    ? `Reminder: your AI-CDIO assessment for ${args.orgName}`
    : `Action requested: ${args.fromName} needs your input on ${args.orgName}'s tech assessment`;
  const subject = args.isSandbox ? `[TEST] ${baseSubject}` : baseSubject;

  // Sandbox routing: never deliver to the configured stakeholder address.
  // Send to the practitioner instead. If we have no practitioner address
  // we refuse rather than fall through to the stakeholder.
  let recipient = args.to;
  if (args.isSandbox) {
    if (!args.fromReplyTo || args.fromReplyTo === "noreply@example.com") {
      throw new Error(
        "Sandbox email refused: no practitioner address available to reroute test traffic"
      );
    }
    recipient = args.fromReplyTo;
  }

  const html = renderAssessmentEmail({
    toName: args.toName,
    fromName: args.fromName,
    orgName: args.orgName,
    assessmentUrl: args.assessmentUrl,
    isReminder: args.isReminder ?? false,
    isSandbox: args.isSandbox ?? false,
    intendedRecipient: args.to,
  });

  const result = await resend.emails.send({
    from: `${senderDisplay} <onboarding@resend.dev>`,
    to: recipient,
    replyTo: args.fromReplyTo,
    subject,
    html,
  });

  if (result.error) {
    throw new Error(`Resend: ${result.error.message ?? "send failed"}`);
  }
  if (!result.data?.id) {
    throw new Error("Resend returned no message id");
  }

  return { id: result.data.id, routedTo: recipient };
}

function renderAssessmentEmail(args: {
  toName: string;
  fromName: string;
  orgName: string;
  assessmentUrl: string;
  isReminder: boolean;
  isSandbox: boolean;
  intendedRecipient: string;
}): string {
  const greeting = `Hi ${escapeHtml(args.toName.split(" ")[0] ?? args.toName)},`;
  const opener = args.isReminder
    ? `Friendly nudge — your AI-CDIO assessment for <strong>${escapeHtml(args.orgName)}</strong> is still waiting on your input.`
    : `<strong>${escapeHtml(args.fromName)}</strong> is running a strategic technology assessment for <strong>${escapeHtml(args.orgName)}</strong> and would value your perspective.`;

  const sandboxStrip = args.isSandbox
    ? `<div style="background:#fef3c7; border:2px solid #fbbf24; padding:14px 18px; margin:0 0 24px 0; border-radius:8px;">
        <p style="margin:0 0 6px 0; font-size:12px; font-weight:700; color:#78350f; letter-spacing:0.06em; text-transform:uppercase;">⚠ Test email — sandbox engagement</p>
        <p style="margin:0; font-size:13px; color:#78350f; line-height:1.5;">
          This is a sandbox-flagged client. The intended recipient was <strong>${escapeHtml(args.intendedRecipient)}</strong>. Real stakeholders are never contacted from sandbox engagements — this email was rerouted to your inbox so you can verify the flow.
        </p>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AI-CDIO Assessment</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background:#f8fafc; margin:0; padding:24px; color:#1f2937;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px; border:1px solid #e5e7eb; overflow:hidden;">
    <tr>
      <td style="padding:32px 32px 16px 32px;">
        ${sandboxStrip}
        <p style="margin:0 0 12px 0; font-size:14px; color:#6b7280; letter-spacing:0.04em; text-transform:uppercase;">AI-CDIO</p>
        <h1 style="margin:0 0 16px 0; font-size:22px; font-weight:600; color:#111827;">Your tech maturity assessment</h1>
        <p style="margin:0 0 16px 0; font-size:15px; line-height:1.55;">${greeting}</p>
        <p style="margin:0 0 16px 0; font-size:15px; line-height:1.55;">${opener}</p>
        <p style="margin:0 0 24px 0; font-size:15px; line-height:1.55;">
          The assessment takes about 10–15 minutes. Your responses are independent — no one else sees your answers, only the synthesized result.
        </p>
        <p style="margin:0 0 28px 0;">
          <a href="${args.assessmentUrl}"
             style="display:inline-block; background:#2563eb; color:#ffffff; padding:12px 22px; border-radius:8px; text-decoration:none; font-weight:600; font-size:15px;">
            Start your assessment →
          </a>
        </p>
        <p style="margin:0 0 8px 0; font-size:13px; color:#6b7280; line-height:1.5;">
          Or copy this link:<br />
          <a href="${args.assessmentUrl}" style="color:#2563eb; word-break:break-all;">${escapeHtml(args.assessmentUrl)}</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px 32px 32px; border-top:1px solid #f3f4f6;">
        <p style="margin:0; font-size:12px; color:#9ca3af; line-height:1.5;">
          You're receiving this because ${escapeHtml(args.fromName)} added you as a stakeholder on an AI-CDIO engagement.
          Reply directly to this email to reach ${escapeHtml(args.fromName)} with any questions.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
