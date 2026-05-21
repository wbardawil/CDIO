import Link from "next/link";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";

// ============================================================
// /settings — practitioner-level settings index.
//
// Distinct from /clients/[orgId]/settings (which manages a specific
// client engagement). This page covers things that follow the
// practitioner, not the client: their account, integration tokens,
// future billing.
//
// Surfaces in S1.5:
//   - Profile (Clerk-managed; link to Clerk's account page)
//   - MCP token management (link to existing /settings/mcp)
//   - Billing — placeholder until Phase 3 Stripe lands
// ============================================================

export default async function SettingsIndexPage() {
  const practitioner = await ensurePractitioner();
  if (!practitioner) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-raised border-b border-hair">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/clients" className="text-muted hover:text-ink">
              Your clients
            </Link>
            <span className="text-faint" aria-hidden>
              ‹
            </span>
            <span className="font-semibold text-ink">Settings</span>
          </nav>
          <UserButton />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-semibold text-ink">Settings</h1>
          <p className="mt-1 text-sm text-muted">
            Your account, integrations, and billing — separate from any
            individual client&apos;s settings (those live under
            <span className="text-ink"> Your clients › [client] › Settings</span>).
          </p>
        </div>

        <div className="space-y-4">
          <Card
            title="Profile"
            description="Name, email, sign-in method, and avatar. Managed through your Clerk account; click below to open the account panel."
          >
            <div className="flex items-center gap-3">
              <UserButton />
              <span className="text-sm text-muted">
                Signed in as {practitioner.email ?? "—"}
              </span>
            </div>
          </Card>

          <Card
            title="MCP integration"
            description="Generate tokens for the AI-CDIO MCP server so external assistants (Claude Desktop, ChatGPT, etc.) can read your engagement context."
          >
            <Link
              href="/settings/mcp"
              className="inline-flex rounded bg-evergreen px-3 py-1.5 text-sm font-medium text-white hover:bg-evergreen-deep"
            >
              Manage MCP tokens
            </Link>
          </Card>

          <Card
            title="Billing"
            description={`Plan: ${practitioner.plan ?? "starter"}. Billing surface lands when paid tiers go live (Phase 3 — Stripe).`}
          >
            <p className="text-sm text-muted">No billing actions yet. Year 1 is free for the founder + early users.</p>
          </Card>

          <Card
            title="Client-level settings"
            description="To rename, archive, or invite people to a specific client, open that client first and click Settings in its chrome."
          >
            <Link
              href="/clients"
              className="text-sm font-medium text-evergreen hover:text-evergreen-deep"
            >
              Go to Your clients →
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-hair bg-raised p-5">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}
