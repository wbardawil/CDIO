"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type InvitableRole =
  | "technical_reviewer"
  | "financial_approver"
  | "operator"
  | "collaborator"
  | "viewer";

interface PendingInvitation {
  id: string;
  email: string;
  role: InvitableRole;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
  clerk_invitation_id: string | null;
}

interface Props {
  orgId: string;
  invitations: PendingInvitation[];
}

const ROLE_LABEL: Record<InvitableRole, string> = {
  operator: "Operator (PM / assistant)",
  technical_reviewer: "Technical reviewer (Tech Lead / architect)",
  financial_approver: "Financial approver (CFO / controller)",
  collaborator: "Collaborator (co-CDIO, advisory)",
  viewer: "Viewer (read-only)",
};

export function InvitationsPanel({ orgId, invitations }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InvitableRole>("operator");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const active = invitations.filter((i) => !i.accepted_at && !i.revoked_at);
  const past = invitations.filter((i) => i.accepted_at || i.revoked_at);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await fetch(`/api/clients/${orgId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body?.error ?? `HTTP ${res.status}`);
        return;
      }
      setSuccess(
        body.delivered_by_email
          ? `Invitation sent to ${email.trim().toLowerCase()}.`
          : `User already in the system. They'll see ${orgIdLabel(orgId)} next time they sign in.`,
      );
      setEmail("");
      router.refresh();
    });
  };

  const handleRevoke = (invitationId: string) => {
    if (!confirm("Revoke this invitation? The email link stops working immediately.")) return;
    startTransition(async () => {
      const res = await fetch(`/api/clients/${orgId}/invitations/${invitationId}`, {
        method: "DELETE",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body?.error ?? `HTTP ${res.status}`);
        return;
      }
      router.refresh();
    });
  };

  return (
    <section className="mt-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
        Team access
      </p>
      <div className="rounded-lg border border-hair bg-raised p-5">
        <h2 className="text-base font-semibold text-ink">Invite a person</h2>
        <p className="mt-1 text-sm text-muted">
          Add an operator (PM / assistant) who drafts artifacts for your
          review, a technical reviewer (Tech Lead) for technical RAG +
          dependency validation, a financial approver (CFO) for spend +
          variance, a collaborator (co-CDIO, advisory), or a viewer
          (read-only). The invitee receives an email and joins this client
          at sign-up. The other approver roles are advisory in Year 1 —
          strategic_approver (you) remains the single sign-off until
          per-artifact routing lands.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[240px]">
            <label htmlFor="invite-email" className="block text-xs font-medium text-muted mb-1">
              Email
            </label>
            <input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-hair bg-paper px-3 py-2 text-sm text-ink focus:border-evergreen focus:outline-none"
              placeholder="someone@example.com"
              disabled={pending}
            />
          </div>
          <div>
            <label htmlFor="invite-role" className="block text-xs font-medium text-muted mb-1">
              Role
            </label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as InvitableRole)}
              className="rounded border border-hair bg-paper px-3 py-2 text-sm text-ink focus:border-evergreen focus:outline-none"
              disabled={pending}
            >
              <option value="operator">Operator</option>
              <option value="technical_reviewer">Technical reviewer</option>
              <option value="financial_approver">Financial approver</option>
              <option value="collaborator">Collaborator</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={pending || !email.trim()}
            className="rounded bg-evergreen px-4 py-2 text-sm font-medium text-white hover:bg-evergreen-deep disabled:opacity-50"
          >
            {pending ? "Sending…" : "Send invitation"}
          </button>
        </form>

        {error && (
          <p className="mt-3 rounded border border-brick/30 bg-brick/5 px-3 py-2 text-sm text-brick">
            {error}
          </p>
        )}
        {success && (
          <p className="mt-3 rounded border border-evergreen/30 bg-evergreen-soft px-3 py-2 text-sm text-evergreen-deep">
            {success}
          </p>
        )}
      </div>

      {active.length > 0 && (
        <div className="mt-4 rounded-lg border border-hair bg-raised p-5">
          <h3 className="text-sm font-semibold text-ink">Active invitations</h3>
          <ul className="mt-3 divide-y divide-hair">
            {active.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between py-2 gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{inv.email}</p>
                  <p className="text-xs text-muted">
                    {ROLE_LABEL[inv.role]} · invited{" "}
                    {new Date(inv.created_at).toLocaleDateString()} · expires{" "}
                    {new Date(inv.expires_at).toLocaleDateString()}
                    {inv.clerk_invitation_id ? " · email sent" : " · awaiting sign-in"}
                  </p>
                </div>
                <button
                  onClick={() => handleRevoke(inv.id)}
                  disabled={pending}
                  className="shrink-0 rounded border border-hair bg-paper px-3 py-1 text-xs text-muted hover:border-brick hover:text-brick disabled:opacity-50"
                >
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {past.length > 0 && (
        <div className="mt-4 rounded-lg border border-hair bg-raised p-5">
          <h3 className="text-sm font-semibold text-ink">Past invitations</h3>
          <ul className="mt-3 divide-y divide-hair">
            {past.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between py-2 gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{inv.email}</p>
                  <p className="text-xs text-muted">
                    {ROLE_LABEL[inv.role]} ·{" "}
                    {inv.accepted_at
                      ? `accepted ${new Date(inv.accepted_at).toLocaleDateString()}`
                      : inv.revoked_at
                        ? `revoked ${new Date(inv.revoked_at).toLocaleDateString()}`
                        : "unknown state"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function orgIdLabel(orgId: string): string {
  // Short prefix for human-readable confirm messages without name lookup.
  return `client #${orgId.slice(0, 8)}`;
}
