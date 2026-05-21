# Sprint S1 — Foundation: operator role, inbox, approval queue

**Status:** scoping (2026-05-20)
**Branch / worktree:** `claude/exciting-cartwright-f8fb4b`
**Migration:** schema-v23
**Sprint of:** 3 in the journey-map workstream (S1 foundation → S2 workflow scaffolding → S3 intelligence + reframe)

---

## 1. Why this sprint exists

The product thesis (locked 2026-05-20 in prior session): **using AI-CDIO should make any assistant an IT project manager. Period.**

Today the platform has zero scaffolding for the "any assistant" half of that thesis. There's no operator persona, no daily-entry surface for a non-CDIO user, no approval round-trip between the operator and the CDIO who owns the engagement. Without these three things the journey map breaks at Day 1 — the assistant can't even log in.

S1 ships the foundation. It is intentionally **non-visual** (no wizards, no Coach Mode, no drift detection) — those are S2 and S3. S1 is the scaffold those layers stand on.

## 2. What "done" means for S1

A CDIO can invite a person by email to a specific client. That person signs up via the Clerk invitation link, lands in `/clients/[orgId]/inbox`, and sees a meaningful daily-entry surface scoped to that one client. They can draft any artifact that already exists today (initiative, status report, decision, audit) and submit it for approval. The CDIO sees the submission in their approval queue, opens it in the existing edit screen, and either approves it (with or without edits) or returns it with comments. Every event in that round-trip lands in an append-only `approval_events` table so S3's Coach Mode has a clean source of truth.

