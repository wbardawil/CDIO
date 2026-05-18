// ============================================================
// WorkspaceShell — the single shared chrome for every
// client-scoped screen (workspace, audits, dashboard, …).
//
// This component is the concrete implementation of
// docs/EXPERIENCE-SPINE.md Law 1 ("never lost, never
// dead-ended") and Law 4 ("visible progress; one place").
// One shell, used everywhere, is what makes the product
// "feel like one thing" instead of a pile of separate screens.
//
// Deliberately presentational and prop-driven: NO "use client",
// NO server-only imports. That lets the client-rendered legacy
// dashboard (the canonical dead-end this spine exists to kill)
// use the exact same chrome as the server-rendered workspace.
// ============================================================

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { SandboxBanner } from "./sandbox-banner";

export type WorkspaceSection =
  | "overview"
  | "dashboard"
  | "charter"
  | "initiatives"
  | "selections"
  | "audits"
  | "cadence";

interface NavItem {
  key: WorkspaceSection;
  label: string;
  href: (orgId: string) => string;
}

// The ONE section nav, identical on every client-scoped screen.
// Moving between Overview / Dashboard / Audits / … feels like one
// place because it literally is the same nav, not per-page chrome.
const NAV: NavItem[] = [
  { key: "overview", label: "Overview", href: (o) => `/clients/${o}` },
  { key: "dashboard", label: "Dashboard", href: (o) => `/dashboard?org=${o}` },
  { key: "charter", label: "Charter", href: (o) => `/clients/${o}/charter` },
  {
    key: "initiatives",
    label: "Initiatives",
    href: (o) => `/clients/${o}/initiatives`,
  },
  {
    key: "selections",
    label: "Selections",
    href: (o) => `/clients/${o}/selections`,
  },
  { key: "audits", label: "Audits", href: (o) => `/clients/${o}/audits` },
  { key: "cadence", label: "Cadence", href: (o) => `/clients/${o}/cadence` },
];

export interface WorkspaceShellProps {
  orgId: string;
  orgName: string;
  /** Leaf crumb + the words that describe where the user is. */
  where: string;
  /** One-line client state: "Small · Healthcare · Next: collect responses". */
  clientLine?: string;
  /** Optional crumbs between {Client} and {Where} (e.g. Audits ‹ this audit). */
  trail?: { label: string; href: string }[];
  /** Which section nav item is current. */
  activeSection?: WorkspaceSection;
  isSandbox?: boolean;
  practitionerName?: string;
  /** Reading-column width. Long-form deliverables read better narrow. */
  width?: "wide" | "narrow";
  children: React.ReactNode;
}

export function WorkspaceShell({
  orgId,
  orgName,
  where,
  clientLine,
  trail = [],
  activeSection,
  isSandbox = false,
  practitionerName,
  width = "wide",
  children,
}: WorkspaceShellProps) {
  const main = width === "narrow" ? "max-w-4xl" : "max-w-7xl";

  return (
    <div className="min-h-screen bg-paper">
      <SandboxBanner isSandbox={isSandbox} variant="workspace" />

      {/* Line 1 — orientation. "Your clients" and "{Client}" are the
          always-available way back. This alone kills the dead-end. */}
      <header className="bg-raised border-b border-hair print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm min-w-0"
          >
            <Link
              href="/clients"
              className="text-muted hover:text-ink whitespace-nowrap"
            >
              Your clients
            </Link>
            <span className="text-faint" aria-hidden>
              ‹
            </span>
            <Link
              href={`/clients/${orgId}`}
              className="text-muted hover:text-ink whitespace-nowrap"
            >
              {orgName}
            </Link>
            {trail.map((t) => (
              <span key={t.href} className="flex items-center gap-2 min-w-0">
                <span className="text-faint" aria-hidden>
                  ‹
                </span>
                <Link
                  href={t.href}
                  className="text-muted hover:text-ink whitespace-nowrap"
                >
                  {t.label}
                </Link>
              </span>
            ))}
            <span className="text-faint" aria-hidden>
              ‹
            </span>
            <span
              className="font-semibold text-ink truncate"
              aria-current="page"
            >
              {where}
            </span>
          </nav>
          <div className="flex items-center gap-4 shrink-0">
            {practitionerName && (
              <span className="text-sm text-muted hidden sm:inline">
                {practitionerName}
              </span>
            )}
            <UserButton />
          </div>
        </div>
      </header>

      {/* Line 2 — the client + the one next thing for this client. */}
      <div className="bg-raised border-b border-hair print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-ink">{orgName}</h1>
            {clientLine && (
              <span className="text-sm text-muted">{clientLine}</span>
            )}
          </div>
        </div>
      </div>

      {/* The single consistent section nav. Same everywhere. */}
      <div className="bg-raised border-b border-hair print:hidden">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-6 overflow-x-auto" aria-label="Sections">
            {NAV.map((item) => {
              const isActive = item.key === activeSection;
              const base =
                "py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors";
              return (
                <Link
                  key={item.key}
                  href={item.href(orgId)}
                  aria-current={isActive ? "page" : undefined}
                  className={
                    isActive
                      ? `${base} border-evergreen text-evergreen`
                      : `${base} border-transparent text-muted hover:text-evergreen hover:border-evergreen`
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <main className={`${main} mx-auto px-6 py-8`}>{children}</main>
    </div>
  );
}
