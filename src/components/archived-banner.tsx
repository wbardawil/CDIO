import Link from "next/link";

interface Props {
  orgId: string;
  orgName: string;
}

/**
 * Amber-soft callout shown on every /clients/[orgId]/* page when
 * the client is archived. Per DESIGN.md: `attn` callout pattern,
 * amber-once-per-screen — on an archived-client surface this is
 * THE amber action signal (Sandbox badge degrades to neutral
 * elsewhere on the same page if both would compete).
 *
 * Read-only mode is NOT enforced here (founder decision: lightest-
 * touch (c) — banner signals state, doesn't gate mutations).
 */
export function ArchivedBanner({ orgId, orgName }: Props) {
  return (
    <div
      role="status"
      className="bg-amber-soft border border-amber-deep/30 rounded-md px-4 py-3 mb-6 flex items-center justify-between"
    >
      <div>
        <p className="text-sm text-amber-deep font-medium">
          {orgName} is archived
        </p>
        <p className="text-xs text-amber-deep/80 mt-0.5">
          Engagement history stays accessible. Restore from Settings to put it
          back in the active portfolio.
        </p>
      </div>
      <Link
        href={`/clients/${orgId}/settings`}
        className="px-3 py-1.5 bg-raised border border-amber-deep text-amber-deep text-xs font-medium rounded hover:bg-amber-soft/70 transition-colors whitespace-nowrap"
      >
        Open Settings
      </Link>
    </div>
  );
}
