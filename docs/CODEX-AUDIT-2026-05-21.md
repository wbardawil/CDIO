# Codex audit — 2026-05-21

Adversarial audit by OpenAI Codex (gpt-5-codex, high reasoning, 1.2M tokens) of what shipped this week. The founder ran this after expressing disappointment that visible Day-1 capability was thin relative to the journey-map plan.

The audit produced **14 findings, 10 of them P1**. This doc persists them with file:line citations and assigns each to a remediation sprint so we don't lose track.

## Summary

| Category | Count | Severity | Owner sprint |
|---|---|---|---|
| Real-vs-claimed gap (the visible-feature debt) | 3 | P1 + advisory | Phase A item #4 wizard + S3 Decision Package |
| Architecture bugs in S1.5 substrate | 4 | P1 | S2 substrate fix |
| Auth / IDOR holes | 4 | P1 | Security hotfix (this week) |
| Methodology wiring | 1 | P2 | Phase A item #4 wizard |
| Production-readiness | 2 | P1 | S3 Decision Package |

## All 14 findings (verbatim from Codex)

### Real-vs-claimed gap

**1. [P1]** Recent commits mostly shipped scaffolding/debug, not Day-1 capability.
- `ec42353` (S1): operator invite → inbox → submit/approve workflow shipped, but S1 itself states "no wizards, no Coach Mode" and approval-with-edit diff is not real. `docs/sprint-S1-foundation.md:16,20,159`
- `6bf42e7` (S1.5): docs admit "NOT new user-facing capability." `docs/sprint-S1-5-amendment.md:12,14`
- `6486c68` (#10): Settings link + dashboard diagnostics only. `src/components/workspace-shell.tsx:59`, `src/app/settings/page.tsx:20`
- `194fe9e` (#11): PGRST201 hotfix only. `src/lib/auth/assert-owns-org.ts:40`
- `66fa738` (#12): preview disclosure polish only. `src/app/preview/module/[n]/page.tsx:151`
- `364a5e9` (#13): 403 fingerprint diagnostic only. `src/lib/auth/assert-owns-org.ts:68`

**2. [P1]** Phase A item #4 (Maturity Quick Scan wizard) is **not built**. Confirmed: there's public `/scan`, tokenized `/assess/[token]`, and `/preview`; no `/assess/self`, no self-paced practitioner Maturity Quick Scan. `/scan` uses the *old* 48-question quick-scan file, not the ratified diagnostic bank. `src/app/scan/page.tsx:6`, `src/lib/playbook/quick-scan-questions.ts:14`, `src/app/assess/[token]/page.tsx:245`

**3. [P1]** The "5-role model" is incoherent. The handoff §4 says 5 roles including token-based `submitter`. The DB/TS enum actually has **six** persisted roles including legacy `collaborator` and `viewer`, while `submitter` is *excluded*. Any Phase D logic branching on the handoff model will be wrong. `docs/sprint-S1-5-amendment.md:18`, `src/lib/db/schema-v24-five-roles-and-coach-mode-substrate.sql:22,59`, `src/lib/auth/assert-owns-org.ts:6`

### Architecture bugs in S1.5 substrate (Phase D Coach Mode will not work as designed)

**4. [P1]** Coach Mode `prior_version` substrate is broken. The approve flow assumes edits were saved via some PATCH endpoint before approval, then snapshots the *already-edited* row, so `prior_version` is NOT the operator-submitted version — it's the post-edit version. It's a flag, not a diff. Coach Mode can't learn what the CDIO changed. `src/app/api/_lib/approval-actions.ts:183,193,215`

**5. [P1]** Approval state transitions are race-prone. Handlers read state, then UPDATE by `id` only — no `approval_status = expected_state` in the predicate. Concurrent approve/return/withdraw can all pass the precheck, last write wins, multiple incompatible events get logged. `src/app/api/_lib/approval-actions.ts:71,77,197,202,270`

**6. [P1]** Approval event integrity not guaranteed. State update + event insert are NOT in one transaction. Event insert failure is silently swallowed; snapshot failure writes `prior_version = null`. Audit trail breaks exactly where Coach Mode depends on it. `src/app/api/_lib/approval-actions.ts:311,322,336,355`

**7. [P1]** `rejected` state is schema-only. v24 adds `rejected` to artifact `approval_status` enum, but no route, no handler, and the `event_type` CHECK + TS union omit `rejected`. The terminal-no state can't be exercised. `src/lib/db/schema-v24-five-roles-and-coach-mode-substrate.sql:122,148`, `src/app/api/_lib/approval-actions.ts:300`

### Auth / IDOR holes (real exploits — fix this week)

**8. [P1]** IDOR remediation overstated. The S1 sprint doc says cross-org access should return 404 to avoid existence-leak; the implemented gate returns 403. Cross-org mutation blocked, but existence oracle remains. `docs/sprint-S1-foundation.md:233`, `src/lib/auth/role-gates.ts:111,114`

**9. [P1]** Write gates inconsistent. `assertCanWrite` (which blocks viewers) exists, but most CREATE/UPDATE endpoints still call only `assertPractitionerOwnsOrg`. So any org member including `viewer` can mutate outside the 16 approval-action endpoints. `src/lib/auth/role-gates.ts:48`, `src/app/api/selections/[id]/route.ts:69,91`, `src/app/api/status-reports/[id]/route.ts:79`, `src/app/api/audits/[id]/route.ts:79`, `src/app/api/initiatives/[id]/step-status/route.ts:47`

**10. [P1]** **Real cross-org IDOR in assessment synthesis.** `/api/assessments/synthesize` authorizes `input.org_id` but then reads/writes by arbitrary `input.assessment_id` without proving the assessment belongs to that org. Same shape in `/api/roadmaps`. `src/app/api/assessments/synthesize/route.ts:16,25,32,161`, `src/app/api/roadmaps/route.ts:16`

**11. [P1]** Public assessment submission trusts client-supplied IDs. `/api/assessments` (the stakeholder-token-facing endpoint) accepts `org_id`, `assessment_id`, and `stakeholder_id` from the browser and upserts `module_scores` without token-proof or ownership binding. A token holder can tamper with IDs to attribute scores to other stakeholders or even other orgs. `src/app/api/assessments/route.ts:19,122,136`

### Methodology wiring

**12. [P2]** The "124 strong" bank is wired but not as claimed. Actual: 124 strong / 4 weak (not 128 strong). Wired into `/preview` and the tokenized stakeholder assessment via `getModuleQuestions()` + citations; `/scan` still uses the *old* quick-scan bank. **No operator self-diagnostic flow exists** (confirms finding #2). `CLAUDE.md:141`, `src/lib/playbook/question-citations.ts:1744`, `src/components/forms/assessment-form.tsx:66,296`, `src/app/preview/page.tsx:143`

### Production posture

**13. [P1]** Current "Decision Package" is not board-defensible. It's a divergence JSON blob with three generated fields, fallback ROI = `"To be calculated"`, stored inside `divergence_points`. No first-class package table, no evidence ledger, no versioning, no approval/export path, no citation contract. `src/lib/agents/assessment.ts:372,415`, `src/app/api/assessments/synthesize/route.ts:105,127,138`, `src/lib/db/schema.sql:103`

**14. [P1]** Concrete gap to "assistant produces a board-defensible Decision Package":
- `schema-v25-decision-packages.sql` — first-class `decision_packages` table + versions + evidence citations + source artifacts + approvals + exports
- `src/lib/agents/decision-package.ts` — generator (LLM + methodology citations)
- `src/app/api/decision-packages` + `[id]/generate`, `/approve`, `/export` routes
- `src/app/clients/[orgId]/decision-packages` workspace pages
- Wire inputs from assessments, selections, audits, initiatives, status reports — not only divergence pairs
- Current `decisions` table is a separate outcome tracker; the resolve route still updates `divergence_points`, not a package artifact. `src/lib/db/schema.sql:157`, `src/app/api/decisions/[id]/resolve/route.ts:41,61`

## Remediation plan

### Security hotfix (this week, ~90 min)

Findings #9, #10, #11 — exploitable today.

- `/api/assessments/synthesize` and `/api/roadmaps` must verify `assessment.org_id === input.org_id` BEFORE any read/write
- `/api/assessments` (stakeholder POST) must derive `org_id`, `assessment_id`, `stakeholder_id` from the token, not from the request body
- Audit every endpoint that uses `assertPractitionerOwnsOrg` for mutations; switch the write-side calls to `assertCanWrite`
- `/codex` gate before merge

### S2 substrate fix (3-4 hours)

Findings #4, #5, #6, #7 — block Phase D Coach Mode + Quick Scan reliability.

- `schema-v25-substrate-correctness.sql`:
  - Add a Postgres function (or RPC) for atomic state-and-event writes
  - Optionally add `WHERE approval_status = $expected` to make the state-transition CAS-safe at the SQL layer
  - Add `'rejected'` to `approval_events.event_type` CHECK
- Rewrite `src/app/api/_lib/approval-actions.ts`:
  - Capture `prior_version` snapshot BEFORE the UPDATE, not after
  - Pass `expected_status` to the RPC; surface 409 if the row moved
  - Don't swallow event-insert failures — if the event fails, roll back the state change
  - Wire `rejected` end-to-end (handler, route, TS union)
- `/codex` gate before merge

### Phase A item #4 — Maturity Quick Scan wizard (2-3 days)

Finding #2 + #12 — the visible Day-1 feature.

- Decide: 48 questions (Quick Scan) vs 128 (DEEP)? Use Quick Scan for first ship.
- `/clients/[orgId]/assess/self` route
- Reuses the corrected S2 substrate for the submit → approve workflow
- Save progress between sessions
- `/codex` gate before merge

### S3 First-class Decision Package (5-7 days)

Findings #13 + #14 — the MVP-defining sprint. Without this, "an assistant produces a board-defensible Decision Package" is not real.

- Full scope per #14 above
- `/codex` gate before merge

### Other

- Finding #1: documented constraint, not a fix. The shipping pattern this week was substrate-heavy.
- Finding #3: 5-role model coherence — fold into S2 substrate fix. Either (a) document `collaborator` / `viewer` as advisory + add `submitter` (token-based, separate table); or (b) re-name to match the handoff.
- Finding #8: existence-oracle. Low-priority leak. Fold into the security hotfix if cheap; otherwise S2.

## Process change locked

Per founder decision on the audit: **`/codex` is mandatory on every schema change and every auth change**, with the same weight as `/plan-eng-review` and `/cso`. Added to CLAUDE.md Process Discipline section.

## Audit cost

~1.2M tokens. Estimated cost: $1.50–3.00 at gpt-5-codex high-reasoning rates. Caught 4 substrate bugs + 3 real auth/IDOR holes that my single-voice review missed across 5 PRs. Worth it.
