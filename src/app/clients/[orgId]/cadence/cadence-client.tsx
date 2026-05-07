"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  CadenceToken,
  StatusReport,
  StatusReportPayload,
} from "@/types/cadence";

interface CadenceClientProps {
  orgId: string;
  orgName: string;
  initialReports: StatusReport[];
  initialTokens: CadenceToken[];
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function firstOfMonthISO(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  return d.toISOString().slice(0, 10);
}

export function CadenceClient({
  orgId,
  orgName,
  initialReports,
  initialTokens,
}: CadenceClientProps) {
  const router = useRouter();
  const [reports, setReports] = useState<StatusReport[]>(initialReports);
  const [tokens, setTokens] = useState<CadenceToken[]>(initialTokens);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);

  const generateThisMonth = async () => {
    setBusy(true);
    setError(null);
    try {
      const now = new Date();
      const periodStart = firstOfMonthISO(now);
      const periodEnd = todayISO();
      const res = await fetch("/api/status-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_id: orgId,
          period_start: periodStart,
          period_end: periodEnd,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? `HTTP ${res.status}`);
      }
      const j = await res.json();
      setReports((prev) => [j.report, ...prev]);
      setEditingReportId(j.report.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generate failed");
    } finally {
      setBusy(false);
    }
  };

  const issueToken = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/cadence-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_id: orgId,
          label: `${orgName} Cadence link`,
          expires_in_days: 180,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? `HTTP ${res.status}`);
      }
      const j = await res.json();
      setTokens((prev) => [j.cadence_token, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Issue failed");
    } finally {
      setBusy(false);
    }
  };

  const cadenceUrl = (token: string) =>
    typeof window !== "undefined"
      ? `${window.location.origin}/cadence/${token}`
      : `/cadence/${token}`;

  const copyLink = async (token: string) => {
    try {
      await navigator.clipboard.writeText(cadenceUrl(token));
    } catch {
      // ignore - user can copy manually from the displayed value
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT: Cadence tokens */}
      <section className="lg:col-span-1 space-y-3">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">
            Cadence link
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Generate a token-based magic link. Send it to your client. They see
            this engagement&apos;s read-only view without an account.
          </p>
          <button
            type="button"
            onClick={issueToken}
            disabled={busy}
            className="w-full px-3 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? "Issuing..." : "+ Issue new Cadence link (180-day expiry)"}
          </button>
        </div>

        {tokens.length > 0 && (
          <ul className="space-y-2">
            {tokens.map((t) => (
              <li
                key={t.id}
                className="bg-white rounded-xl border border-gray-200 p-3 text-xs"
              >
                <p className="font-semibold text-gray-900 mb-1">
                  {t.label ?? "Cadence link"}
                </p>
                <p className="text-gray-500 mb-2">
                  Issued {t.created_at.slice(0, 10)}
                  {t.expires_at ? ` · Expires ${t.expires_at.slice(0, 10)}` : ""}
                  {t.last_used_at
                    ? ` · Last opened ${t.last_used_at.slice(0, 10)}`
                    : " · Not yet opened"}
                </p>
                <code className="block w-full bg-gray-50 border border-gray-200 rounded p-1.5 text-[10px] break-all mb-2">
                  {cadenceUrl(t.token)}
                </code>
                <button
                  type="button"
                  onClick={() => copyLink(t.token)}
                  className="text-blue-700 hover:underline"
                >
                  Copy link
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* RIGHT: Status reports */}
      <section className="lg:col-span-2 space-y-3">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Status reports
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Auto-generate from live engagement state. Edit the headline + wins +
                blockers + next-period focus before publishing.
              </p>
            </div>
            <button
              type="button"
              onClick={generateThisMonth}
              disabled={busy}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {busy ? "Generating..." : "+ Generate this month"}
            </button>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {error}
          </div>
        )}

        {reports.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-500">
              No status reports yet. Generate one for this month.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {reports.map((r) => (
              <ReportCard
                key={r.id}
                report={r}
                isEditing={editingReportId === r.id}
                onEdit={() => setEditingReportId(r.id)}
                onCancel={() => setEditingReportId(null)}
                onSaved={(updated) => {
                  setReports((prev) =>
                    prev.map((x) => (x.id === updated.id ? updated : x))
                  );
                  setEditingReportId(null);
                  router.refresh();
                }}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ReportCard({
  report,
  isEditing,
  onEdit,
  onCancel,
  onSaved,
}: {
  report: StatusReport;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSaved: (r: StatusReport) => void;
}) {
  const [headline, setHeadline] = useState(report.headline);
  const [wins, setWins] = useState((report.payload.wins ?? []).join("\n"));
  const [blockers, setBlockers] = useState(
    (report.payload.blockers ?? []).join("\n")
  );
  const [focus, setFocus] = useState(
    (report.payload.next_period_focus ?? []).join("\n")
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async (publish: boolean) => {
    setSaving(true);
    setErr(null);
    try {
      const payload: Partial<StatusReportPayload> = {
        wins: wins
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
          .slice(0, 10),
        blockers: blockers
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
          .slice(0, 10),
        next_period_focus: focus
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
          .slice(0, 10),
      };
      const res = await fetch(`/api/status-reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline,
          payload,
          status: publish ? "published" : "draft",
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? `HTTP ${res.status}`);
      }
      const j = await res.json();
      onSaved(j.report as StatusReport);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const statusBadge =
    report.status === "published"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <li className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-base font-semibold text-gray-900">
            {report.title}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {report.period_start} → {report.period_end}
            {report.published_at
              ? ` · Published ${report.published_at.slice(0, 10)}`
              : ""}
          </p>
        </div>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge}`}
        >
          {report.status === "published" ? "Published" : "Draft"}
        </span>
      </div>

      {isEditing ? (
        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
              Headline
            </label>
            <textarea
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ListField
              label="Wins"
              value={wins}
              onChange={setWins}
              placeholder="One per line"
            />
            <ListField
              label="Blockers"
              value={blockers}
              onChange={setBlockers}
              placeholder="One per line"
            />
            <ListField
              label="Next period focus"
              value={focus}
              onChange={setFocus}
              placeholder="One per line"
            />
          </div>
          {err && (
            <p className="text-xs text-red-600">{err}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => save(false)}
              disabled={saving}
              className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save draft"}
            </button>
            <button
              type="button"
              onClick={() => save(true)}
              disabled={saving}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Publishing..." : "Publish to Cadence"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <p className="text-sm text-gray-700 leading-relaxed">
            {report.headline}
          </p>
          {report.payload.initiative_summary && (
            <p className="text-xs text-gray-500 mt-2">
              Initiatives: {report.payload.initiative_summary.active} active ·{" "}
              {report.payload.initiative_summary.done} done ·{" "}
              {report.payload.initiative_summary.blocked} blocked ·{" "}
              {report.payload.initiative_summary.total} total
            </p>
          )}
          {report.payload.decision_summary &&
            report.payload.decision_summary.total > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Decisions: {report.payload.decision_summary.decided} decided ·{" "}
                {report.payload.decision_summary.recommended} pending ·{" "}
                {report.payload.decision_summary.open} open
              </p>
            )}
          <button
            type="button"
            onClick={onEdit}
            className="mt-3 text-xs text-blue-700 hover:underline"
          >
            Edit and {report.status === "published" ? "republish" : "publish"} →
          </button>
        </div>
      )}
    </li>
  );
}

function ListField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
      />
    </div>
  );
}
