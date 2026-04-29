import { Resend } from "resend";

interface SendArgs {
  to: string;
  toName: string;
  fromName: string;             // practitioner name
  fromReplyTo: string;          // practitioner email
  orgName: string;
  assessmentUrl: string;
  isReminder?: boolean;
}

/**
 * Send a stakeholder their assessment link via Resend.
 *
 * Default from: "<Practitioner> via AI-CDIO <onboarding@resend.dev>".
 * The `onboarding@resend.dev` sender is Resend's free testing address;
 * swap to a verified domain when the practitioner has one. The reply-to
 * lands replies in the practitioner's own inbox.
 *
 * Throws on Resend API errors. Caller should catch and surface as 500.
 */
export async function sendAssessmentEmail(args: SendArgs): Promise<{ id: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY not set in environment");
  }

  const resend = new Resend(apiKey);

  const senderDisplay = args.fromName
    ? `${args.fromName} via AI-CDIO`
    : "AI-CDIO";

  const subject = args.isReminder
    ? `Reminder: your AI-CDIO assessment for ${args.orgName}`
    : `Action requested: ${args.fromName} needs your input on ${args.orgName}'s tech assessment`;

  const html = renderAssessmentEmail({
    toName: args.toName,
    fromName: args.fromName,
    orgName: args.orgName,
    assessmentUrl: args.assessmentUrl,
    isReminder: args.isReminder ?? false,
  });

  const result = await resend.emails.send({
    from: `${senderDisplay} <onboarding@resend.dev>`,
    to: args.to,
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

  return { id: result.data.id };
}

function renderAssessmentEmail(args: {
  toName: string;
  fromName: string;
  orgName: string;
  assessmentUrl: string;
  isReminder: boolean;
}): string {
  const greeting = `Hi ${escapeHtml(args.toName.split(" ")[0] ?? args.toName)},`;
  const opener = args.isReminder
    ? `Friendly nudge — your AI-CDIO assessment for <strong>${escapeHtml(args.orgName)}</strong> is still waiting on your input.`
    : `<strong>${escapeHtml(args.fromName)}</strong> is running a strategic technology assessment for <strong>${escapeHtml(args.orgName)}</strong> and would value your perspective.`;

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
