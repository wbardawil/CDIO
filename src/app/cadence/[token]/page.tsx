import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/db/supabase";
import { MODULE_NAMES } from "@/types";
import {
  type Initiative,
  computeInitiativeProgress,
  INITIATIVE_DOMAIN_LABEL,
  INITIATIVE_STATUS_LABEL,
} from "@/types/initiative";
import {
  type Selection,
  SELECTION_DOMAIN_LABEL,
  SELECTION_STATUS_LABEL,
} from "@/types/selection";
import type { CadenceToken, StatusReport } from "@/types/cadence";

// Public Cadence view. Token-authenticated; no Clerk session.
// Read-only. The CEO / client team sees the engagement state
// here without ever logging in.

export default async function PublicCadencePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const db = createServiceClient();

  const { data: tokenRow } = await db
    .from("cadence_tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow) notFound();
  const t = tokenRow as CadenceToken;

  if (t.revoked_at) {
    return (
      <ExpiredOrRevokedNotice
        kind="revoked"
        revokedAt={t.revoked_at}
      />
    );
  }
  if (t.expires_at && new Date(t.expires_at).getTime() < Date.now()) {
    return (
      <ExpiredOrRevokedNotice kind="expired" revokedAt={t.expires_at} />
    );
  }

  // Stamp last_used_at (best-effort).
  await db
    .from("cadence_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", t.id);

  const { data: org } = await db
    .from("organizations")
    .select("id, name, industry, size_category, employee_count")
    .eq("id", t.org_id)
    .single();
  if (!org) notFound();

  const { data: practitioner } = await db
    .from("practitioners")
    .select("name, email")
    .eq("id", t.practitioner_id)
    .maybeSingle();

  const { data: latestPublished } = await db
    .from("status_reports")
    .select("*")
    .eq("org_id", t.org_id)
    .eq("status", "published")
    .order("period_end", { ascending: false })
    .limit(1)
    .maybeSingle();

  const report = latestPublished as StatusReport | null;

  const { data: initiativesData } = await db
    .from("initiatives")
    .select("*")
    .eq("org_id", t.org_id)
    .in("status", ["active", "blocked", "done"])
    .order("status", { ascending: true })
    .order("created_at", { ascending: false });
  const initiatives = (initiativesData ?? []) as Initiative[];

  const { data: selectionsData } = await db
    .from("selections")
    .select("*")
    .eq("org_id", t.org_id)
    .in("status", ["recommended", "decided"])
    .order("decided_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(8);
  const selections = (selectionsData ?? []) as Selection[];

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <header className="bg-white border-b border-gray-200 print:border-b-0">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Engagement Cadence
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
            {org.name}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {practitioner?.name ?? "Your fractional CDIO"}
            {practitioner?.email ? ` · ${practitioner.email}` : ""}
          </p>
          <p className="text-xs text-gray-400 mt-3 italic">
            Read-only view. {t.label ?? "Cadence link"}.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-10">
        {/* Latest status report */}
        {report ? (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
              Latest Status Report — {report.title}
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-base text-gray-900 leading-relaxed">
                {report.headline}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                {report.payload.initiative_summary && (
                  <Stat
                    label="Initiatives"
                    value={`${report.payload.initiative_summary.active} active · ${report.payload.initiative_summary.done} done`}
                  />
                )}
                {report.payload.decision_summary &&
                  report.payload.decision_summary.total > 0 && (
                    <Stat
                      label="Decisions"
                      value={`${report.payload.decision_summary.decided} decided · ${report.payload.decision_summary.recommended} pending`}
                    />
                  )}
              </div>

              {(report.payload.wins?.length ?? 0) > 0 && (
                <ListBlock
                  title="Wins this period"
                  items={report.payload.wins ?? []}
                  color="emerald"
                />
              )}
              {(report.payload.blockers?.length ?? 0) > 0 && (
                <ListBlock
                  title="Blockers"
                  items={report.payload.blockers ?? []}
                  color="red"
                />
              )}
              {(report.payload.next_period_focus?.length ?? 0) > 0 && (
                <ListBlock
                  title="Next period focus"
                  items={report.payload.next_period_focus ?? []}
                  color="blue"
                />
              )}

              <p className="text-[11px] text-gray-400 mt-5">
                Period: {report.period_start} → {report.period_end}
                {report.published_at
                  ? ` · Published ${report.published_at.slice(0, 10)}`
                  : ""}
              </p>
            </div>
          </section>
        ) : (
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              No status report published yet
            </h2>
            <p className="text-sm text-gray-500">
              Your fractional CDIO will publish the first Status Report at the
              end of the first reporting period. The Cadence link will refresh
              automatically when they do.
            </p>
          </section>
        )}

        {/* Initiatives */}
        {initiatives.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
              Active Initiatives
            </h2>
            <ul className="space-y-3">
              {initiatives.map((it) => {
                const progress = computeInitiativeProgress(it.steps);
                const statusColor =
                  it.status === "done"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : it.status === "blocked"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-blue-50 text-blue-700 border-blue-200";
                return (
                  <li
                    key={it.id}
                    className="bg-white rounded-xl border border-gray-200 p-5"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-gray-900">
                          {it.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {INITIATIVE_DOMAIN_LABEL[it.domain]}
                          {it.module_number
                            ? ` · M${it.module_number} · ${MODULE_NAMES[it.module_number] ?? ""}`
                            : ""}
                          {it.target_completion_date
                            ? ` · Target ${it.target_completion_date}`
                            : ""}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusColor}`}
                      >
                        {INITIATIVE_STATUS_LABEL[it.status]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">
                      {it.goal}
                    </p>
                    {progress.total > 0 && (
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>
                            {progress.done} of {progress.total} milestones
                          </span>
                          <span>{progress.percent}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${progress.percent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Selections */}
        {selections.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
              Recent Decisions
            </h2>
            <ul className="space-y-3">
              {selections.map((s) => (
                <li
                  key={s.id}
                  className="bg-white rounded-xl border border-gray-200 p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {s.title}
                    </p>
                    <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-blue-50 text-blue-700 border-blue-200">
                      {SELECTION_DOMAIN_LABEL[s.domain]} ·{" "}
                      {SELECTION_STATUS_LABEL[s.status]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{s.question}</p>
                  {s.recommendation && (
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {s.recommendation}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="text-[11px] text-gray-400 leading-relaxed">
          This Cadence link is read-only. To request a change, contact your
          fractional CDIO directly. Generated by AI-CDIO. See the{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/ai-disclaimer" className="underline">
            AI Disclaimer
          </Link>{" "}
          for data-handling details.
        </p>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}

function ListBlock({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: "emerald" | "red" | "blue";
}) {
  const cls = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-900",
    red: "bg-red-50 border-red-200 text-red-900",
    blue: "bg-blue-50 border-blue-200 text-blue-900",
  }[color];
  return (
    <div className={`mt-4 border rounded-lg p-3 ${cls}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide mb-1.5">
        {title}
      </p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

function ExpiredOrRevokedNotice({
  kind,
  revokedAt,
}: {
  kind: "expired" | "revoked";
  revokedAt: string;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl border border-amber-200 p-10 max-w-md text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Cadence link {kind}
        </h1>
        <p className="text-sm text-gray-600 mb-1">
          This link is no longer active.
        </p>
        <p className="text-xs text-gray-500">
          {kind === "expired"
            ? `Expired ${revokedAt.slice(0, 10)}.`
            : `Revoked ${revokedAt.slice(0, 10)}.`}{" "}
          Contact your fractional CDIO for a fresh link.
        </p>
      </div>
    </div>
  );
}