A successful end-to-end smoke test (Task #10) ships the sprint. No design polish in S1 — utility UI only.

## 3. Decisions locked

### 3.1 Operator identity = extension of existing `practitioners` table
**Decision:** Operators are first-class Clerk users with their own `practitioners` row, scoped to a specific client by a `practitioner_clients` row with `role='operator'`.

**Alternative considered:** a separate `client_users` table with its own auth path. Rejected — doubles the auth surface area, doubles the access-check plumbing, gives nothing back. The label "practitioner" is just a name; the table holds any logged-in human.

**Implication:** The `practitioner_clients.role` enum expands from `('owner', 'collaborator', 'viewer')` to `('owner', 'collaborator', 'viewer', 'operator')`. All existing rows stay valid (the check constraint widens, never narrows). The existing `assertPractitionerOwnsOrg` helper continues to work unchanged for read access; new helpers (`assertCanSubmit`, `assertCanApprove`) wrap it for write-side role gating.

### 3.2 Invitation = Clerk invitation + local `pending_invitations` row
**Decision:** Two-table flow.

1. CDIO POSTs `/api/clients/[orgId]/invitations` with `{ email, role }`. Server (a) inserts a `pending_invitations` row keyed by `(org_id, lower(email))`, (b) calls Clerk `invitations.createInvitation({ emailAddress, publicMetadata: { invited_to_org_id, invited_as_role } })`, (c) Clerk sends the invite email (no Resend dependency for this).
2. Invitee clicks the email link → Clerk SignUp flow → returns to the app.
3. First app request: `ensurePractitioner()` creates the `practitioners` row (existing). New step: after creation, look up `pending_invitations` rows for the user's verified email; for each match still `accepted_at IS NULL`, insert a `practitioner_clients` row and stamp `accepted_at` on the invitation.
4. Operator now sees `/clients/[orgId]/inbox` and the client appears in their `/clients` list.

**Alternative considered:** rely solely on Clerk `publicMetadata`. Rejected — Clerk's publicMetadata is eventually consistent on the org's side and brittle if Clerk's webhook is delayed; the `pending_invitations` table is the durable source of truth, Clerk is the delivery channel.

**Open question for /cso review:** is email match case-insensitive + verified-email-only? (Pre-answer: yes, both. The `pending_invitations.email` column is lowercased on write; the match query joins on `user.primaryEmailAddress.verification.status = 'verified'`.)

### 3.3 Approval queue = per-artifact status columns + generic event stream
**Decision:** Hybrid. Each artifact table gets:
- `approval_status text NOT NULL DEFAULT 'approved' CHECK (approval_status IN ('draft', 'pending', 'approved', 'returned'))`
- `submitted_by_practitioner_id uuid REFERENCES practitioners(id)`
- `submitted_at timestamptz`
- `approved_by_practitioner_id uuid REFERENCES practitioners(id)`
- `approved_at timestamptz`

A new generic table holds the audit trail:
- `approval_events (id, org_id, artifact_type, artifact_id, event_type, actor_practitioner_id, payload jsonb, created_at)`
- `event_type IN ('submitted','approved','approved_with_edits','returned','withdrawn')`
- `payload` carries the diff or comment

**Why hybrid:** per-artifact columns keep the FK constraints tight and let queries filter on status without a join. The generic event table gives S3's Coach Mode a single stream to diff against.

**Naming care — existing `status` column collision:**
- `initiatives.status` already exists with values `('active','blocked','done','cancelled')` — that's **lifecycle**, not approval. Keep it. The new column is `approval_status` (distinct name).
- `status_reports.status` already exists with values `('draft','published')` — that's **visibility on the Cadence link**, not approval. Keep it. The new column is `approval_status` (distinct).
- `decisions` has no existing status column — clean add.
- `audits` and `selections` — verify in the migration; use `approval_status` regardless to keep the column name consistent across all artifact tables.

**Backwards-compatibility default:** `approval_status DEFAULT 'approved'`. Existing rows (all CDIO-authored) become `approved` automatically — no backfill query needed. New artifacts created by an `owner`-role user are also auto-approved at INSERT (the API layer stamps `approved_by_practitioner_id = self`). Operators are the only role whose inserts default to `draft`.

### 3.4 Routes
- `POST /api/clients/[orgId]/invitations` — CDIO invites operator. Role gate: owner only.
- `GET /api/clients/[orgId]/invitations` — list pending invitations for an org. Role gate: owner only.
- `DELETE /api/clients/[orgId]/invitations/[id]` — revoke. Role gate: owner only.
- `POST /api/clients/[orgId]/[artifact-kind]/[id]/submit` — operator submits draft → pending. Role gate: submitter is owner/operator on this org, and is the artifact's `submitted_by` (or null).
- `POST /api/clients/[orgId]/[artifact-kind]/[id]/approve` — owner approves. Role gate: owner only.
- `POST /api/clients/[orgId]/[artifact-kind]/[id]/return` — owner returns with comment. Role gate: owner only.
- `GET /clients/[orgId]/inbox` — daily-entry surface (operator + owner both see it, with role-aware sections).
- `GET /clients/[orgId]/approvals` — alias view that filters inbox to the approver lens (owners only).

`[artifact-kind]` in S1 = `initiatives | status-reports | decisions | audits | selections`. The action endpoints share a small generic handler (`src/app/api/_lib/approval-actions.ts`) because the logic is identical except for the artifact table.

### 3.5 Out of S1 (deferred to S2/S3)
- Guided wizards for Decision Package / Status Report / Risk Register (S2 #4)
- Smart templates (S2 #5)
- Methodology-translation UI layer (S2 #6)
- Coach Mode (S3 #7)
- Next-action surfacing (S3 #8)
- Status drift detection (S3 #9)
- Portfolio command-center reframe (S3 #10)
- Risk Register schema (not yet shipped; will land in S2)

## 4. Schema-v23 column plan (full list)

```
-- 1. widen role enum
alter table practitioner_clients drop constraint practitioner_clients_role_check;
alter table practitioner_clients add constraint practitioner_clients_role_check
  check (role in ('owner','collaborator','viewer','operator'));

-- 2. invitation provenance on the membership row
alter table practitioner_clients
  add column if not exists invited_by_practitioner_id uuid references practitioners(id),
  add column if not exists invited_at timestamptz,
  add column if not exists accepted_at timestamptz;

-- 3. pending_invitations (durable, email-keyed)
create table if not exists pending_invitations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  org_id uuid not null references organizations(id) on delete cascade,
  invited_by_practitioner_id uuid not null references practitioners(id) on delete restrict,
  email text not null,  -- always lowercased
  role text not null check (role in ('collaborator','viewer','operator')),
  clerk_invitation_id text,  -- for revoke + dedup
  accepted_at timestamptz,
  revoked_at timestamptz,
  expires_at timestamptz not null default (now() + interval '30 days'),
  unique (org_id, email, role)  -- one pending invite per (org, email, role); re-invite revokes the old one
);
create index pending_invitations_email_idx on pending_invitations(email) where accepted_at is null and revoked_at is null;

-- 4. approval columns on each artifact table
-- repeated for: initiatives, status_reports, decisions, audits, selections
alter table <T>
  add column if not exists approval_status text not null default 'approved'
    check (approval_status in ('draft','pending','approved','returned')),
  add column if not exists submitted_by_practitioner_id uuid references practitioners(id),
  add column if not exists submitted_at timestamptz,
  add column if not exists approved_by_practitioner_id uuid references practitioners(id),
  add column if not exists approved_at timestamptz;
create index <T>_approval_status_idx on <T>(org_id, approval_status) where approval_status in ('draft','pending','returned');

-- 5. approval_events (append-only audit)
create table if not exists approval_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  org_id uuid not null references organizations(id) on delete cascade,
  artifact_type text not null check (artifact_type in ('initiative','status_report','decision','audit','selection')),
  artifact_id uuid not null,  -- polymorphic, no FK
  event_type text not null check (event_type in ('submitted','approved','approved_with_edits','returned','withdrawn')),
  actor_practitioner_id uuid not null references practitioners(id) on delete restrict,
  payload jsonb not null default '{}'::jsonb
);
create index approval_events_artifact_idx on approval_events(artifact_type, artifact_id, created_at desc);
create index approval_events_org_idx on approval_events(org_id, created_at desc);

-- 6. grants + RLS lockdown (service_role full; authenticated revoked; per existing v18 pattern)
grant all on pending_invitations, approval_events to service_role;
alter table pending_invitations enable row level security;
alter table approval_events enable row level security;
-- RLS policy: service role full, others none (matches existing v18 lockdown)
```

## 5. Done criteria (smoke test gate)

- [ ] CDIO invites operator by email → operator receives Clerk email → operator signs up
- [ ] Operator's first sign-in lands them on `/clients/[orgId]/inbox` for the invited org
- [ ] Operator can create an initiative draft → submit → state = `pending`
- [ ] Approval queue shows submission on owner's `/clients/[orgId]/approvals`
- [ ] Owner can return with a comment → state = `returned` → operator sees it in "Returned with edits"
- [ ] Owner can approve-with-edits → state = `approved` → operator sees the edit diff (S1: raw diff is fine, S3 will style it)
- [ ] `approval_events` has one row per state transition with the expected `event_type`
- [ ] Operator can NOT approve (403). Viewer can NOT submit (403). Cross-org access still 403.
- [ ] Existing CDIO-authored artifacts unchanged (`approval_status='approved'`, no submission UX shown)

## 6. /plan-eng-review findings (2026-05-20, inline)

Reviewed against the existing codebase (schema v22, current routes, `assertPractitionerOwnsOrg`). Findings are numbered E#; each lists status + remediation.

**E1 — `/clients` list query naturally includes operators (verified, no change needed).**
`src/app/clients/page.tsx` queries `practitioner_clients` by `practitioner_id` with no role filter. Operators with `role='operator'` appear automatically. **Status:** OK, no change.

**E2 — Lifecycle vs approval status: no column collision (verified).**
`initiatives.status` = active|blocked|done|cancelled (lifecycle). `status_reports.status` = draft|published (Cadence visibility). `audits.status` = intake|ready|running|complete|cancelled (lifecycle). `selections.status` = open|recommended|decided|cancelled (lifecycle). All distinct from approval. **Status:** confirmed — use `approval_status` as the new column name everywhere.

**E3 — Status-report dual-status semantics need an explicit rule (UX, S1).**
A status_report row has BOTH `status` (Cadence visibility) AND `approval_status` (workflow). Rule for S1: **approval ≠ publish.** Approving a pending status_report does NOT auto-publish to Cadence; the owner must explicitly click Publish. The UI must surface both controls. **Remediation:** call this out on the status_report edit screen with two distinct buttons; document in the route handler.

**E4 — Operator authorship gate is missing from the scoping doc (closing the gap).**
Beyond role gates, the API must check artifact ownership for operators. Rule: an operator can only act on artifacts where `submitted_by_practitioner_id = self OR submitted_by_practitioner_id IS NULL AND approval_status = 'draft'`. Without this, Operator A could submit Operator B's draft. **Remediation:** add `assertCanActOnArtifact(orgId, artifactKind, artifactId, action)` helper used by submit / withdraw / edit endpoints. Owners bypass the author check.

**E5 — Withdraw state transition needs clarification.**
`approval_status` enum is `('draft','pending','approved','returned')` but `event_type` includes `'withdrawn'`. Resolution: withdrawing a pending submission sets `approval_status` back to `'draft'` (the row is still the operator's WIP). The withdraw event is captured in `approval_events`; the row state reflects the new edit state. **Remediation:** document explicitly in the state machine section.

**E6 — Membership-row conflict on invitation pickup.**
`practitioner_clients` PK is `(practitioner_id, org_id)`. If an invited user already has a row for that org (rare — they were invited twice by different practitioners, or as a different role), pickup will violate the PK. **Remediation:** pickup uses `INSERT ... ON CONFLICT (practitioner_id, org_id) DO NOTHING`. The pending_invitation gets marked `accepted_at` either way, and we log a `membership_pre_existing` note in the event stream. We do NOT silently upgrade or downgrade their role.

**E7 — Clerk "user already exists" path.**
If the invited email already has a Clerk account on this Clerk instance (they're an operator for another practitioner, etc.), `clerkClient.invitations.createInvitation` returns an error. **Remediation:** catch that specific error, skip the email send, still write the `pending_invitations` row. The user picks it up on their next sign-in (no email needed — they already use the system). UI surfaces: "User already has an account; we've added the org to their workspace. They'll see it next time they sign in."

**E8 — Pickup race: window between sign-up and first app request.**
Theoretically the user could sign up via Clerk but never load an app page. Until they do, `practitioner_clients` is empty for that org. **Status:** acceptable. `ensurePractitioner` runs on every authenticated app request and pickup is appended to it. Empty state is correct until they land on `/clients`. No mitigation needed in S1; if it becomes a real problem, S2 can add a Clerk webhook.

**E9 — Generic action handler is state-machine-only.**
The shared `_lib/approval-actions.ts` handles state transitions and audit events ONLY. Per-artifact validation (e.g. status_report period must be present before submit) lives in the artifact's existing PATCH endpoint, which runs BEFORE the submit endpoint. **Remediation:** document this separation; the submit endpoint validates the state transition is legal but does not re-validate content.

**E10 — `approval_events.artifact_id` is intentionally polymorphic (no FK).**
Org cascade-delete cleans up events when the org is deleted. Artifact-level deletes orphan events — by design, events are immutable audit history. **Status:** OK, document as expected.

**E11 — Index plan supports inbox queries.**
Per-table partial index `<T>_approval_status_idx on <T>(org_id, approval_status) WHERE approval_status IN ('draft','pending','returned')` is the inbox query path. Each table is queried with `(org_id, approval_status, submitted_by_practitioner_id)`. 5 tables × Promise.all on a single org = sub-100ms for realistic counts. **Status:** OK as planned.

**E12 — Membership revocation is out of S1 scope.**
Once a `practitioner_clients` row exists, revoking access requires deleting the row (or adding a `revoked_at` column — S2 territory). S1 does NOT ship a revoke-membership UI. Owners can DELETE the row manually if needed. **Status:** documented constraint; not a blocker for the smoke test.

**E13 — Migration idempotency.**
v23 will be re-runnable. Pattern: DROP + recreate the role check constraint; `ADD COLUMN IF NOT EXISTS` for columns; `CREATE TABLE IF NOT EXISTS` for new tables; `CREATE INDEX IF NOT EXISTS` for indexes. Matches v18/v21/v22. **Status:** OK as planned.

**E14 — RLS lockdown follows v18 pattern.**
New tables get `enable row level security` + a single service-role-full-access policy (mirrors v14, v16). The authenticated role is revoked at v18; new tables inherit that posture. **Status:** OK; explicit `GRANT ALL ... TO service_role` for each new table, no grant to anon/authenticated.

**E15 — Decision packages mapping.**
The scoping doc lists `decisions` as an approval-eligible artifact, but the existing `decisions` table is the leadership-decisions tracker (decided_at, actual_outcome). Decision Packages (the artifact CEOs sign off on) are derived from `selections.recommendation` text. **Resolution:** S1 treats `selections` as the Decision Package surrogate (it already represents the decision matrix). `decisions` is owner-private (lifecycle outcome tracker) — give it `approval_status='approved'` default on insert, do NOT expose to operators in S1. **Remediation:** drop `decisions` from the operator-submittable list. Operator-submittable artifacts = `initiatives | status_reports | selections | audits`.

### Net change to the plan from review

- Operator-submittable list trims from 5 to 4: `initiatives | status_reports | selections | audits` (drop `decisions`).
- Add `assertCanActOnArtifact` to S1 scope (rolled into Task #9).
- Add explicit dual-status rule for `status_reports` to S1 UX (approve ≠ publish).
- All other findings are documentation, not code changes.

## 7. /cso findings (2026-05-20, inline)

STRIDE-style review of the invitation, role, and approval surface. Each finding is rated **Severity** (Critical / High / Medium / Low / Info) + remediation.

**C1 [High] — Email match MUST require Clerk-verified email at pickup.**
Pickup matches `pending_invitations.email = currentUser.primaryEmailAddress.emailAddress`. If we don't also check `verification.status = 'verified'`, an attacker who controls a Clerk account with an unverified email matching a real invitee's email could intercept the invitation. **Remediation:** in `ensurePractitioner` pickup step, require `user.primaryEmailAddress.verification.status === 'verified'` before any `practitioner_clients` insert. Hard-fail (silently skip pickup) if not verified.

**C2 [High] — Email is always lowercased at write AND match.**
Email comparison must be case-insensitive end-to-end. Mismatch = invitation never picks up; worse, an attacker registering `Foo@x.com` vs the invite-target `foo@x.com` could theoretically diverge depending on Clerk's normalization. **Remediation:** `lower(email)` on insert (DB-side check constraint: `check (email = lower(email))`) and the match query uses `where email = lower($1)`.

**C3 [High] — Role escalation via invitation creation API.**
`POST /api/clients/[orgId]/invitations` accepts `{ email, role }`. If role enum includes `'owner'`, a malicious owner could escalate someone to owner. **Remediation:** the API endpoint hard-codes the allowed invitable roles to `['collaborator', 'viewer', 'operator']` (no `owner`). The DB-side `pending_invitations.role` check constraint enforces the same (`check (role in ('collaborator','viewer','operator'))`). Two-layer defense.

**C4 [High] — IDOR on approval action endpoints.**
`POST /api/clients/[orgId]/initiatives/[id]/approve` must verify `artifact.org_id = orgId` server-side. Without this, an owner of Org A could approve an artifact in Org B by passing Org A's `orgId` in the URL + Org B's `artifactId`. **Remediation:** every approval endpoint runs `assertPractitionerOwnsOrg(orgId)` AND fetches the artifact AND verifies `artifact.org_id === orgId`. Rejection: 404 (not 403 — don't leak existence).

**C5 [Medium] — Submit endpoint must verify authorship.**
Captured by E4 above. Operator A cannot submit Operator B's draft. Owner can submit anything but auto-approval is owner-default at insert, so the path is rare. **Remediation:** `assertCanActOnArtifact` checks `submitted_by_practitioner_id = self OR is null` for operator role.

**C6 [Medium] — `pending_invitations` exposes org membership intent.**
If service-role queries leak (which they shouldn't, but defense in depth), the table reveals who's about to join which org. Sensitive in a fractional context (competitors learning client lists). **Remediation:** the table is service-role-only (no `authenticated` grant). Already enforced by the v18 lockdown posture inherited by new tables. No additional change needed; document the sensitivity.

**C7 [Medium] — Polymorphic `approval_events.artifact_id` enables forgery if a write endpoint accepts artifact_type from the client.**
If `artifact_type` is client-controlled, a caller could log an event of the wrong type. **Remediation:** the approval-action handlers determine `artifact_type` from the ROUTE, never from request body. The `_lib/approval-actions.ts` signature is `(artifactType: 'initiative'|'status_report'|'selection'|'audit', artifactId, action, actor)` — type is bound at the route module, not user input.

**C8 [Medium] — Invitation enumeration via differential responses.**
If `POST /api/.../invitations` returns different status codes for "email already invited" vs "successfully invited", an attacker could enumerate the invitee set. **Remediation:** all states return 200 with a non-leaking message. The differential exists in the DB (unique constraint) and is silently absorbed: re-invite of an existing pending invitation overwrites it (or no-ops + extends expires_at). Tell the legitimate owner via UI only after the DB write succeeds.

**C9 [Medium] — Clerk invitation revocation must mirror local revocation.**
If a CDIO deletes a `pending_invitations` row without revoking the Clerk invitation, the Clerk invite link still works — a stale link could create an unintended Clerk account. **Remediation:** the DELETE endpoint calls `clerkClient.invitations.revokeInvitation(clerk_invitation_id)` BEFORE deleting the local row. If Clerk revoke fails (network), fail the DELETE and surface the error to the owner. Idempotent retry safe.

**C10 [Low] — Audit log integrity (operator can't tamper).**
`approval_events` is append-only by convention (no UPDATE or DELETE endpoints). Could be made append-only by DB privilege (`grant insert, select on approval_events to service_role` — no update/delete). **Remediation:** explicit GRANT in the migration: `grant select, insert on approval_events to service_role` (omit update/delete). This is defense in depth — the app layer also never updates/deletes.

**C11 [Low] — Privilege ordering for future S2/S3 work.**
The role enum order `('owner','collaborator','viewer','operator')` is alphabetical, not by privilege. When S2 adds `assertHasPrivilege(role, minimum)`, encode the ordering in TS, not DB. **Status:** informational; no code change in S1.

**C12 [Low] — Operator cannot see other operators' drafts (positive confirmation).**
The inbox query filters by `submitted_by_practitioner_id = self` for the "Pending your action" + "Awaiting approval" + "Returned with edits" sections. Two operators on the same client can't see each other's drafts. Owners can see all (approval queue). **Status:** confirmed in scoping; document in the role gates.

**C13 [Info] — Email send via Clerk is the security boundary, not us.**
We trust Clerk to deliver the invitation email to the right inbox. If Clerk has a vuln there, we inherit it. Acceptable — Clerk is a trusted security vendor; mitigating it would mean building our own invitation token system, which the doc explicitly rejected.

### Net change to the plan from /cso

- Add a CHECK constraint `pending_invitations.email = lower(email)` (C2).
- Add DB-side role allow-list `check (role in ('collaborator','viewer','operator'))` on `pending_invitations` (C3).
- Verified-email check in pickup (C1).
- 404 (not 403) for cross-org IDOR attempts (C4).
- Approval-action handler signature binds artifact_type at route level (C7).
- Invitation list/create returns uniform 200 responses (C8).
- DELETE invitation revokes Clerk first (C9).
- `approval_events` GRANT is `select, insert` only (C10).
