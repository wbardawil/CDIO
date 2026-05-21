# Session handoff · 2026-05-21

End of a long session that closed three real exploits, captured 14 codex audit findings, and locked the product strategic frame after three rounds of founder pushback. This doc is the cold-start context for the next session.

## What shipped this session (in order)

1. **PR #8** ec42353 — S1 foundation. Operator role + invitations + approval workflow. Schema-v23.
2. **PR #9** 6bf42e7 — S1.5. 5-role model + Coach Mode substrate (actor_role + prior_version). Schema-v24.
3. **PR #10** 6486c68 — Hotfix bundle. Dashboard error specifics + Settings in chrome nav + `/settings` page.
4. **PR #11** 194fe9e — CRITICAL fix. PGRST201 dual-FK ambiguity in `assertPractitionerOwnsOrg`. Without this, every API write 403'd.
5. **PR #12** 66fa738 — Preview UX. Collapse methodology tags + framework citation behind a disclosure.
6. **PR #13** 364a5e9 — Diagnostic. Surface clerk-session fingerprint on every-API 403.
7. **PR #15** (status TBD at handoff write time) — Security hotfix. Codex audit findings #9, #10, #11. Cross-org IDOR on `/api/assessments/synthesize` + `/api/roadmaps`, public ID tampering on `/api/assessments`, viewer-can-mutate across 15 endpoints.
8. **This branch** — `claude/strategic-frame-2026-05-21`. Strategic frame from `/plan-ceo-review` + this handoff. Documentation only, no code changes.

## What's pending

