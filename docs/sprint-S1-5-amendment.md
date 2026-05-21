# Sprint S1.5 — Data-model amendment to match the 5-role + Coach-Mode handoff

**Status:** scoping (2026-05-20 / 2026-05-21)
**Branch:** `claude/s1-5-role-model`
**Migration:** schema-v24
**Sprint of:** between S1 (foundation, shipped #8 `ec42353`) and S2 (workflow scaffolding)

---

## 1. Why this sprint exists

S1 (#8) shipped the **shape** of the operator + approval workflow but with the wrong **substance**: a 4-role enum (`owner / collaborator / viewer / operator`) instead of the handoff's 5-role model, an `approval_events` table missing the `actor_role` and `prior_version` columns the Phase D Coach Mode design requires, and no `rejected` terminal state.

S1.5 corrects these so Phases B–D can land cleanly on top, without further schema rewrites. **It is NOT new user-facing capability** — it's correctness work to honor the handoff design.

Concretely from the handoff gap analysis (1 of my honest review of S1):

1. The 5-role model (§4) is `operator / technical_reviewer / financial_approver / strategic_approver / submitter` (the last is token-based, no `practitioner_clients` row). S1 only added `operator` and kept `owner / collaborator / viewer`.
2. The `approval_events` schema (§5) requires `role text NOT NULL` (which role acted) and `prior_version jsonb NULL` (snapshot at this decision point). S1 stored neither.
3. The approval state machine (§5) terminates as `approved | final` or `rejected` (terminal). S1 has no `rejected` value.
4. The handoff self-approval policy says "the system records WHICH role acted at each step." Without `actor_role`, the audit trail can't.

## 2. What "done" looks like

- `practitioner_clients.role` enum widened to 7 values: `strategic_approver, technical_reviewer, financial_approver, operator, collaborator, viewer` (+ implicit `submitter` exists outside this table, token-based, Phase E builds it).
- Every existing `'owner'` row is migrated to `'strategic_approver'`. No legacy `owner` value remains in any row.
- `approval_events` carries `actor_role text` and `prior_version jsonb` columns. New events stamp both. The Coach Mode (Phase D) source-of-truth is complete from this point forward.
- `approval_status` check on initiatives / status_reports / selections / audits adds `'rejected'`.
- The `assertCanApprove` helper enforces strategic_approver (was: `owner`). All TS references to `'owner'` updated.
- Existing approval_events rows (from founder testing during S1) get a backfill of `actor_role` from the actor's current role on the org.
- prod build clean, type checks clean, schema verified.

## 3. Decisions locked

### 3.1 Single role per (user, client) for Year 1
Handoff §4 says one user can hold multiple roles. The literal data-model shape for that is either `roles text[]` on the membership row or a junction `practitioner_client_roles (practitioner_id, org_id, role)`.

**Decision: stay on single `role text` for Year 1.** The handoff's Year-1 simplification ("collapse approvals to single strategic_approver") makes multi-role-per-user a Phase B requirement at earliest. The founder edge case (he is operator + strategic_approver on his own clients) is handled by recording `actor_role = 'strategic_approver'` for him directly — the system records which role acted, but there's only one role to record.

Migration path when multi-role becomes real (Phase B): add a `practitioner_client_roles` junction table, backfill from the singular `role`, keep `role` as the "primary/default role" column. This is a clean future migration, not a re-write.

### 3.2 `submitter` is NOT a value in `practitioner_clients.role`
Handoff §4 marks `submitter` as **token-based, no login**. Submitters don't have a `practitioners` row, so they can't have a `practitioner_clients` row either. The submitter path is the Phase E Demand Catalog (handoff §14) which mirrors the existing Cadence/stakeholder-token pattern.

S1.5 does NOT add submitter to the role enum.

### 3.3 `collaborator` and `viewer` are retained as advisory
Handoff §4 doesn't explicitly include collaborator/viewer in the 5-role list. They predate this design (schema-v4, 2026-05-09). Removing them would orphan any existing rows + force a migration before any rolling deploy.

**Decision: keep both, document as advisory.** They mean "has read access" (viewer) or "co-CDIO with full access but not yet promoted to strategic_approver" (collaborator). The invitation UI will eventually surface only the 5 handoff-locked roles + viewer for read-only sharing; collaborator becomes a legacy value not exposed in new UI.

### 3.4 Approve-with-edits stays as a distinct event_type
Handoff §5 has 4 decision values: `submitted | approved | changes_requested | rejected`. S1 introduced `approved_with_edits` as a 5th event_type. The handoff doesn't have this — it would be one of `approved` (decision) + `prior_version` (snapshot showing edits).

**Decision: keep `approved_with_edits` as the event_type in S1.5; it's purely additive and gives Coach Mode a faster path to "the CDIO edited" without diffing prior_version vs current.** Phase D Coach Mode can still rely on the prior_version + current state if it wants finer signal.

### 3.5 Vocabulary: keep `pending` not `submitted`; keep `returned` not `changes_requested`
S1 uses `pending` and `returned` in the approval_status enum. Handoff uses `submitted` and `changes_requested`. Renaming would touch the API state machine, all UI strings, and the approval_status check constraint. Behavioral semantics are identical.

**Decision: keep S1's vocabulary; add `rejected` as the new terminal state.** Reduces blast radius; doesn't change Phase D's ability to consume the data.

## 4. Schema-v24 plan

```sql
-- 1. Widen practitioner_clients role enum + migrate 'owner' → 'strategic_approver'
ALTER TABLE practitioner_clients DROP CONSTRAINT practitioner_clients_role_check;
UPDATE practitioner_clients SET role = 'strategic_approver' WHERE role = 'owner';
ALTER TABLE practitioner_clients ADD CONSTRAINT practitioner_clients_role_check
  CHECK (role IN ('strategic_approver','technical_reviewer','financial_approver','operator','collaborator','viewer'));

-- 2. Widen pending_invitations role enum (owner was already excluded)
ALTER TABLE pending_invitations DROP CONSTRAINT pending_invitations_role_check;
ALTER TABLE pending_invitations ADD CONSTRAINT pending_invitations_role_check
  CHECK (role IN ('technical_reviewer','financial_approver','operator','collaborator','viewer'));

-- 3. approval_events: add actor_role + prior_version
ALTER TABLE approval_events ADD COLUMN IF NOT EXISTS actor_role text;
ALTER TABLE approval_events ADD COLUMN IF NOT EXISTS prior_version jsonb;
-- actor_role becomes NOT NULL after backfill (see Task #19)

-- 4. Add 'rejected' to approval_status check on 4 artifact tables
-- Generated via DO-block mirroring schema-v23.
```

## 5. Code changes (concise)

- `src/lib/auth/assert-owns-org.ts`: `PractitionerClientRole` type widens to 6 values
- `src/lib/auth/role-gates.ts`: `APPROVE_ROLES = ['strategic_approver']`; `WRITE_ROLES = ['strategic_approver','technical_reviewer','financial_approver','collaborator','operator']`
- `src/lib/auth/initial-approval-state.ts`: `role === 'strategic_approver'` auto-approves; everyone else starts in `draft`
- `src/app/api/_lib/approval-actions.ts`: every state-changing handler fetches the artifact JSON, stamps it into `prior_version`, and records `actor_role` from the caller's role on the org
- `src/app/clients/[orgId]/inbox/page.tsx`: role label map adds the 3 new roles; "CDIO / owner" → "Strategic approver (CDIO)"
- `src/app/clients/[orgId]/settings/invitations-panel.tsx`: role dropdown adds Technical reviewer and Financial approver options
- `src/app/api/clients/[orgId]/invitations/route.ts`: zod allow-list widens

## 6. /plan-eng-review findings (inline, brief)

**E1 — owner→strategic_approver rename touches the existing `clients-table.tsx` role display.** It renders the role badge directly. Quick check: search `'owner'` in TSX, ensure all display paths use the new value.

**E2 — Idempotent migration: the `owner → strategic_approver` UPDATE will no-op on re-run** (no rows match `role = 'owner'` after first pass). Safe. But verify the constraint DROP+ADD is also re-runnable; the v23 pattern handles this.

**E3 — `actor_role` will be NULL on existing approval_events.** The backfill task (#19) sets it from the actor's current role. If a user has changed role since the event was logged, the backfill captures the CURRENT role, not the historical one. Acceptable for the founder-test set (small N, recent). Document the limitation.

**E4 — `prior_version` will be NULL on existing approval_events** (no backfill possible — we don't have artifact snapshots from before this column existed). Coach Mode (Phase D) needs to handle the NULL case gracefully: "no prior_version → skip diff."

**E5 — RLS posture for new columns.** Additive ALTER COLUMN on RLS-locked tables doesn't change RLS posture. New columns inherit the table's existing service-role-only policy. No change needed.

**E6 — Type-safety of role enum.** With 6 values, `PractitionerClientRole` becomes a union of 6 string literals. TS catches mistyped values at compile time. The runtime DB CHECK is the second layer.

## 7. /cso findings (inline, brief)

**C1 [Info] — Role rename doesn't expand privilege.** strategic_approver has exactly the privileges `owner` had. No escalation.

**C2 [Low] — `prior_version jsonb` could store sensitive artifact data.** It's the same data as the artifact table itself, which is already service-role-gated. No new exposure surface.

**C3 [Low] — `actor_role` is NOT enforced to match the actor's actual role on the org.** A buggy handler could stamp the wrong role into the audit trail. Mitigation: the actor_role is derived server-side from `assertCanApprove` / `assertCanWrite`, not from request body. cso C7 pattern (route-bound, not user-input) applies.

## 8. Done criteria

- [ ] schema-v24 applied; verify-v24.js: 8+ checks all pass
- [ ] No `'owner'` strings in `src/` outside of code comments + the migration itself
- [ ] Approve an artifact in dev: new approval_events row has actor_role + prior_version populated
- [ ] Existing approval_events backfilled with actor_role (NOT NULL constraint added at end)
- [ ] prod build green
- [ ] PR open, smaller diff than S1
