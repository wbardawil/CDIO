# Session handoff · 2026-05-21 (final state)

End of a long session that closed three real exploits, captured 14 codex audit findings, locked the product strategic frame after four rounds of founder pushback, and locked all six previously parked open items. This doc is the cold-start context for the next session.

**This handoff was rewritten end-of-session to reflect TRUE final state.** Earlier versions snapshot-froze mid-merge-sequence; if you saw "PR #15 pending" or "lock open items" listed as TODO, that's stale. Read this version as the operating context.

---

## STATE AT CLOSE OF 2026-05-21 — start here

**Everything ships on main. Nothing is pending. Vercel is auto-deploying the latest.**

### All 12 PRs from this session are merged

| PR | Commit (squashed) | What |
|---|---|---|
| #7 | b448b60 | Initiative portfolio (Gantt + cash flow + quick-add) |
| #8 | ec42353 | S1 foundation (operator role + invitations + approval workflow, schema-v23) |
| #9 | 6bf42e7 | S1.5 (5-role model + Coach Mode substrate, schema-v24) |
| #10 | 6486c68 | Hotfix bundle (dashboard error specifics + Settings nav + `/settings`) |
| #11 | 194fe9e | PGRST201 critical fix |
| #12 | 66fa738 | Preview UX (methodology disclosure collapse) |
| #13 | 364a5e9 | Clerk-session fingerprint diagnostic on every-API 403 |
| #15 | 75143de | Security hotfix (codex findings #9, #10, #11) |
| #16 | fa0d8e1 | Strategic frame + session handoff (docs) |
| #19 | 712d91e | Lock all 6 open items from CEO review (docs) |
| #21 | 5205289 | Fix session handoff staleness — rewrite for TRUE final state (docs) |
| #22 | 8590e8c | Scrub external-tool name from session handoff (docs) |

Note: `git log` will also show `7aac496` as a duplicate of PR #19's content. That's an artifact of a 504 retry during the merge; same content, harmless. Also note: PRs #18 and #20 net-zero each other (added then removed a docs file); they ship to `main` for traceability but are not in this ledger to keep the operating reference clean.

### Strategic frame is fully locked

`docs/STRATEGIC-FRAME-2026-05-21.md` contains FOUR locks plus all six previously-parked items resolved. Compressed:

**Lock 1 · Product positioning.** Org IT operating system, not a CDIO's personal toolkit. Two equal-weight surfaces (CDIO Workbench + IT Project Portfolio) on a shared methodology backbone. Role-based default landing inside one product.

**Lock 2 · Two-layer methodology.** Layer 1: 16 IT modules × 128 questions (CMMI/COBIT/NIST/ITIL/TBM, already built, 124 strong / 4 weak). Layer 2: 6 PM cross-cutters (RAID, stakeholder, scope baseline, change log, value tracking, retro), NOT built.

**Lock 3 · 5-dimension success rubric (measured at graduation).** Equal weights N/5 + hard-fail RED flags on dimensions 3 (value-realized) and 4 (security incident). On-time + on-budget (±10%) + value-realized (±25%) + no security incident (90 days) + retro >= 4/5.

**Lock 4 · CDIO Workbench IS the Company IT Architecture Map.** Layered (Pillars → Business Caps → IT Caps → Apps → Infra/Data). Three visual toggles (layered alignment view / matrix heatmap / force-directed graph) on one dataset. Seven saved lenses (security / vendor / AI / cost-TBM / strategic alignment / compliance / talent).

**Lock 5 · all six previously parked items (now resolved):**

- 5.1 **Scale** — no cap. Build for scale. Cost vectors tracked but none blocking.
- 5.2 **Roles** — 8 total. Added `project_owner` + `business_sponsor`. Two new FK columns on initiatives.
- 5.3 **Rubric weights** — equal weights with hard-fail RED flags on dim 3 + 4.
- 5.4 **Security incidents** — proper table (full model: category, severity, timing, affected systems, data classification, reporter, regulatory).
- 5.5 **Retro rubric** — 5 questions, 1-5 scale (Outcome / Process / People / Methodology / Future). Mandatory raters: project_owner, business_sponsor, strategic_approver.
- 5.6 **Standard library** — 25 business capabilities (BIZBOK v9 + TBM 5.0.1) + 20 IT capabilities (TBM + Gartner). Seeded per engagement via RPC; engagement owns its copy.

### Schema-v25 (S2.5 sprint) is fully scoped

