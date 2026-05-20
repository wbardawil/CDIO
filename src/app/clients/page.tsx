import Link from "next/link";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import { ClientsTable, type ClientRow } from "./clients-table";

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

type StatusFilter = "active" | "archived" | "all";

const FILTERS: Array<{ key: StatusFilter; label: string }> = [
  { key: "active", label: "Active" },
  { key: "archived", label: "Archived" },
  { key: "all", label: "All" },
];

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function ClientsPage({ searchParams }: PageProps) {
  const practitioner = await ensurePractitioner();
  if (!practitioner) redirect("/sign-in");

  const sp = await searchParams;
  const statusFilter: StatusFilter =
    sp.status === "archived" || sp.status === "all" ? sp.status : "active";

  const db = createServiceClient();
  const { data: mappings } = await db
    .from("practitioner_clients")
    .select(`
      role,
      organizations:org_id (
        id, name, size_category, industry, employee_count,
        engagement_model, monthly_hours, active_modules, is_sandbox, status, created_at
      )
    `)
    .eq("practitioner_id", practitioner.id);

  const allClients: ClientRow[] = (mappings ?? [])
    .map((m) => {
      const org = (m.organizations as unknown) as Omit<ClientRow, "role"> | null;
      if (!org) return null;
      return { ...org, role: m.role } as ClientRow;
    })
    .filter((x): x is ClientRow => x !== null);

  // Apply status filter
  const clients = allClients.filter((c) => {
    if (statusFilter === "all") return true;
    return c.status === statusFilter;
  });

  // Counts for the chip labels (so the founder sees "Archived (3)")
  const counts = {
    active: allClients.filter((c) => c.status === "active").length,
    archived: allClients.filter((c) => c.status === "archived").length,
    all: allClients.length,
  };

  const totalCommittedHours = clients.reduce(
    (sum, c) => sum + (c.monthly_hours ?? 0),
    0
  );

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
            <Link href="/network" className="text-sm text-muted hover:text-ink">
              Network Catalog
            </Link>
            <Link href="/preview" className="text-sm text-muted hover:text-ink">
              Methodology Preview
            </Link>
            <Link href="/settings/mcp" className="text-sm text-muted hover:text-ink">
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
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-ink">Portfolio</h2>
            <p className="text-sm text-muted mt-1">
              {clients.length === 0
                ? statusFilter === "archived"
                  ? "No archived clients"
                  : statusFilter === "all"
                  ? "No clients yet"
                  : "No active clients"
                : `${clients.length} ${
                    statusFilter === "all"
                      ? "total"
                      : statusFilter === "archived"
                      ? "archived"
                      : "active"
                  } · ${totalCommittedHours} hrs/mo committed`}
            </p>
          </div>
          <Link
            href="/onboarding"
            className="inline-flex items-center px-4 py-2 bg-evergreen text-white text-sm font-medium rounded-lg hover:bg-evergreen-deep transition-colors"
          >
            + New client
          </Link>
        </div>

        {/* Filter chips. Server-navigable; no JS required. */}
        <nav
          aria-label="Filter clients by status"
          className="flex items-center gap-1 mb-6 border-b border-hair"
        >
          {FILTERS.map((f) => {
            const isActive = statusFilter === f.key;
            const href =
              f.key === "active" ? "/clients" : `/clients?status=${f.key}`;
            return (
              <Link
                key={f.key}
                href={href}
                className={
                  "px-3 py-2 -mb-px border-b-2 text-sm transition-colors " +
                  (isActive
                    ? "border-evergreen text-evergreen font-medium"
                    : "border-transparent text-muted hover:text-ink")
                }
              >
                {f.label}
                <span
                  className={
                    "ml-1.5 text-xs " +
                    (isActive ? "text-evergreen" : "text-faint")
                  }
                >
                  ({counts[f.key]})
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Empty state */}
        {clients.length === 0 ? (
          statusFilter === "archived" ? (
            <div className="bg-raised rounded-xl border border-hair p-10 text-center">
              <h3 className="text-lg font-semibold text-ink mb-2">
                Nothing&apos;s been archived yet
              </h3>
              <p className="text-muted mb-4 max-w-md mx-auto">
                Archive a client from its Settings page to clean up the active
                portfolio while keeping the engagement history.
              </p>
              <Link
                href="/clients"
                className="inline-flex items-center px-4 py-2 border border-hair-strong text-ink text-sm font-medium rounded-lg hover:bg-paper"
              >
                Back to Active
              </Link>
            </div>
          ) : (
            <div className="bg-raised rounded-xl border border-hair p-12 text-center">
              <h3 className="text-lg font-semibold text-ink mb-2">
                No clients in your portfolio yet
              </h3>
              <p className="text-muted mb-6 max-w-md mx-auto">
                Onboard your first client to run an assessment, build a
                roadmap, and start tracking value.
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
          )
        ) : (
          <ClientsTable
            clients={clients}
            industryLabels={INDUSTRY_LABELS}
            sizeLabels={SIZE_LABELS}
            currentFilter={statusFilter}
          />
        )}

        {/* Footer note */}
        <p className="text-xs text-faint mt-6 text-center">
          Tip: drill into a client to access the existing assessment,
          synthesis, and roadmap engines. Archive hides without destroying;
          delete is sandbox-only.
        </p>
      </main>
    </div>
  );
}