| Item | Status |
|---|---|
| PR #15 (security hotfix) | Open. Codex-reviewed (one followup commit landed; flagged 5 more endpoints + assessment-id binding which were fixed). Ready to merge. |
| This PR (strategic frame + handoff) | Open. Documentation. No code review needed beyond skim. |
| S2 substrate fix | NOT started. Codex P1 substrate bugs (prior_version capture before mutation, CAS-safe state transitions, transaction integrity, wire `rejected` end-to-end). ~3-4 hours. |
| S2.5 schema-v25 | NOT started. Module-touch tags + 6 PM cross-cutters + success scorecard + architecture map tables. ~2 days. |
| S3 First-class Decision Package | NOT started. Replaces divergence-blob model (codex finding #13). ~5-7 days. |
| S4 CDIO Workbench = Architecture Map | NOT started. Phased S4a/S4b/S4c. ~11 days. |
| S5 IT Project Portfolio surface | NOT started. ~5 days. |
| S6 Phase E Demand Catalog | NOT started. ~3-4 days. |
| S7 Phase D Coach Mode | NOT started. Substrate exists from S1.5. ~5 days. |

## The three strategic locks (from `/plan-ceo-review`)

Documented in full at `docs/STRATEGIC-FRAME-2026-05-21.md`. Compressed here:

**Lock 1 · Product positioning.** AI-CDIO is an organizational IT operating system, not a CDIO's personal toolkit. Two equal-weight surfaces (CDIO Workbench + IT Project Portfolio) on a shared methodology backbone. Role-based default landing, same product.

**Lock 2 · Two-layer methodology.** Layer 1: 16 IT modules × 8 questions = 128 questions (CMMI/COBIT/NIST/ITIL/TBM-anchored, already built, 124 strong / 4 weak / 0 indefensible). Layer 2: 6 PM cross-cutters (RAID log, stakeholder map, scope baseline, change log, value tracking, retro), PMI/PMBOK-anchored, NOT built yet.

**Lock 3 · 5-dimension success rubric (measured at graduation).** On-time + on-budget (±10%) + value-realized (±25%) + no security incident (90 days) + retro >= 4/5. Every guardrail maps to one or more dimensions. Aggregate score is the engagement's renewal-justification artifact.

**Lock 4 (added end-of-session) · The CDIO Workbench IS the Company IT Architecture Map.** Layered (Pillars → Business Capabilities → IT Capabilities → Apps → Infra/Data), strategically aligned. Three visual toggles (layered alignment view, matrix heatmap, force-directed graph) on the same dataset. Seven saved lenses (security, vendor, AI, cost/TBM, strategic alignment, compliance, talent). Mid-market scope only (50-500 apps), strategic alignment focus only (not architecture management), read-mostly (not lifecycle-managed in-here).

## Six open items parked (defaults documented; lock before S2.5 schema commits)

1. **Scale** — initiatives per CDIO/client (drives portfolio surface UX). Default: filter by stage + owner + module-touched. Default view = "needs my attention this week."
2. **Roles** — `operator` sufficient or new `project_owner` / `business_sponsor`? Default: existing 6 roles. PM = operator. Business sponsor = strategic_approver at initiative scope. Tech lead = technical_reviewer.
3. **Success rubric weights** — equal or weighted? Default: equal weight, 1 point per dimension passed. Aggregate is N/5.
4. **Security incident definition** — what counts? Default: yes/no by CDIO at 90-day check-in. Year 2 → proper `security_incidents` table.
5. **Retro 5-question rubric** — exact 5 questions. Default candidates: (a) Did we hit the value thesis? (b) Did the team learn? (c) Was the methodology helpful? (d) Did stakeholders feel heard? (e) Would we do it the same way?
6. **Standard library content** — business capabilities (~35 mid-market default) and IT capabilities (~25 standard). Default: ship a standard set, editable per engagement.

## Codex audit findings status (from `docs/CODEX-AUDIT-2026-05-21.md`)

14 findings total. 10 P1. Status:

| # | Finding | Status |
|---|---|---|
| 1 | Recent commits are scaffolding, not Day-1 capability | Documented constraint, not a fix |
| 2 | Phase A item #4 (Quick Scan wizard) not built | Tracked; lands as part of S4 workbench (CDIO running their org's maturity) |
| 3 | "5-role model" incoherent (6 values in DB, missing submitter) | Resolution in S2 substrate fix or S6 (submitter is token-based) |
| 4 | Coach Mode prior_version captured POST-edit not PRE-edit | **S2 fix** |
| 5 | Approval state transitions race-prone (no CAS predicate) | **S2 fix** |
| 6 | State+event not atomic, failures swallowed | **S2 fix** |
| 7 | `rejected` state schema-only (no handler, no route) | **S2 fix** |
| 8 | IDOR remediation overstated (403 not 404) | Folded into security hotfix (PR #15) |
| 9 | Write gates inconsistent across mutation endpoints | **FIXED in PR #15** |
| 10 | Real cross-org IDOR on synthesize + roadmaps | **FIXED in PR #15** |
| 11 | Public assessment POST trusts client IDs | **FIXED in PR #15** |
| 12 | 124-strong bank wired to /preview + token assessment, not to operator self-flow | Tracked; lands when self-paced flow is built |
| 13 | Decision Package not board-defensible (divergence blob with ROI="To be calculated") | **S3** |
| 14 | Concrete gap to "assistant produces board-defensible Decision Package" | **S3 design** |

After PR #15 merges: 3 P1s closed. 11 remain, all assigned to upcoming sprints.

## Build sequence (final after the CEO review)

```
PR #15 PENDING MERGE   Security hotfix (codex 9/10/11)
THIS PR                Strategic frame + session handoff (docs only)

S2     (3-4 hours)     Substrate fix — codex P1 substrate bugs (4-7)
S2.5   (~2 days)       Schema-v25 — methodology tags + 6 PM cross-cutters
                        + success scorecard + architecture map tables
S3     (~5-7 days)     First-class Decision Package
S4     (~11 days)      CDIO Workbench = Architecture Map
  S4a (~3 days)          Apps list + tagging UI
  S4b (~5 days)          Three visual toggles
  S4c (~3 days)          Seven saved lenses
S5     (~5 days)       IT Project Portfolio surface
S6     (~3-4 days)     Phase E Demand Catalog
S7     (~5 days)       Phase D Coach Mode

TOTAL                  6-8 weeks of focused build
```

## Process discipline (locked this session in CLAUDE.md)

`/codex` is now a **HARD GATE** on every schema change and every auth change. Same weight as `/plan-eng-review` and `/cso`. The 2026-05-21 audit caught 4 substrate bugs + 3 real auth/IDOR holes that single-voice review missed across 6 PRs. Cost: ~$1-3 per audit, ~5 min runtime. Skipping costs hours of debug + shipping exploitable code.

Sprints touching schema (S2, S2.5, S3, S6) all need `/codex` before merge.
Sprints touching auth (S5 has scoped portfolio views) need `/codex` before merge.

## Anti-temptation rules carried forward (handoff §6 from prior session)

1. AI-CDIO never tracks tasks. Tasks live in Jira / Asana / Monday. Read-sync only.
2. No status statuses inside statuses. Initiative has one status.
3. No per-sub-thing assignees. Executive owner per initiative.
4. No in-tool comment / discussion threads.
5. Read-sync only at the L2/L3 boundary.

S5 IT Project Portfolio is the highest-risk sprint for accidental task-tracking creep. Call this out in S5 scoping.

## What to do first in the next session

1. **Verify PR #15 deployed successfully.** Production deployment URL after merge will be on the stable Vercel alias. Test:
   - Dashboard loads (cross-org IDOR fix)
   - Step-status update on initiative (viewer-can-mutate fix)
   - Selection create (assertCanWrite gating)
   - Stakeholder assessment submit via token (token-bound IDs)
2. **Verify this PR (strategic frame + handoff) merged cleanly.** Documentation only — should not break anything. If it merged, the docs/STRATEGIC-FRAME-2026-05-21.md is the operating reference going forward.
3. **Lock the 6 open items.** ~20-min decision session. Defaults documented; founder confirms or adjusts.
4. **Start S2 substrate fix.** Run `/plan-eng-review` then `/codex` on the scoping doc before any code. Expected ~3-4 hours total including gates.

## Reference docs (read in this order)

1. `docs/STRATEGIC-FRAME-2026-05-21.md` — the strategic locks + build sequence. Operating reference.
2. `docs/CODEX-AUDIT-2026-05-21.md` — 14 findings, P1 list, sprint assignments.
3. `docs/sprint-S1-foundation.md` — S1 design + eng + cso review findings.
4. `docs/sprint-S1-5-amendment.md` — S1.5 design + review findings.
5. `docs/sprint-S1-smoke-test.md` — manual test runbook for S1 (still valid).
6. `CLAUDE.md` — top section + Process Discipline (now includes `/codex` hard gate).
7. The previous session's journey-map handoff at the top of CLAUDE.md — context only; supersedes are noted in the strategic frame doc.

## Permanent rules (every session, non-negotiable)

**Confidentiality:** Real client / customer / engagement details the founder shares are in-session reasoning ONLY. NEVER persist into code, comments, docs, prompts, fixtures, commit messages, or anything that lands in git. Every example must be invented and obviously fictional.

**gstack discipline:** `/codex` mandatory on every schema change + every auth change. `/plan-eng-review` before any architecture commit. `/cso` before any privacy-sensitive feature. `/review` before any merge to main.

**Process patterns:** Apply schema migrations BEFORE merging the PR. PR-with-squash-merge via `gh pr merge --squash --delete-branch`. New worktree per workstream. Founder picks branch strategy explicitly. Founder explicitly invites challenge; push back honestly. Stop analysis paralysis when called out — lead with the point, concrete > abstract, honest pushback > sycophancy.

End of handoff.