When you sit down to S2.5, the migration writes itself from the locks:

```
1.  touched_modules:int[] on initiatives / selections / audits / status_reports
2.  Reverse GIN index for "show me everything touching M7"
3.  6 PM cross-cutter tables: raid_logs, stakeholder_maps, scope_baselines,
    change_logs, value_tracking, retros
4.  success_scorecard table (5 dimensions + hard-fail flags + computed aggregate)
5.  project_owner_practitioner_id + business_sponsor_practitioner_id FK
    columns on initiatives
6.  realized_value_minor_units + realized_cost_minor_units +
    actual_completed_at columns on initiatives
7.  security_incidents table (full model per Lock 5.4)
8.  business_capabilities + it_capabilities + strategic_pillars tables
9.  init_engagement_taxonomy() SQL function for seeding the standard library
10. Widen practitioner_clients.role CHECK to 8 values
    (strategic_approver / business_sponsor / project_owner / technical_reviewer /
    financial_approver / operator / collaborator / viewer)
11. Widen pending_invitations.role CHECK to 7 values
    (excludes strategic_approver — bootstrap-only)
```

`/codex` mandatory review before merging this migration per the new hard-gate discipline.

### Build workflow: tight-loop direct build (locked end-of-session)

Future UX work follows this pattern. **No mockup layer.** The session's earlier mockup-first idea was challenged and dropped — see "Why no mockup layer" below.

```
1. Build a narrow real surface in src/app/ (NOT under /mockup)
2. Use real DESIGN.md tokens, stub data initially, no DB writes until wiring step
3. Ship to Vercel via PR (squash-merge, /codex on schema + auth changes)
4. Founder reviews the live deployed page
5. Feedback → iterate REAL code (compounds) OR rip out (small loss, real learning)
6. Once visual approved, wire to real data + add real writes in a follow-up PR
```

PRs are 1-2 days each maximum. Founder reviews on Vercel between every PR. Same feedback loop a mockup would provide, but the artifact compounds instead of becoming throwaway.

**Why no mockup layer.** The pain this session was auth (PGRST201), schema integrity (Coach Mode prior_version), cross-org IDOR, race-prone state transitions, viewer-can-mutate. Fourteen codex findings, zero of them visual. Mockups don't catch any of those. The actual safety nets — `/codex` mandatory on schema+auth, `/qa` on deploys — are already locked in CLAUDE.md Process Discipline. A mockup layer is insurance against a risk that already has better insurance, and it produces throwaway artifacts the real build then duplicates.

---

## What to do first in the next session

The strategic groundwork is done. The next session has three legitimate entry points; pick the one that matches your energy:

**Recommended order: S2 → S2.5 → S3 → S4 → S5 → S6 → S7.** Build real surfaces in 1-2 day PR increments with founder Vercel review between each. No mockup layer.

**Path A — Start S2 substrate fix (recommended next).**
The 4 codex P1 substrate bugs in `src/app/api/_lib/approval-actions.ts` (prior_version captured POST-edit not PRE-edit, race-prone state transitions, no transaction integrity, `rejected` end-to-end). ~3-4 hours. `/plan-eng-review` then `/codex` before code. Unblocks every downstream sprint.

**Path B — Start S2.5 schema-v25.**
The schema is fully scoped (see above). Write the SQL, apply via `scripts/migrate.js`, write `scripts/verify-v25.js`, run `/codex` on the migration before commit. ~2 days. Required before S3 / S4 / S5.

**Path C — Skip ahead to S3 Decision Package wizard step 1.**
Build the wizard shell (8-step stepper, plain-language operator prompts, stub data, no schema yet) as the FIRST visible-product surface for founder review. ~1 day. Caveat: S2 + S2.5 must still happen before wiring to real data.

**Founder's stated preference:** A → B → C in order. Land S2 first (substrate sound), S2.5 second (data layer correct), then ship S3 as the first visible surface for live feedback.

---

## Codex audit findings status (from `docs/CODEX-AUDIT-2026-05-21.md`)

14 findings total. 3 P1s already closed in PR #15 (security hotfix). 11 remain, all assigned to upcoming sprints:

