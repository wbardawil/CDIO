/**
 * SandboxBanner — visible warning that the current surface is operating
 * on test data, not a real engagement. Two variants:
 *
 * - "workspace" — full-width strip at top of the practitioner workspace.
 *   Tells the practitioner: emails are routed to them only, hard-delete
 *   is enabled, AI may be in dev-mode.
 *
 * - "assess"    — full-width strip at top of the public assess page.
 *   Tells the stakeholder: this is a practice run, responses won't
 *   affect a real engagement.
 *
 * Renders nothing when isSandbox is false, so it can be unconditionally
 * placed in layouts.
 */

interface Props {
  isSandbox: boolean;
  variant: "workspace" | "assess";
}

export function SandboxBanner({ isSandbox, variant }: Props) {
  if (!isSandbox) return null;

  if (variant === "workspace") {
    return (
      <div className="bg-amber-100 border-b-2 border-amber-300">
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-3 flex-wrap">
          <span className="px-2 py-0.5 bg-amber-300 text-amber-900 rounded text-[11px] font-bold uppercase tracking-wider">
            Sandbox
          </span>
          <span className="text-sm text-amber-900">
            <strong>Test client.</strong> Assessment emails route to you only with a{" "}
            <code className="px-1 py-0.5 bg-amber-200 rounded text-[12px]">[TEST]</code> subject prefix.
            Hard-delete is available below. Real-client safeguards do not apply here.
          </span>
        </div>
      </div>
    );
  }

  // variant === "assess"
  return (
    <div className="bg-amber-100 border-b-2 border-amber-300">
      <div className="max-w-3xl mx-auto px-6 py-2.5 flex items-center gap-3 flex-wrap">
        <span className="px-2 py-0.5 bg-amber-300 text-amber-900 rounded text-[11px] font-bold uppercase tracking-wider">
          Test
        </span>
        <span className="text-sm text-amber-900">
          You&apos;re viewing a <strong>test assessment</strong>. Responses are recorded in a sandbox engagement and won&apos;t affect any real client.
        </span>
      </div>
    </div>
  );
}
