import Link from "next/link";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";

interface ClientRow {
  id: string;
  name: string;
  size_category: string;
  industry: string;
  employee_count: number;
  engagement_model: string;
  monthly_hours: number;
  active_modules: number[];
  is_sandbox: boolean;
  role: string;
  created_at: string;
}

const INDUSTRY_LABELS: Record<string, string> = {
  healthcare: "Healthcare",
  financial_services: "Financial Services",
  manufacturing: "Manufacturing",
  professional_services: "Professional Services",
  retail_ecommerce: "Retail / E-commerce",
  technology: "Technology",
  education: "Education",
  other: "Other",
};

const SIZE_LABELS: Record<string, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

export default async function ClientsPage() {
  const practitioner = await ensurePractitioner();
  if (!practitioner) redirect("/sign-in");

  const db = createServiceClient();
  const { data: mappings } = await db
    .from("practitioner_clients")
    .select(`
      role,
      organizations:org_id (
        id, name, size_category, industry, employee_count,
        engagement_model, monthly_hours, active_modules, is_sandbox, created_at
      )
    `)
    .eq("practitioner_id", practitioner.id);

  const clients: ClientRow[] = (mappings ?? [])
    .map((m) => {
      const org = (m.organizations as unknown) as Omit<ClientRow, "role"> | null;
      if (!org) return null;
      return { ...org, role: m.role } as ClientRow;
    })
    .filter((x): x is ClientRow => x !== null);

  const totalCommittedHours = clients.reduce((sum, c) => sum + (c.monthly_hours ?? 0), 0);

  return (
    <div className="min-h-screen bg-paper">
      {/* Top nav */}
      <header className="bg-raised border-b border-hair">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink">AI-CDIO</h1>
            <p className="text-xs text-muted">Fractional Executive OS</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/network"
              className="text-sm text-muted hover:text-ink"
            >
              Network Catalog
            </Link>
            <Link
              href="/preview"
              className="text-sm text-muted hover:text-ink"
            >
              Methodology Preview
            </Link>
            <Link
              href="/settings/mcp"
              className="text-sm text-muted hover:text-ink"
            >
              MCP
            </Link>
            <span className="text-sm text-muted hidden sm:inline">
              {practitioner.name ?? practitioner.email ?? "Practitioner"}
            </span>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-ink">Portfolio</h2>
            <p className="text-sm text-muted mt-1">
              {clients.length === 0
                ? "No active clients yet"
                : `${clients.length} active ${clients.length === 1 ? "client" : "clients"} · ${totalCommittedHours} hrs/mo committed`}
            </p>
          </div>
          <Link
            href="/onboarding"
            className="inline-flex items-center px-4 py-2 bg-evergreen text-white text-sm font-medium rounded-lg hover:bg-evergreen-deep transition-colors"
          >
            + New client
          </Link>
        </div>

        {/* Empty state */}
        {clients.length === 0 ? (
          <div className="bg-raised rounded-xl border border-hair p-12 text-center">
            <h3 className="text-lg font-semibold text-ink mb-2">
              No clients in your portfolio yet
            </h3>
            <p className="text-muted mb-6 max-w-md mx-auto">
              Onboard your first client to run an assessment, build a roadmap, and start tracking value.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/onboarding"
                className="inline-flex items-center px-5 py-2.5 bg-evergreen text-white text-sm font-medium rounded-lg hover:bg-evergreen-deep"
              >
                Onboard your first client
              </Link>
              <Link
                href="/scan"
                className="inline-flex items-center px-5 py-2.5 border border-hair text-ink text-sm font-medium rounded-lg hover:bg-paper"
              >
                Try the Quick Scan
              </Link>
            </div>
          </div>
        ) : (
          /* Client table */
          <div className="bg-raised rounded-xl border border-hair overflow-hidden">
            <table className="w-full">
              <thead className="bg-paper border-b border-hair">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Modules in scope
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Hrs / mo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hair">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-paper transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/clients/${c.id}`}
                        className="text-sm font-medium text-evergreen hover:text-evergreen-deep"
                      >
                        {c.name}
                      </Link>
                      {c.is_sandbox && (
                        <span className="ml-2 px-1.5 py-0.5 bg-amber-soft text-amber-deep rounded text-[10px] font-semibold uppercase tracking-wider">
                          Sandbox
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {INDUSTRY_LABELS[c.industry] ?? c.industry}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {SIZE_LABELS[c.size_category] ?? c.size_category}
                      <span className="text-faint ml-1">({c.employee_count})</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {c.active_modules?.length ?? 0} of 16
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {c.monthly_hours}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className="px-2 py-1 bg-surface text-ink rounded font-medium uppercase tracking-wider">
                        {c.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer note about deferred tabs */}
        <p className="text-xs text-faint mt-6 text-center">
          Tip: drill into a client to access the existing assessment, synthesis, and roadmap engines. Status reports + QBR decks land Week 2-5.
        </p>
      </main>
    </div>
  );
}
