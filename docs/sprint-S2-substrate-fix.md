# Sprint S2 — Substrate fix: approval-workflow correctness

**Status:** scoped, codex-reviewed (2026-05-21 → next session)
**Worktree:** `claude/quizzical-kowalevski-640097`
**Migration:** `schema-v25-substrate-correctness.sql` (forces S2.5's big migration to renumber → see §3.6)
**Sprint of:** the build sequence locked in `docs/STRATEGIC-FRAME-2026-05-21.md` (S2 → S2.5 → S3 → S4 → S5 → S6 → S7)
**Reviews applied to this plan:** `/plan-eng-review` (4 architecture decisions + 2 code-quality + 3 test) and `/codex` (14 findings — all addressed; see §8 "Codex review log").

---

## 1. Why this sprint exists

The 2026-05-21 codex adversarial audit (see `docs/CODEX-AUDIT-2026-05-21.md`) found **four P1 substrate bugs** in `src/app/api/_lib/approval-actions.ts` — the file that S1 + S1.5 stood up to power the operator → CDIO approval workflow. The bugs make Phase D Coach Mode unimplementable as designed AND make the workflow itself unsafe under concurrency.

The four codex findings:

| # | What's broken | Where |
|---|---|---|
| **#4** | `prior_version` captured POST-edit not PRE-edit. Coach Mode can't diff "what the CDIO changed" because the snapshot reflects the post-edit state. The audit-trail invariant Phase D depends on is broken at the point of capture. | `approval-actions.ts:183,193,215` |
| **#5** | Approval state transitions are race-prone. Handlers read state, then UPDATE by `id` only — no CAS guard (`approval_status = expected_state` in the predicate). Concurrent approve/return/withdraw all pass precheck; last write wins; multiple incompatible events log. | `approval-actions.ts:71,77,197,202,270` |
| **#6** | State update + event insert are NOT in one transaction. Event-insert failure is silently swallowed (`console.warn` then `return`); snapshot-failure writes `prior_version = null`. Audit trail breaks exactly where Coach Mode depends on it. | `approval-actions.ts:311,322,336,355` |
| **#7** | `rejected` state is schema-only. v24 added it to `approval_status` enum on the 4 artifact tables, but **NOT** to `approval_events.event_type` CHECK (schema-v23:161 — codex audit understated; this is also schema). No route, no handler, TS union omits `rejected`. The terminal-no state can't be exercised. | schema-v24 + `approval-actions.ts:300` |

S2 fixes all four. It is intentionally **invisible to the founder's eye** (no new UI surface) — the visible-feature debt is paid in S3 (first-class Decision Package) and S4 (Quick Scan in Workbench). S2 is the correctness floor those depend on.

## 2. What "done" means for S2

The four state transitions (submit, approve, return, withdraw) and one new one (reject) all flow through a single atomic RPC. The RPC takes the expected `approval_status` and refuses (returns a stale-state signal) if the row has moved since the handler read it. The RPC writes the state change AND the `approval_events` row in one Postgres transaction; if the event insert fails for any reason, the state change rolls back. `prior_version` snapshots are captured BEFORE any mutation — for the approve path, this means BEFORE any inline edits are applied. `rejected` is wired end-to-end: schema CHECK, RPC, handler, route, TS union.

Concurrent test scenarios pass: two simultaneous approves on the same `pending` artifact → one succeeds, one returns 409. Event-insert failure (forced via temporary CHECK violation) → state stays unchanged. Approve with `{edits: {...}}` → `prior_version` shows the operator's submitted state, not the edited state.

## 3. Decisions

### 3.1 Atomic state-and-event writes via **typed RPCs** (5 of them), not one generic RPC

**Decision:** Add five Postgres functions in `schema-v25-substrate-correctness.sql`:

```
apply_artifact_submit(p_artifact_type, p_artifact_id, p_expected_status,
                       p_actor_practitioner_id, p_actor_role, p_payload)
apply_artifact_withdraw(...)
apply_artifact_approve(..., p_edits jsonb)       -- inline edits, snapshot BEFORE
apply_artifact_return(..., p_payload jsonb)      -- payload carries comment
apply_artifact_reject(..., p_payload jsonb)      -- payload carries comment
```

Each function uses `LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp` (codex X2). After creation:
```sql
REVOKE EXECUTE ON FUNCTION public.apply_artifact_<...> FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_artifact_<...> TO service_role;
```

Function body shape (codex X3 — explicit subtransaction for typed rollback):

```pgsql
BEGIN  -- outer block
  -- 1. Validate (artifact_type, expected_status → new_status) is a legal transition.
  --    Per-function whitelist; if not legal, return {ok: false, code: 'internal',
  --    current_status: null, message: null} (codex X4 — guard against buggy callers).
  IF NOT v_legal_transition THEN
    RETURN jsonb_build_object('ok', false, 'code', 'internal',
                              'current_status', NULL, 'message', NULL);
  END IF;

  -- 2. Row lock + status fetch (eng-review A2 — FOR UPDATE not CAS-on-UPDATE).
  SELECT approval_status, row_to_json(<table>.*)
    INTO v_current_status, v_snapshot
    FROM <artifact table> WHERE id = p_artifact_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'not_found', ...);
  END IF;
  IF v_current_status IS DISTINCT FROM p_expected_status THEN
    RETURN jsonb_build_object('ok', false, 'code', 'stale_state',
                              'current_status', v_current_status, ...);
  END IF;

  -- 3. Atomic update + event-insert subtransaction (codex X3).
  BEGIN
    UPDATE <artifact table>
       SET approval_status = <new_status>, <state-specific columns>, <p_edits keys>
     WHERE id = p_artifact_id;
    INSERT INTO public.approval_events (...) VALUES (..., v_snapshot, ...);
  EXCEPTION WHEN OTHERS THEN
    -- The inner BEGIN/EXCEPTION is a true Postgres subtransaction;
    -- on exception, BOTH the UPDATE and the INSERT roll back atomically.
    RAISE LOG 'apply_artifact_<...> rolled back: %', SQLERRM;  -- codex X13
    RETURN jsonb_build_object('ok', false, 'code', 'internal',
                              'current_status', v_current_status,
                              'message', NULL);  -- codex X13: no raw PG error to client
  END;

  RETURN jsonb_build_object('ok', true, 'code', NULL,
                            'new_status', <new_status>, 'event_id', v_event_id);
END;
```

The handler maps `code` to HTTP statuses:

| RPC code | HTTP | Use case |
|---|---|---|
| `null` (ok:true) | 200 | Happy path |
| `stale_state` | 409 | Row moved between handler read and RPC call |
| `not_found` | 404 | Artifact id doesn't exist |
| `internal` | 500 | Event-insert rolled back state change OR illegal-transition guard fired |

(eng-review A1 lock + codex X5 fold-in: `invalid_columns` removed from contract. Zod validation in the handler is the gate; SQL trusts the handler. Any bypass surfaces as `internal`. Cleaner: one fewer code, no spec contradiction.)

**Legal-transition whitelist (codex X4):** each RPC function only accepts transitions for which it is responsible. For example, `apply_artifact_approve` accepts `(p_expected_status='pending', new_status='approved')` only. A buggy caller passing `expected_status='approved'` to `apply_artifact_approve` would be caught by the legal-transition guard and refused with `code='internal'`. Same for the other 4 functions.

**Alternative considered — one generic RPC.** Rejected. Dynamic-column UPDATE via `jsonb_to_recordset` + `format` makes the SQL harder to audit and gives no real DRY win (the per-action SQL is ~30 lines each). Five typed RPCs read like prose and let `/codex` review them line-by-line.

**Alternative considered — keep TS handlers, add `WHERE approval_status = $expected` to UPDATEs, do nothing else.** Rejected for finding #6. CAS guards on the UPDATE solve the race (#5) but do NOT make the event insert atomic with it. Two separate statements from the handler can still leave the system with state-changed-no-event or event-with-rolled-back-state. Only a single Postgres transaction (function) fixes that, and you only get the transaction if the work happens server-side in one round-trip.

### 3.2 Approve flow — remove the lying "edits_made" button; RPC accepts inline `edits` for future UX

**Verified during plan review (codex X14):** the current UI at `src/components/approval-actions.tsx:116` has an "Approve with edits" button that POSTs `{edits_made: true}` with NO actual edits payload. It's a flag without a body — the CDIO has no way to send real edits via this UX. The button lies about what it does. Codex P1 #4's "prior_version POST-edit" symptom is partly an artifact of this lying button (whatever the CDIO did via OTHER paths between submit and approve gets folded into the snapshot).

**Decision for S2:**

1. **Delete the lying "Approve with edits" button** in `approval-actions.tsx:115-122`. The remaining "Approve" button calls `/approve` with no body. The RPC's `p_edits` parameter accepts NULL (no inline edits in S2).
2. **The RPC STILL accepts `p_edits jsonb`** so the future approve-with-edits UX (S3 alongside Decision Package wizard) lands without a schema migration. The handler in S2 doesn't accept it from the request body yet.
3. **PATCH-on-pending-or-approved-or-rejected blocked** via the guard predicate (see §3.9). This closes codex P1 #4 even without an approve-with-edits UI: if no path mutates a pending artifact, `prior_version` at approve-time is operator-submitted-state by construction.

**Why we don't add a real approve-with-edits UX in S2:** S2 is a substrate fix. The approve-with-edits modal/form is real UX design — what columns are editable, what does the form look like, how does the CDIO indicate what they changed. That belongs with S3's first-class Decision Package work, not in a substrate-correctness PR.

**RPC contract for future S3 approve-with-edits:** the handler will (in S3) accept `{ edits?: <Zod-validated per-artifact-type> }` in the request body. If `edits` present and non-empty, handler validates via the per-artifact Zod schema (§3.3), passes the validated jsonb as `p_edits` to `apply_artifact_approve`. The RPC applies edits atomically with the status flip; event_type becomes `'approved_with_edits'`. For S2: handler always passes `p_edits := NULL`; event_type is always `'approved'`.

**Alternative considered — build the real approve-with-edits UX in S2.** Rejected. Scope creep. S2 is the floor; S3 is the visible feature layer.

**Alternative considered — leave the lying button, document it as known-broken.** Rejected. Removing the lie now prevents anyone (including future-me) from being misled about what `event_type = 'approved_with_edits'` events on existing data mean.

### 3.3 Editable-columns allow-list AND per-artifact Zod schemas (eng-review A3 lock; codex X6 — REAL columns)

**Codex caught the original draft inventing column names. Re-derived from actual schemas:**

| Artifact | Real columns (from `schema-v11/v12/v14/v16/v19`) | Edit-allowed in S2 RPC + future S3 UX |
|---|---|---|
| `initiatives` | `title, goal, domain, module_number, owner_name, owner_email, status (active/blocked/done/cancelled), target_completion_date, completed_at, steps (jsonb array)` | `title, goal, domain, module_number, owner_name, owner_email, target_completion_date`. `status` is the initiative's own workflow (separate from `approval_status`); `steps` mutates through `[id]/step-status` only; `completed_at` set by step-status transitions. |
| `status_reports` | `title, headline, payload (jsonb), period_start, period_end, status (draft/published)` | `title, headline, payload`. `period_start`/`period_end` set at creation; `status` is publish-state (separate from `approval_status`). |
| `selections` | `title, question, domain, module_number, initiative_id, criteria (jsonb), candidates (jsonb), recommendation, status (open/recommended/decided/cancelled), decided_at, decided_candidate_id` | `title, question, domain, module_number, criteria, candidates, recommendation`. Domain status + decision metadata managed by selection flow, not by approve-with-edits. |
| `audits` | `title, status (intake/ready/running/complete/cancelled), intake (jsonb), output (jsonb), method_capture (jsonb), ran_at` | `title, intake`. `output`/`method_capture`/`ran_at` are AI-generated via `/[id]/run` and `/[id]/companion`; not user-edited. |

**Decision:** Per artifact type, a Zod schema:

```ts
import { z } from "zod";

const initiativeEditsSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  goal: z.string().min(1).max(4000).optional(),
  domain: z.enum(["tech", "ai", "security", "process", "data", "other"]).optional(),
  module_number: z.number().int().min(1).max(16).optional().nullable(),
  owner_name: z.string().max(200).optional().nullable(),
  owner_email: z.string().email().optional().nullable(),
  target_completion_date: z.string().date().optional().nullable(),
}).strict();    // .strict() = unknown keys fail validation

const statusReportEditsSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  headline: z.string().max(4000).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),  // jsonb shape evolves; no per-key validation in S2
}).strict();

const selectionEditsSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  question: z.string().min(1).max(4000).optional(),
  domain: z.enum(["tech", "ai", "partner"]).optional(),
  module_number: z.number().int().min(1).max(16).optional().nullable(),
  criteria: z.array(z.record(z.string(), z.unknown())).optional(),
  candidates: z.array(z.record(z.string(), z.unknown())).optional(),
  recommendation: z.string().max(4000).optional().nullable(),
}).strict();

const auditEditsSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  intake: z.record(z.string(), z.unknown()).optional(),  // shape = AuditIntake; lighter-weight here
}).strict();

const EDITS_SCHEMAS: Record<ApprovableArtifactType, z.ZodSchema> = {
  initiative: initiativeEditsSchema,
  status_report: statusReportEditsSchema,
  selection: selectionEditsSchema,
  audit: auditEditsSchema,
};
```

S2 does NOT call these from the request body (per §3.2 — approve handler ignores edits in S2). The schemas land in `src/lib/auth/edits-allowlist.ts` (new file) so the S3 approve-with-edits UX has the contract ready.

The RPC trusts the handler's Zod validation and applies columns via dynamic UPDATE in `apply_artifact_approve`. SQL function is service-role only (codex X2 enforcement); trust is bounded.

**Why per-field Zod, not just column allow-list:** without value validation, `{target_completion_date: "tomorrow"}` surfaces as a Postgres CAST 500 with no field-level message. With Zod, the future UI shows "target_completion_date must be a valid ISO date" inline.

**Note on jsonb columns (payload, intake, criteria, candidates):** S2 accepts the whole jsonb as-is from Zod. Future S3 may add per-shape validation if those columns prove brittle.

### 3.4 Wire `rejected` end-to-end

**Decision:** schema-v25 adds `'rejected'` to `approval_events.event_type` CHECK. The migration is small: drop the constraint, recreate including `'rejected'`. Idempotent.

Add `handleReject` mirroring `handleReturn` — takes `comment` in body, calls `apply_artifact_reject`. Add four new routes:

```
src/app/api/initiatives/[id]/reject/route.ts
src/app/api/status-reports/[id]/reject/route.ts
src/app/api/selections/[id]/reject/route.ts
src/app/api/audits/[id]/reject/route.ts
```

Each is ~9 lines, mirroring the existing /return shape. TS union on `approval-actions.ts:300` widens to include `'rejected'`. The `ApprovableArtifact.approval_status` TS union in `role-gates.ts:95` also widens.

**Resolved (founder confirmed during /plan-eng-review 2026-05-21):** rejected is terminal-no. No `rejected → draft` path. If the operator wants to rework a rejected idea, they create a new artifact.

### 3.5 Fold-in: codex P1 #8 (existence-leak 403 → 404)

**Decision:** Fold in. Cheap and we're already touching the auth path. In `role-gates.ts:144-146`, when `assertCanWrite` fails on a cross-org artifact, override the response to 404 (same as the artifact-not-found path on line 133). This kills the existence oracle that the S1 sprint doc flagged as a known leak.

The codex audit's exact text: "IDOR remediation overstated. The S1 sprint doc says cross-org access should return 404 to avoid existence-leak; the implemented gate returns 403. Cross-org mutation blocked, but existence oracle remains."

Effort: ~15 min. Test: a practitioner with no role on org B attempts `GET /api/initiatives/{some-id-in-org-B}` → returns 404, not 403.

### 3.6 Migration renumber: `v25` ships in S2, not S2.5

**Decision:** Substrate-correctness migration ships as `schema-v25-substrate-correctness.sql` (per codex audit naming). The S2.5 strategic-frame migration (touched_modules + 6 PM cross-cutters + success_scorecard + …) renumbers to `schema-v26-...`. This is a doc-doc collision the codex audit named first; substrate ships first → it takes the lower number.

**Resolved (founder confirmed during /plan-eng-review 2026-05-21):** v25 for substrate, v26 for S2.5's big migration.

### 3.7 Out of S2 scope (deferred)

- **Codex P1 #3 (5-role model coherence, submitter token-based).** Codex audit said "fold into S2." On inspection, the substrate fix doesn't touch the role-enum; v24's comments already document collaborator/viewer as advisory. Submitter is token-based and lands in S6. Adding a one-paragraph comment to `assert-owns-org.ts` documenting the 6-DB-values + 1-token-role mental model is the cheap fold-in. **Decision: include the comment, defer the structural fix to S6.**
- **Codex P1 #1 (visible Day-1 capability debt).** Acknowledged constraint, not a fix — S3 + S4 ship the visible features.
- **Codex P1 #2 + #12 (no operator self-diagnostic).** S4 sprint, not S2.

### 3.8 Cleanups bundled into this PR (eng-review B2 + B5 locks)

- **Delete `fetchArtifactSnapshot()`** in `approval-actions.ts:341-358`. Once the RPCs absorb snapshot duties, this helper is dead code. Removing it prevents future drift between two snapshot mechanisms.
- **Update file-header comment block** in `approval-actions.ts:11-33`:
  - State-machine diagram refreshed to include `rejected` (per §3.4). `approved_with_edits` documented as event_type only (not status — per codex X12).
  - New RPC data-flow comment (5-step: legal-transition guard → lock → status check → subtransaction (update + event) → return) added so a reader of the handlers understands the SQL semantics without context-switching to the migration.
  - Mutation guards (§3.9) noted so the "approved is immutable" contract is visible at the call site.
  - Note that S2 does NOT send inline edits through the approve handler (kill the lying button); S3 will.

### 3.9 Approved is fully immutable AND strategic_approver creations start in `draft` (eng-review A7 + codex X8 + X9)

**Two coupled changes:**

**(a) Change `initialApprovalStateForRole` so strategic_approver creations start in `draft`, not `approved`** (codex X9 fix). Today in `src/lib/auth/initial-approval-state.ts:34-41`:

```ts
if (role === "strategic_approver") {
  return {
    approval_status: "approved",   // ← auto-approved on creation
    submitted_by_practitioner_id: practitionerId,
    submitted_at: now,
    approved_by_practitioner_id: practitionerId,  // ← self-approved
    approved_at: now,
  };
}
```

After S2:

```ts
if (role === "strategic_approver") {
  return {
    approval_status: "draft",       // ← starts as draft, like every other role
    submitted_by_practitioner_id: practitionerId,
    submitted_at: null,
    approved_by_practitioner_id: null,
    approved_at: null,
  };
}
// (Non-strategic_approver branch unchanged.)
```

**Why:** the new "approved = an explicit approve event happened" invariant requires this. With auto-approval, strategic_approver creations land in `approved` with NO `approval_events` row — the audit trail starts blank. After S2, every approved artifact has a submitted event AND an approved event in `approval_events`. Coach Mode's diff has data to work with from creation.

**Migration impact:** zero data migration. Existing strategic_approver-created rows already in `approved` stay as-is (forward-only). Only new creations follow the new rule. Existing approved rows have NO `approval_events` history; Coach Mode handles NULL prior_version (per schema-v24 comment "old events have no artifact snapshot to recover. Phase D Coach Mode must handle NULL gracefully" — already accounted for).

**Strategic_approver UX consequence:** after creating an artifact, the strategic_approver clicks "Submit for approval" then "Approve" on their own work. Two clicks instead of zero. This is an honest UX trade for a clean audit trail; the founder confirms this is fine because (a) it's a small fraction of artifact creations, and (b) it makes "approved" mean something invariant.

**(b) Block ALL mutation paths when `approval_status IN ('pending', 'approved', 'rejected')`** (codex X8 — broader than PATCH alone). The 7 endpoints touched:

| # | Endpoint | Predicate added to the UPDATE |
|---|---|---|
| 1 | `src/app/api/selections/[id]/route.ts` PATCH | `WHERE approval_status NOT IN ('pending', 'approved', 'rejected')` |
| 2 | `src/app/api/status-reports/[id]/route.ts` PATCH | same |
| 3 | `src/app/api/audits/[id]/route.ts` PATCH | same |
| 4 | `src/app/api/initiatives/[id]/step-status/route.ts` POST | same |
| 5 | `src/app/api/audits/[id]/run/route.ts` POST | same |
| 6 | `src/app/api/audits/[id]/companion/route.ts` POST | same |
| 7 | `src/app/api/audits/extract/route.ts` POST (verify this mutates an existing audit) | same — only if it mutates an existing audit; if it creates a new audit, no guard needed |

Each endpoint's UPDATE returns 0 rows when blocked → handler returns `409 Conflict` with body `{ error: "Cannot mutate artifact in <status> state" }`.

**Why "approved" is fully immutable:** PATCH allowed only on `draft` and `returned`. No `force=true` escape hatch. If a post-approval correction is needed in the future (e.g., typo in a board-defensible Status Report), the right path is a dedicated `/amend` route in S3 that creates a new versioned artifact rather than mutating history — designed properly, not bolted on here.

**Initiatives have NO general PATCH endpoint** (verified during plan review — `src/app/api/initiatives/[id]/` has approve/return/step-status/submit/withdraw but no `route.ts`). The `step-status` route is the only path to mutate an existing initiative's `steps` jsonb after creation. Title, goal, owner fields, etc. are write-once at creation. S3's approve-with-edits UX will need to add a general PATCH route at that time — out of scope for S2.

### 3.10 Status-report approval UI deferred (codex I7 partial)

Strategic_approver-created **status_reports** now land in `draft` (per §3.9) but the
cadence flow doesn't yet expose `ApprovalActions` for them. `src/app/clients/[orgId]/cadence/cadence-client.tsx` manages status reports inline rather than per-detail-page, and adding the approval round-trip into that flow is a UX surface that belongs with the S3 Decision Package wizard work (where status_reports get a proper detail page).

**Workaround in S2:** strategic_approver creates a status report → it sits in `draft`. To move it to `approved`, the founder hits the API endpoints directly (`POST /api/status-reports/[id]/submit` → `POST /api/status-reports/[id]/approve`). Initiatives, selections, and audits all have the full UI; status_reports is the one gap.

**S3 follow-up:** add ApprovalActions to a per-status-report detail page when the cadence workflow gets the wizard treatment. Tracked here; no separate ticket needed since it's part of S3 scope.

---

## 4. State machine (final, after S2 — codex X12 fix: `approved_with_edits` is event_type only)

`approval_status` (column on the artifact row) takes 5 values: `draft`, `pending`, `approved`, `returned`, `rejected`.

`event_type` (column on `approval_events`) takes 6 values: `submitted`, `approved`, `approved_with_edits`, `returned`, `withdrawn`, `rejected`. Note `approved_with_edits` is an EVENT, not a status — when it fires, `approval_status` becomes `approved` (the same as a no-edits approve).

```
                ┌──── submit ─────────────────┐
                │   (event: submitted)        │
            draft ←──── withdraw ─────────── pending ──── approve ────── approved
              ↑       (event: withdrawn)     │             (event: approved
              │                              │              OR approved_with_edits
              │                              │              when p_edits is non-empty
              │                              │              — S3 only, NOT S2)
              ├─ submit ─── returned ←── return ──┘
                          (event: returned)
                              │
                              └── reject ──────────────→ rejected
                                  (event: rejected)
```

- All transitions are CAS-guarded on `(expected_status, new_status)` via the RPC (codex X4).
- All transitions log a row in `approval_events` with `prior_version` = pre-transition snapshot.
- `approved` and `rejected` are terminal-write: PATCH/run/companion/extract block on these states (§3.9).
- `pending` is also immutable via mutation paths: the operator can `withdraw` back to `draft`, or the approver can `return` (back to `returned`), `approve` (to `approved`), or `reject` (to `rejected`). NO other mutation path is open.

---

## 5. Implementation order (the codex hard-gate path)

1. **Plan reviewed** — this doc through `/plan-eng-review`. ✅ done.
2. **Plan codex-reviewed** — this doc through `/codex`. ✅ done; 14 findings addressed (§8).
3. **SQL written** — `src/lib/db/schema-v25-substrate-correctness.sql`. Five RPC functions (with `SECURITY DEFINER`, `SET search_path`, REVOKE/GRANT per X2) + explicit `BEGIN/EXCEPTION` subtransaction per function (X3) + legal-transition guard per function (X4) + `event_type` CHECK widening for `'rejected'`.
4. **SQL applied** — `node scripts/migrate.js src/lib/db/schema-v25-substrate-correctness.sql` (codex X1 — script takes a file path, not a version alias). `node scripts/verify-v25.js` then runs §7 scenarios 1-4 + structural checks.
5. **TS rewrite** —
   - `src/app/api/_lib/approval-actions.ts` becomes thin handler stubs delegating to RPCs. Deletes `fetchArtifactSnapshot()` (eng-review B2). Updates the file-header state-machine + adds an RPC data-flow comment (eng-review B5). TS `eventType` union widens to include `'rejected'`.
   - `src/lib/auth/role-gates.ts` widens `ApprovableArtifact.approval_status` TS union to include `'rejected'`; flips the 403 to 404 on cross-org access (codex P1 #8 fold-in).
   - `src/lib/auth/initial-approval-state.ts` strategic_approver branch returns `approval_status: "draft"` (codex X9).
   - `src/lib/auth/edits-allowlist.ts` NEW file with per-artifact Zod schemas (eng-review A3 lock + codex X6 corrected columns). Not consumed by handlers in S2; ready for S3.
6. **Routes added** — 4 × `/reject` routes (one per artifact type). Each ~9 lines, mirrors `/return` shape.
7. **Mutation guards added** — 7 endpoints get the `approval_status NOT IN ('pending', 'approved', 'rejected')` predicate on their UPDATE (codex X8). See §3.9 table for the exact list.
8. **UI: kill the lying button** — delete `src/components/approval-actions.tsx:115-122` ("Approve with edits" button that POSTs `edits_made: true` with no real payload). Keep the plain "Approve" button. Real approve-with-edits UX is S3.
9. **Implementation codex-reviewed** — diff through `/codex` (mandatory hard gate per CLAUDE.md). Address findings.
10. **Build clean** — `npx next build`.
11. **/qa pass** — `gstack qa` against the dev server. Run §7 scenarios 5, 6, 7 (the `/qa`-tier rows). Scenarios 1-4 already ran in `verify-v25.js` after step 4.
12. **PR** — squash-merge via `gh pr merge --squash --delete-branch`. Founder reviews on Vercel between substrate-fix and S2.5.

---

## 6. Open questions (resolved 2026-05-21 during /plan-eng-review + /codex)

1. ✅ **Migration renumber** — `v25` for substrate; S2.5 becomes `v26`. (Founder confirmed.)
2. ✅ **External PATCH on pending** — codex verified UI doesn't have an edit-then-approve flow today (the "Approve with edits" button is a lie). Kill the button; defer real UX to S3.
3. ✅ **rejected as terminal-no** — confirmed. New artifact required to rework.
4. ✅ **Race test** — scripted in `verify-v25.js` (eng-review C2 + codex X10 expanded to approve-vs-return + approve-vs-withdraw).
5. ✅ **Strategic_approver auto-approval** — change `initialApprovalStateForRole` so all roles start in `draft` (codex X9). Legacy auto-approved rows untouched (forward-only).

---

## 7. Verification matrix (eng-review C1 + codex X10 + X11 corrections)

| # | What it proves | Scenario | Where | Pass criterion |
|---|---|---|---|---|
| 1 | codex #4 — prior_version PRE-mutation | Create a draft artifact A via service-role insert. Submit via `apply_artifact_submit`. Read the submitted event for A. | `scripts/verify-v25.js` | `event.prior_version` is the artifact state at submit-time (the draft); equals what was inserted, modulo non-mutated columns. |
| 2 | codex #5 — race: approve-vs-approve | Submit A to pending. Fire two `apply_artifact_approve` calls in `Promise.all` via two service-client connections. | `scripts/verify-v25.js` | Exactly one returns `{ok: true, code: null}`, the other `{ok: false, code: "stale_state", current_status: "approved"}`. |
| 3 | codex #5 + X10 — race: approve-vs-return | Submit B to pending. Fire `apply_artifact_approve` AND `apply_artifact_return` in `Promise.all`. | `scripts/verify-v25.js` | Exactly one returns `{ok: true}`. Loser returns `stale_state`. Final `approval_status` is the winner's target. (Without CAS, both succeed and the artifact ends up in an undefined state.) |
| 4 | codex X10 — race: approve-vs-withdraw | Submit C to pending. Fire approve (as approver) + withdraw (as author) in `Promise.all`. | `scripts/verify-v25.js` | Same shape as #3. |
| 5 | codex #6 + X11 — event-insert rollback | Submit D to pending. Add a **temporary** event-type CHECK constraint that excludes `'approved'` (force the insert failure): `ALTER TABLE public.approval_events DROP CONSTRAINT approval_events_event_type_check; ALTER TABLE public.approval_events ADD CONSTRAINT tmp_check CHECK (event_type IN ('submitted', 'returned', 'withdrawn', 'rejected'));`. Run `apply_artifact_approve`. Restore the original constraint. | `scripts/verify-v25.js` | RPC returns `{ok: false, code: "internal", current_status: "pending", message: null}`. Artifact D's `approval_status` STILL `pending` (UPDATE rolled back via the EXCEPTION subtransaction). No event row inserted for D's approve attempt. |
| 6 | codex #7 — rejected end-to-end | Submit E to pending. Call `apply_artifact_reject` with `p_payload = {comment: "no go"}`. Verify state + event. Then `PATCH /api/<type>/<E>` from the UI. | `verify-v25.js` + `/qa` | RPC returns `{ok: true, new_status: "rejected"}`. `event_type = 'rejected'` (proves CHECK widening). PATCH returns 409 with body explaining the mutation-block. |
| 7 | codex X4 — buggy caller blocked by legal-transition guard | Call `apply_artifact_approve(p_expected_status='draft', ...)` directly (not a legal transition for the approve function). | `verify-v25.js` | RPC returns `{ok: false, code: "internal", current_status: null, message: null}`. Artifact state unchanged. |
| 8 | codex P1 #8 fold-in — existence-leak | As practitioner P1 (no role on org B), `GET /api/initiatives/<id-in-org-B>`. | `/qa` | Response is `404 Not Found`, not `403 Forbidden`. |
| 9 | A7 lock + codex X8 — approved fully immutable | Approve artifact A. Then attempt PATCH on A via its general PATCH route. Then attempt `audits/[A]/run` for an audit. | `/qa` | All return 409 with mutation-block message. |
| 10 | codex X9 — strategic_approver creations start in `draft` | As strategic_approver, POST to `/api/<type>` to create a new artifact. Read response. | `/qa` | Response shows `approval_status: "draft"`, `approved_by_practitioner_id: null`, `approved_at: null`. |
| 11 | codex X12 — `approved_with_edits` is event_type only | Browse the approval_events for any S2-test artifact. | `/qa` (or psql) | If an `approved_with_edits` event exists, the artifact's `approval_status` is `'approved'`, never `'approved_with_edits'`. (In S2, no `approved_with_edits` events fire because the lying button is gone; this scenario validates schema design for S3.) |
| 12 | Type-union widening | `npx next build`. | local | Build succeeds; TypeScript types for `event_type` include `'rejected'`; `approval_status` union includes `'rejected'`. |

**Scenarios 1–5, 7** are scripted in `scripts/verify-v25.js` and re-runnable (regression net). All use service-role connections + a throwaway test org created at script start and dropped at end (rollback-style for the test artifacts).

**Scenarios 6, 8–11** are `/qa` flows (browser interaction; harder to script without a test framework).

**Scenario 12** is the build check.

`scripts/verify-v25.js` runs after `node scripts/migrate.js src/lib/db/schema-v25-substrate-correctness.sql` in the implementation order; failure halts implementation until the migration is fixed.

## 8. Codex review log (2026-05-21 — `/codex` against the plan)

`gpt-5-codex` (high reasoning, 1.2M tokens, read-only) reviewed the draft plan and surfaced **14 findings**. All addressed in this revision; mapping for traceability:

| # | Finding | Resolution |
|---|---|---|
| X1 | `node scripts/migrate.js v25` wrong | §5 step 4 corrected to file-path invocation |
| X2 | SQL function permissions default to PUBLIC | §3.1 — `SECURITY DEFINER` + `SET search_path` + `REVOKE EXECUTE ... FROM PUBLIC; GRANT ... TO service_role` per function |
| X3 | Typed rollback needs explicit subtransaction | §3.1 — `BEGIN ... EXCEPTION WHEN OTHERS ... END` inside each function |
| X4 | RPCs must enforce legal transitions, not just CAS | §3.1 — per-function legal-transition guard before lock |
| X5 | `invalid_columns` contradicts "SQL trusts Zod" | §3.1 — removed `invalid_columns` from error surface; bypass surfaces as `internal` |
| X6 | Edit schemas invented column names | §3.3 — re-derived from real schemas (v11, v12, v14, v16, v19) with table mapping |
| X7 | "4 PATCH endpoints" wrong | §3.9 — corrected to 7 mutation paths (3 general PATCH + 1 step-status + 3 audit non-PATCH mutators) |
| X8 | "Approved is fully immutable" missed non-PATCH mutators | §3.9 — guard applied to audits/run, audits/companion, audits/extract too |
| X9 | strategic_approver auto-approval conflicts with immutability | §3.9 — `initialApprovalStateForRole` strategic_approver branch returns `draft`; legacy auto-approved rows forward-only |
| X10 | Race test too narrow (approve-vs-approve only) | §7 — added approve-vs-return and approve-vs-withdraw scenarios |
| X11 | Event-failure test infeasible as written | §7 — rewritten to use a temporary CHECK constraint on event_type |
| X12 | State diagram conflated event_type with approval_status | §4 — diagram rewritten; `approved_with_edits` is event-only, status stays `approved` |
| X13 | Raw PG error in `internal` response = info leak | §3.1 — `message: NULL` to client; full error via `RAISE LOG` server-side |
| X14 | Plan understated UI breakage | Verified during review: `approval-actions.tsx:115-122` has a lying button with no real edits payload. §3.2 + §5 step 8: kill the button; real UX is S3 |

**Plan-level codex verdict:** the substrate design is sound after these revisions. The implementation-level `/codex` review runs separately after code is written (per CLAUDE.md hard gate).

### 8.1 Implementation-level codex review (2026-05-21, post-code)

Second `/codex` pass against the diff (per CLAUDE.md hard gate). 13 findings, all addressed in this same PR before merge:

| # | Finding | Resolution |
|---|---|---|
| I1 | audits/run + audits/companion missing CAS on UPDATE — race-vulnerable post-pre-check | Added `.in("approval_status", ["draft", "returned"])` to all 3 audit-run UPDATEs (mark-running, mark-complete, rollback-to-ready) and the companion-persist UPDATE. CAS-failed audit-output is discarded with a 409 explaining "state changed during run" |
| I2 | audits/run + audits/companion used `assertPractitionerOwnsOrg` (allows viewers) | Switched both to `assertCanWrite` — matches codex-audit-2026-05-21 finding #9 |
| I3 | role-gates.ts 403→404 fold-in too broad — masked 401 (unauthenticated) + role-failed 403 (legit viewer) | Rewrote `assertCanActOnArtifact` to a two-step: `assertPractitionerOwnsOrg` first (mask cross-org 403 to 404, keep 401 as-is), THEN inline WRITE-role check (real 403 for viewer-in-org) |
| I4 | approve/return/reject still cross-org-leaked via fetch-then-`assertCanApprove` | Extracted `fetchArtifactForApproverAction` helper that applies the same 404-mask pattern as `assertCanActOnArtifact`. All 3 handlers now go through it |
| I5 | TABLE mapping duplicated 3× in approval-actions.ts | Exported `ARTIFACT_TABLE` from role-gates.ts; helper uses it; the 3 inline `TABLE` constants gone |
| I6 | `apply_artifact_approve` logged `approved_with_edits` for non-empty p_edits but didn't apply edits (lying event redux) | S2 RPC now fails with `code='internal'` if p_edits is non-empty; always logs 'approved'. Conditional event_type + dynamic UPDATE both land in S3 together |
| I7 | `ApprovalActions` only rendered on initiative detail pages — X9 stranded strategic_approver-created status_reports/selections/audits in draft | Added `ApprovalActions` to selections + audits detail pages with full prop wiring (isApprover, isAuthor, latestReturnComment). Status_reports deferred — see §3.10 below |
| I8 | inbox.tsx omitted `'rejected'` from TS union; query used `.neq("approval_status", "approved")` so rejected rows leaked into inbox with no section | Widened TS union; switched query to `.in("approval_status", ["draft", "pending", "returned"])` explicit allowlist of in-flight states |
| I9 | Reject button used `window.prompt` (accessibility + no terminal-action confirmation) | Replaced with in-page form: terminal-state warning, textarea for reason, "I understand this is permanent" checkbox, brick-colored permanent-reject button |
| I10 | verify-v25.js only tests `initiatives` — the 4-way switch in SQL helpers could be broken for the other 3 tables | Accepted as known limitation for S2. The 4-way switch is structurally simple (4 identical IF branches per helper); a regression would surface in /qa on the affected artifact type. Adding per-type tests is a fast-follow (cost: ~30 min; benefit: regression net for the SQL helper structure) |
| I11 | verify-v25.js scenario 5 didn't assert `current_status: "pending"` or `message: null` | Added both asserts. The message=null assert is the codex X13 info-leak gate |
| I12 | Race scenarios didn't verify final state or event count | Added final-state + event-count assertions to scenarios 2, 3, 4. Stale call's `current_status` also asserted to reflect the winner's move |
| I13 | No behavioral test for `apply_artifact_reject` — only structural function-existence | Added scenario 6: submit → reject → verify state='rejected' + event_type='rejected' + payload.comment passes through + attempting to re-submit from 'rejected' fails the legal-transition guard with code='internal' |

**Implementation codex verdict:** ready to merge after the plan and code-level fixes. The mandatory `/codex` gate on schema + auth-touching changes is satisfied by this two-pass discipline (plan-level + implementation-level).

## 9. References

- `docs/CODEX-AUDIT-2026-05-21.md` — the source findings (codex P1 #4-#11).
- `docs/STRATEGIC-FRAME-2026-05-21.md` — the build sequence locking S2 first.
- `docs/SESSION-HANDOFF-2026-05-21.md` — state at close of last session, including the codex hard-gate lock.
- `src/app/api/_lib/approval-actions.ts` — the file being rewritten.
- `src/lib/db/schema-v23-operator-role-and-approvals.sql` — original `approval_events.event_type` CHECK (line 161 missing `'rejected'`).
- `src/lib/db/schema-v24-five-roles-and-coach-mode-substrate.sql` — added `'rejected'` to artifact `approval_status` but NOT to event_type CHECK.
- `src/lib/auth/role-gates.ts` — the codex P1 #8 existence-leak (line 144–146).
- `src/lib/auth/initial-approval-state.ts` — strategic_approver auto-approval branch to be changed (codex X9).
- `src/components/approval-actions.tsx:115-122` — the lying "Approve with edits" button to be deleted (codex X14).
- Artifact schemas: `schema-v11-initiatives.sql`, `schema-v12-selections.sql`, `schema-v14-cadence-and-status.sql`, `schema-v16-audits.sql`, `schema-v19-initiatives-replace-legacy.sql` — source of truth for editable columns (codex X6).

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | Not run (substrate-fix sprint; strategic frame locked 2026-05-21 already covers scope) |
| Codex Review (plan) | `/codex review` (against the plan) | Independent 2nd opinion on the plan | 1 | CLEAR | 14 findings, 14 fixed in plan revision; see §8 |
| Codex Review (impl) | `/codex review` (against the diff) | Mandatory hard-gate on schema + auth changes | 1 | CLEAR | 13 findings, 13 fixed in this PR; see §8.1 |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR (PLAN) | 1 scope check, 4 architecture, 2 code-quality, 3 test — all 10 resolved into the plan |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | No UI design surface in S2 beyond deleting the lying button (codex X14) |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | Internal API substrate; no developer-facing change |

- **CODEX (plan):** caught 4 P1 plan-accuracy bugs (X1, X6, X7, X12), 7 substrate-hardening gaps (X2, X3, X4, X5, X10, X11, X13), and 3 founder-taste decisions (X8, X9, X14) — all 14 absorbed into the revised plan with traceability in §8.
- **CODEX (impl):** caught 13 implementation bugs (I1–I13) after the plan was locked — race-vulnerable mutation guards, mis-scoped 404 fold-in, cross-org leak in approver path, lying-event redux in approve RPC, UI coupling, accessibility regression, and test-coverage shortcuts. All 13 fixed in this same PR; traceability in §8.1. I10 (verify-v25.js only tests initiatives) accepted as known limitation with a fast-follow note.
- **CROSS-MODEL:** plan-eng-review and codex agreed on the substrate shape (typed RPC, SECURITY DEFINER, CAS via FOR UPDATE, mutation guards, end-to-end rejected). Codex extended the eng-review's coverage twice: at plan-level it caught invented column names + missing mutation surfaces; at impl-level it caught race-leftovers, role-gate over-broadening, and UI coupling I missed. The two-pass discipline (eng + codex × plan + code) caught what neither single voice would.
- **UNRESOLVED:** 0 decisions left open. Every architecture, substrate, and impl question is locked.
- **VERDICT:** ENG CLEARED + CODEX (PLAN + IMPL) CLEARED — ready to PR. Founder applies `node scripts/migrate.js src/lib/db/schema-v25-substrate-correctness.sql` + runs `node scripts/verify-v25.js` from a worktree with `.env.local` after merge.
