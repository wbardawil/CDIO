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
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI-CDIO</h1>
            <p className="text-xs text-gray-500">Fractional Executive OS</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/preview"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Methodology Preview
            </Link>
            <span className="text-sm text-gray-600 hidden sm:inline">
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
            <h2 className="text-2xl font-bold text-gray-900">Portfolio</h2>
            <p className="text-sm text-gray-500 mt-1">
              {clients.length === 0
                ? "No active clients yet"
                : `${clients.length} active ${clients.length === 1 ? "client" : "clients"} · ${totalCommittedHours} hrs/mo committed`}
            </p>
          </div>
          <Link
            href="/onboarding"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New client
          </Link>
        </div>

        {/* Empty state */}
        {clients.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No clients in your portfolio yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Onboard your first client to run an assessment, build a roadmap, and start tracking value.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/onboarding"
                className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Onboard your first client
              </Link>
              <Link
                href="/scan"
                className="inline-flex items-center px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
              >
                Try the Quick Scan
              </Link>
            </div>
          </div>
        ) : (
          /* Client table */
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modules in scope
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hrs / mo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/clients/${c.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {c.name}
                      </Link>
                      {c.is_sandbox && (
                        <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-semibold uppercase tracking-wider">
                          Sandbox
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {INDUSTRY_LABELS[c.industry] ?? c.industry}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {SIZE_LABELS[c.size_category] ?? c.size_category}
                      <span className="text-gray-400 ml-1">({c.employee_count})</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {c.active_modules?.length ?? 0} of 16
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {c.monthly_hours}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded font-medium uppercase tracking-wider">
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
        <p className="text-xs text-gray-400 mt-6 text-center">
          Tip: drill into a client to access the existing assessment, synthesis, and roadmap engines. Status reports + QBR decks land Week 2-5.
        </p>
      </main>
    </div>
  );
}