| # | Finding | Sprint |
|---|---|---|
| 1 | Recent commits are scaffolding, not Day-1 capability | Documented constraint |
| 2 | Phase A item #4 (Quick Scan wizard) not built | S4 (CDIO running maturity in Workbench) |
| 3 | 5-role model incoherent (6 DB values, no submitter) | S2 + S6 (submitter is token-based) |
| 4 | Coach Mode prior_version captured POST-edit | **S2** |
| 5 | Approval state transitions race-prone | **S2** |
| 6 | State+event not atomic, failures swallowed | **S2** |
| 7 | `rejected` state schema-only (no handler/route) | **S2** |
| 8 | IDOR remediation returns 403 not 404 (existence leak) | Documented, S2 or later |
| 9 | Write gates inconsistent across mutation endpoints | **CLOSED (PR #15)** |
| 10 | Cross-org IDOR on synthesize + roadmaps | **CLOSED (PR #15)** |
| 11 | Public assessment POST trusts client IDs | **CLOSED (PR #15)** |
| 12 | 124-strong bank wired to `/preview` + token assessment, not operator self-flow | S4 (Quick Scan in Workbench) |
| 13 | Decision Package not board-defensible (divergence blob) | **S3** |
| 14 | Concrete gap to "assistant produces board-defensible Decision Package" | **S3 scoping** |

---

## Build sequence (final after CEO review + 6-item locks)

```
S2     (3-4 hours)       Substrate fix — codex P1s #4, #5, #6, #7
S2.5   (~2-3 days)       Schema-v25 (fully scoped above)
S3     (~5-7 days)       First-class Decision Package
S4     (~11 days)        CDIO Workbench = Architecture Map (phased a/b/c)
S5     (~5 days)         IT Project Portfolio surface
S6     (~3-4 days)       Phase E Demand Catalog + token-based submitter
S7     (~5 days)         Phase D Coach Mode

TOTAL                    Roughly 6-8 weeks of focused build
```

Every sprint ships in 1-2 day PR increments to Vercel; founder reviews live between increments. No mockup layer.

---

## Reference docs (read in this order if cold-starting)

1. **This doc** — operating context for the next session.
2. `docs/STRATEGIC-FRAME-2026-05-21.md` — the strategic locks + build sequence + all 6 items resolved. The single most important doc.
3. `docs/CODEX-AUDIT-2026-05-21.md` — 14 findings, P1 list, sprint assignments.
4. `docs/sprint-S1-foundation.md` — S1 design + eng + cso review findings.
5. `docs/sprint-S1-5-amendment.md` — S1.5 design + review findings.
6. `docs/sprint-S1-smoke-test.md` — manual test runbook for S1 (still valid).
7. `CLAUDE.md` — top section + Process Discipline (now includes `/codex` hard gate).
8. The previous session's journey-map handoff at the top of `CLAUDE.md` — context only; supersedes are noted in the strategic frame doc.

---

## Permanent rules (every session, non-negotiable)

**Confidentiality.** Real client / customer / engagement details the founder shares are in-session reasoning ONLY. NEVER persist into code, comments, docs, prompts, fixtures, commit messages, or anything that lands in git. Every example must be invented and obviously fictional.

**gstack discipline (CLAUDE.md Process Discipline section).**
- `/codex` MANDATORY on every schema change + every auth change (hard gate locked 2026-05-21).
- `/plan-eng-review` before any architecture commit.
- `/cso` before any privacy-sensitive feature.
- `/review` before any merge to main.

**Process patterns.**
- Apply schema migrations BEFORE merging the PR.
- PR-with-squash-merge via `gh pr merge --squash --delete-branch`.
- New worktree per workstream.
- Founder picks branch strategy explicitly.
- Founder explicitly invites challenge; push back honestly.
- Stop analysis paralysis when called out — lead with the point, concrete > abstract, honest pushback > sycophancy.

**Worktree friction notes (carry forward).**
- Fresh worktrees don't have `node_modules`; copy from a sibling via `robocopy ..\<sibling>\node_modules .\node_modules` (~1 min on Windows).
- `gh pr merge --squash` errors with `fatal: 'main' is already used by worktree...` after every merge. The GitHub merge itself succeeds; the local-checkout step is what errors. Confirm via `gh pr view <n> --json state`.

---

## Handoff-staleness lesson (don't repeat)

Earlier versions of this doc snapshot-froze mid-merge-sequence and pointed at PR #15 as "pending." A new session reading it reasonably started questioning a merged PR.

**Lesson:** the handoff must be rewritten AFTER the final merge of a session, not before. State that has changed between draft and close (open PRs, in-progress decisions, unresolved items) needs to be either resolved before commit or marked with a clear "as of HH:MM UTC" timestamp.

This version was rewritten 2026-05-21 ~14:30 UTC, after the last merge.
