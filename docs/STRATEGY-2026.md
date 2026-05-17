# AI-CDIO: Strategy 2026

> ⛔ **CLIENT CONFIDENTIALITY — ABSOLUTE RULE.** Real client / customer /
> engagement details shared to inform design are in-session reasoning ONLY —
> never persisted into code, docs, prompts, fixtures, commit messages, or any
> committed artifact. Every example must be invented and obviously fictional.
> Permanent, every session, every agent. Full rule + rationale: `CLAUDE.md` (top).

**Status:** Active strategic source of truth. Supersedes any conflicting language in older docs.
**Last refreshed:** 2026-05-07 (Day 11 evening — fifth and final update: **(1)** outcomes-and-feelings rewrite anchored in 2025-2026 research from McKinsey, BCG, KPMG, Gartner, Deloitte, WEF; **(2)** scope expanded to include Initiative Pilot + Selection Engine + Network Catalog as Phase 1D deliverables, founder confirmed execution oversight is in scope; **(3)** architectural laws locked: single-agent default, methodology FULL on every tier (no feature-gating), multi-corpus RAG with strict tenant isolation, memory primitives Phase 4 commitment; **(4)** Process Discipline locked — gstack skills are mandatory gates not optional polish; Architectural Lineage from gsd-2 + gstack documented; Network Catalog Privacy P0 spec; **(5)** AI + Data + Quick Win re-sequenced as Phase 1C priority (was Phase 2.5); audience shift locked — Year 1 customer is the CEO via the founder, Year 2+ customer is other fractionals; CEO-facing differentiated promise rewritten as a 3-promise structure with 90-Day Commitment Matrix.)

---

## What This Doc Promises

The platform exists to deliver **measurable outcomes for the fractional CDIO practitioner and emotional outcomes for the CEO they serve.** Every feature in the roadmap must trace back to one of the four outcome pillars below. If it doesn't, we don't build it.

This is the inversion from the previous version of this doc: features are now subordinate to outcomes. Outcomes are now subordinate to feelings. Feelings are what the practitioner sells to the CEO, and what AI-CDIO sells to the practitioner.

---

## The Four Outcome Pillars (research-anchored)

### Pillar 1 — Higher Project Success Rate

**The outcome:** the practitioner's clients ship more of what they fund. Initiatives stop dying in month 4 from misalignment that should have been caught in week 1, AND don't get derailed mid-execution because nobody had the strategic heartbeat in one place.

**The market reality this addresses:**
- **Only 48% of digital initiatives meet or exceed their intended business outcomes when they lack proper IT strategy alignment.** ([Gartner 2026 via Reyem](https://www.reyem.tech/article/what-is-digital-transformation-a-practical-guide-for-business-leaders-in-2026))
- **49% of CIOs say IT and business teams working in silos blocks their ability to maximize value.** ([KPMG 2025](https://kpmg.com/us/en/articles/2025/strategic-it-and-business-alignment.html))
- **60% of companies generate no material value from AI investments. Only 5% create substantial value at scale.** ([BCG 2025](https://www.duperrin.com/english/2025/12/08/impacy-ai-transformation-bcg-mckinsey/))

**How AI-CDIO structurally delivers it:**

*Diagnostic mechanism (existing — Phase 1A-1C):*
- Role-tagged questions force the right person to answer (CEO ≠ CTO ≠ IT Director). Misalignment surfaces *before* funding, not in month 4.
- Decision Packages capture stakeholder disagreement as a hero artifact, with the playbook's recommendation and the projected ROI of acting vs deferring.
- Resolution log creates permanent accountability — what was decided, when, and why.
- Synthesis math protected against N/A pollution so the consensus is real, not gamed.

*Execution mechanism (NEW — Phase 1D, locked 2026-05-07):*
- **Charter Generator** — lean one-page charter auto-populated from a Decision Package or Roadmap initiative. KPMG ROO (Return on Objectives) baked in as success criteria.
- **Initiative Pilot** — multi-party coordination surface where the practitioner, internal stakeholders, vendors, and contractors run an initiative end-to-end. Steps generated from the playbook RAG. Each participant sees only their assigned steps via token-based contextual visibility (no Clerk accounts needed for vendors/contractors). AI co-pilot guides the next action.
- **Selection Engine (Tech mode)** — evaluation matrix builder for any technology category. Scores vendors against the client's actual criteria, not generic Gartner rankings. Outputs a defensible "best buy" recommendation memo with reasoning the CEO can take to their board.
- **Selection Engine (Partner mode) + Network Catalog** — same matrix engine for partner sourcing (consultants, agencies, contractors). Backed by the practitioner's private Network Catalog — a tagged, searchable record of every partner they've worked with. AI suggests from the practitioner's network FIRST, then external sourcing prompts. Compounds engagement-over-engagement.
- **Status Reports + Engagement Cadence** — auto-aggregated from Initiative Pilot data. Status Report goes to the CEO; Cadence is the read-only client view of where things stand.
- **Jira / Asana read-sync** — pulls ticket status into Initiative Pilot view. Platform handles strategic heartbeat; PM tools handle tactical task list. No bidirectional traps.

**The feeling we sell:** *"My initiatives stop dying in month 4 from things I should have caught in month 1 — and don't die in month 6 because the strategic heartbeat got lost in tool-juggling."*

**PM guardrail (locked 2026-05-07):** the platform makes execution oversight light enough that a fractional CDIO can run it as part of a strategic engagement WITHOUT it becoming the engagement. We're not selling project-manager-for-hire. The practitioner's own contract template (Phase 2 Day 29-31 deliverable, see `docs/CONTRACT-TEMPLATES.md`) includes a covenant requiring the client to nominate or hire a PM the practitioner oversees. Platform supports the PM; never replaces them.

---

### Pillar 2 — Higher ROI from Tech Investments

**The outcome:** the practitioner's clients spend less on tech that wasn't moving the needle, and the savings fund the things that do. ROI multiplier comes from avoidance + focus, not from optimization theater.

**The market reality this addresses:**
- **When executed well, organizations report an average 3.5x return on AI investments.** Most are not in this group. ([Gartner / IDC 2026](https://www.idc.com/resource-center/blog/the-smb-2026-digital-landscape-how-ai-is-redefining-growth/))
- **88% of companies use AI in at least one function, but only 39% see EBIT impact — most often less than 5%.** ([McKinsey 2025](https://www.duperrin.com/english/2025/12/08/impacy-ai-transformation-bcg-mckinsey/))
- **SMBs in 2026 will no longer pay premiums for software implementation; spending will shift toward Business Process Re-engineering, with buyers bypassing traditional MSPs in favor of partners who deliver specific business outcomes.** ([Techaisle 2026](https://techaisle.com/blog/661-top-10-smb-mid-market-predictions-for-2026-and-beyond))

**How AI-CDIO structurally delivers it:**
- Priority matrix (value × effort) flags zombie projects before they consume budget.
- Vendor & SaaS inventory module surfaces the 20-30% over-spend SMBs typically carry.
- Quick Win Stack (Modules 5 + 12 + 15) delivers documented 200-400% ROI in 90 days when executed.
- Phase 2.5 Build-vs-Buy Advisor stops the "we built what we should have bought" pattern (and vice versa).
- Phase 1.5 cost telemetry makes the LLM/infra cost-per-engagement visible from Day 1 of public traffic — unit economics are evidence-based, not guessed.

**The feeling we sell:** *"I stopped spending on tech that wasn't moving the needle, and the savings funded the things that did."*

---

### Pillar 3 — Tech Aligned to Strategy (every month, not annually)

**The outcome:** the CEO and the practitioner talk about the same business with the same data every month. Strategic-to-tactical alignment becomes a visible, measurable, ongoing process — not an annual offsite slide.

**The market reality this addresses:**
- **72% of executives now identify the CEO as the primary decision-maker on AI, up from one-third the year before.** AI strategy has officially become "the CEO's mandate." ([World Economic Forum 2026](https://www.weforum.org/stories/2026/01/ceos-are-all-in-on-ai-but-anxieties-remain/))
- **61% of CEOs say their boards are rushing AI transformation**, exposing a divide just as scaling becomes critical. ([BCG 2026](https://www.prnewswire.com/news-releases/sixty-one-percent-of-ceos-say-their-boards-are-rushing-ai-transformation-302760527.html))
- **KPMG's framework for IT-business alignment names four practices: C-suite collaboration, partner ecosystem, Return on Objectives (ROO), agile alignment.** ([KPMG 2025](https://kpmg.com/us/en/articles/2025/strategic-it-and-business-alignment.html))
- The platform's structural strength is here. **This is the strongest of the four pillars.**

**How AI-CDIO structurally delivers it:**
- The CEO's strategic-tagged questions are answered separately from the CTO's technical-tagged questions. Synthesis exposes the gap. Decision Package proposes the path. Roadmap commits to it. Cadence (Phase 1D) tracks it monthly. **This is the KPMG framework operationalized.**
- Engagement Cadence (Phase 1D Days 25-27) — shareable, read-only, token-based — gives the CEO a live view of where their tech sits relative to their strategy. No more annual offsite, no more "where are we?"
- Status Reports (Phase 1D Days 21-24) — the practitioner's monthly artifact — make alignment visible to the board.
- Framework citations on every score (NIST CSF, CMMI, ITIL, NIST AI RMF) give the CEO authority to take to *their* board.

**The feeling we sell:** *"My CEO and I are finally talking about the same business, with the same data, every month — and they walk into their board meeting sounding like the CEO they want to be."*

---

### Pillar 4 — Helping CEOs Build Moats (not just keeping up)

**The outcome:** the practitioner doesn't just stop their client from falling behind — they help the client pull ahead by pointing technology at structural defensibility.

**The market reality this addresses:**
- **In 2025, the conversation has shifted from differentiation to defensibility.** Doing something uniquely well is no longer enough; the real winners build long-term moats. ([Insignia Business Review 2025](https://review.insignia.vc/2025/04/15/moats-ai/))
- **79% of organizations see competitors making similar GenAI investments, but only 23% believe they're building sustainable advantages.** Most are losing to commodity adoption. ([McKinsey 2025](https://www.codurance.com/publications/beyond-functionality-building-durable-moats-in-the-ai-era))
- **Defensible AI advantage comes from proprietary training data — unique datasets that capture domain knowledge, customer behavior, or operational patterns competitors cannot access.** ([Troy Lendman 2025](https://troylendman.com/data-moat-engineering-2025-strategic-competitive-advantage-case-study/))
- **The competitive divide in 2026 is between organizations with end-to-end AI systems and those still running isolated experiments.** Only 34% have moved AI into production at scale. ([McKinsey via SmartTechnoHub](https://smarttechnohub.com/big-tech-in-2026/))

**Honest grade today:** this is the platform's *weakest* pillar. The Quick Win Stack (Modules 5 + 12 + 15) addresses defensive moves — risk reduction, cost discipline, operational efficiency — not moat-building. **This pillar requires Phase 2.5 to land before AI-CDIO delivers on it.**

**Boundary on the AI claim (added 2026-05-07):** AI-CDIO does not build your AI. It catches the seven decision-phase failures that account for ~70% of why AI initiatives die before they deliver value: wrong use case, weak sponsorship, no success criteria, CEO-CTO misalignment, build-vs-buy errors, governance gaps, organizational silos. The remaining ~30% (data engineering, MLOps execution, end-user adoption) is the execution partner's responsibility. This boundary is what protects the founder in sales — we sell strategic clarity, not implementation guarantees. At Day 90 we count "decisions caught" and "wasted spend avoided," not "AI accuracy improvements" — those aren't ours to claim.

**How AI-CDIO will structurally deliver it (Phase 2.5 — Days 39-50):**
- AI Maturity Model + AI Use-Case Library: catalogs proprietary-data moat opportunities by industry × function. Stops generic AI bets, focuses on use cases that compound.
- AI Roadmap Generator: 90/180/360-day plan toward end-to-end AI systems, not isolated experiments.
- Build-vs-Buy Advisor: the decision that determines whether the client owns their data moat or rents it.
- Governance Scaffolding: EU AI Act, NIST AI RMF — the operational backbone that lets the moat hold up under scrutiny.
- Quarterly re-assessment cadence: AI maturity progression tracked over time, because the field moves monthly.

**The feeling we sell (post-Phase 2.5):** *"I'm pulling ahead of competitors who haven't figured out where to point AI yet — and I have the artifacts to prove it to my board."*

---

## The 5 Economic Outcomes — How CEOs Consume the Output (added 2026-05-13)

The 4 outcome pillars above are the **strategic claims** the platform makes about why a fractional CDIO with AI-CDIO outperforms the CEO's alternatives. They are pillar-level commitments anchored in 2025-2026 research.

The **5 economic outcomes** below are the **CEO-facing consumption layer** — how the outputs of the platform land on a CEO's desk. The 16 modules are how AI-CDIO MEASURES; the 5 economic outcomes are how the CEO CONSUMES. Every initiative, quick win, and project produced by the platform is tagged with one of these five outcomes so the CEO reads the result in the language they think in.

| # | Economic outcome | Modules that primarily produce it | Time-to-value | Maps to pillar |
|---|---|---|---|---|
| 1 | **Make money** (top-line: revenue, margin, retention) | M1, M2, M6, M7, M8, M9, M10 | 6-12 months | Pillar 1 + Pillar 4 |
| 2 | **Save money** (cost takeout: SaaS / vendor / cloud / FinOps) | M4, M12, M13 | 30-90 days | Pillar 2 |
| 3 | **Save time** (productivity: automation, delivery velocity) | M14, M15 | 60-180 days | Pillar 1 + Pillar 2 |
| 4 | **Preserve money** (risk to cash already earned) | M3, M5 | continuous | Pillar 1 (avoid failure) |
| 5 | **Preserve time** (avoid wasted hours: incidents, rework, firefighting) | M11, M16 | continuous | Pillar 1 (operational discipline) |

**Why two layers (pillars and outcomes) instead of one:**

- **Pillars are the strategic argument** — what the platform structurally delivers (project success, tech ROI, monthly alignment, moats). Used in `STRATEGY-2026.md`, the Differentiated Promise, the 90-Day Commitment Matrix. Pillar language is what the founder says when he's pitching the methodology.
- **Outcomes are the consumption layer** — how output gets re-organized for the CEO when an actual roadmap, charter, or status report is generated. Outcome language is what the CEO reads on the page. Cash-positive outcomes (save_money, save_time) dominate the 90-day quick win list; make_money outcomes dominate the 6-12 month strategic initiative list; preserve outcomes appear only when assessment data says they are urgent (e.g., Level-1 score on M5 with real cash at risk).

**Where this lands in code:**
- `src/types/index.ts` — `EconomicOutcome` type, `ECONOMIC_OUTCOME_META` table, `outcome: EconomicOutcome` field on every `MODULE_META[1..16]`, `modulesByOutcome()` helper
- `src/types/index.ts` — `Initiative` type carries optional `outcome`, `proof: { better, cheaper, faster }`, `dollar_anchor` fields (legacy fields preserved for backward compat)
- `src/lib/agents/strategy.ts` — system prompt rewritten around the 5-outcome mental model; cash-positive quick wins must carry hard-dollar anchors; process-only quick wins explicitly rejected; better/cheaper/faster proof required per initiative
- `src/app/dashboard/page.tsx` — roadmap tab renders grouped by the 5 outcomes in CEO priority order (Make money → Save money → Save time → Preserve money → Preserve time) with dollar-anchor pill + proof grid; falls back to legacy flat view when persisted roadmaps pre-date the reframe

**The five outcomes each carry a CEO-facing pain question** (seed for planned pain-anchored entry pass before the 128-question diagnostic):
- Make money: *"Where is technology blocking revenue you could be earning right now?"*
- Save money: *"What is the biggest tech bill you would happily kill if you could prove it does not matter?"*
- Save time: *"Where are people doing work a machine could do reliably?"*
- Preserve money: *"What single tech failure would wipe out a quarter of cash if it happened tomorrow?"*
- Preserve time: *"Where is your team firefighting the same thing month after month?"*

**Decision filter (extension to the three-question filter at the bottom of this doc):** every roadmap output and every quick win MUST tag itself with one of these five outcomes. If it cannot, it is either misdiagnosed or it is process work disguised as outcome work — reject and rewrite.

---

## Named Service Lines (added 2026-05-13)

The platform supports discrete, sellable service lines a fractional CDIO runs ON the platform. As of 2026-05-13 there are three named services plus the core engagement:

| Service line | What it is | Shape | Where it lives in the build |
|---|---|---|---|
| **Core Fractional Engagement** | The 90-Day Commitment Matrix engagement | Monthly retainer | Phases 1A-1D + 2.5 (the whole platform) |
| **Pre-Purchase Technology Audit** ⭐ NEW | Independent audit of a single major tech/system purchase BEFORE the check is signed. Loyal only to the accountable principal. Verdict: BUY / DON'T BUY / RENEGOTIATE / HOLD, with evidence and the money quantified. | Discrete fixed-fee engagement (days, not weeks) | NEW Audit Engine — parallel to the Selection Engine. **Recommended first vendor-domain service to ship (ahead of full Vendor Lifecycle).** |
| **Lean Vendor Lifecycle Management** | The full 8-stage selection process (Need → Shortlist → RFP → Demo → Reference → Memo → Contract → Renewal) | Project engagement (5-8 weeks) | Selection Engine v2 + RFP module. The *upsell* from a client who got audited once and realized they need someone watching every major decision. |
| **AI Accelerator** | AI Readiness + Roadmap + Governance | Bundled into core or sold standalone | Phase 2.5 |

### The Pre-Purchase Technology Audit (the sharpest expression of Pillar 2)

**Why this is a named service line, not just a feature:** it is the most literal operationalization of the Differentiated Promise's strongest line — *"bad tech bets die before they cost you money."* It is the highest-leverage, fastest-to-deliver, most-defensible, most-recurring slice of vendor work, and it is the natural **wedge**: a CEO who would never sign a fractional retainer WILL pay to have a $400K ERP decision stress-tested before signing — and that audit is how the broader engagement is earned.

**Stance (the spine):** loyalty to the principal who is personally accountable if the purchase goes wrong — never to the vendor, never to the internal champion who already wants it. The auditor assumes the vendor's framing is wrong until proven otherwise and audits the *decision*, not the demo. The most important finding is usually the thing nobody in the room asked. One decision per audit; it ends at the verdict (no implementation design, no negotiation, no rollout scoping — that boundary is what keeps this a days-long product instead of a multi-week engagement).

**The five lenses** are a recombination of the existing 16-module body of knowledge aimed at a single decision point (which is why they are RAG-groundable from day one):

| Lens | Grounds in modules |
|---|---|
| 1 — Strategy Fit | M2 (Tech Strategy & Alignment), M1 (Tech Leadership) |
| 2 — Operating-Model Fit | M11 (IT Ops), M15 (Process), M16 (Change) |
| 3 — Total Cost & Lock-in | M12 (Tech Finance), M13 (Vendors/SaaS), M3 (Architecture debt) |
| 4 — Vendor Incentive & Capability | M13 (Vendor Management) |
| 5 — Reversibility & Risk | M5 (Risk), M3 (technical debt) |

**Output (4 artifacts):** (A) Strategy-fit verdict, decisive, one paragraph; (B) operating-model-aligned requirements brief (what it must do, mapped to how the org actually runs — not the vendor's feature list); (C) per-lens finding + evidence + flag (KILL / GO / RENEGOTIATE); (D) one-page board summary a board reads in 60 seconds, headlined by a single number (overpayment $ or cheaper-path savings $). Every finding carries a "because." Quantify overpayment and the 10x-cheaper path in real numbers. **A fourth verdict state — HOLD — exists for insufficient evidence** (the Pause Recommendation discipline applied: a consultant who says "I won't sign off until I see the data migration plan" is trusted more than one who always has an answer). The verdict ties to the 5 economic outcomes — "sold as make-money, evidence says save-time at best, and the time saved doesn't clear the 3-year cost" is the sentence that kills bad deals.

**Method Capture:** every audit ends by listing verbatim the questions actually asked, grouped by lens, marking which did the most work. This is the Phase 4 Knowledge Reuse panel applied — the eighth audit benefits from audits 1-7. Portfolio-level: tag which lens produced the decisive finding so the practitioner learns which lens does the most work for which client type.

**The intake gate is load-bearing.** If the principal cannot produce the strategy this serves or how the org runs today, that is not a blocker — **it is the first finding.** "You are about to sign a $400K deal and cannot articulate the strategy it serves" is a board-stopping sentence. The platform builds intake so a blank field becomes evidence, not an error.

**Liability boundary (same discipline as the Pillar 4 AI-claim boundary):** the verdict is advisory. The principal owns the decision. `docs/CONTRACT-TEMPLATES.md` carries an advisory-not-liable clause (Phase 2 Day 30 attorney review). The independence stance protects credibility; the contract clause protects legally. The engagement is principal-paid, never vendor-adjacent — this is never free vendor pre-sales.

**Relationship to the Selection Engine:** the Audit Engine is *parallel* to the Selection Engine, not a mode of it. Selection = build a matrix to PICK among options (forward-looking). Audit = adversarially stress-test a choice already mostly made and return a verdict (backward-challenging). The Audit can optionally consume a Selection Engine output as one input; its native posture is adversarial, not comparative.

**Decision (2026-05-13):** the Pre-Purchase Technology Audit is the recommended **first vendor-domain service to ship**, ahead of the full Lean Vendor Lifecycle. Sequence: ship the Audit Engine (~3-4 days) → run it on the founder's live ERP/CRM decisions as customer #0 → first hard `docs/OUTCOMES.md` entries ("killed the $400K ERP overspend at [client], cheaper path saved $260K over 3 years") → those entries sell both the Audit-as-a-service and the broader fractional engagement. The full Lean Vendor Lifecycle becomes the upsell, deferred until the Audit has produced real outcome evidence.

---

## The Practitioner's Feeling Map

These are the four feelings that drive the practitioner's purchase, retention, and advocacy. Every shipped feature is graded against them.

| Feeling | What it replaces | Where the platform delivers it |
|---|---|---|
| **"I look like the CEO I want to be in front of my board."** | "I don't know how to answer the board's AI question." | Decision Packages with framework citations + projected ROI + maturity progression chart |
| **"My methodology travels with me."** | "If I leave, the client is back to square one." | Permanent engagement record: every score, narrative, decision, resolution exportable. Successor-ready. |
| **"I'm not the bottleneck."** | "Everything depends on me being in every meeting." | Cadence (Phase 1D) gives the client a live view without requiring the practitioner present. Status Reports auto-draft. |
| **"I'm getting better as a practitioner faster than I would alone."** | "Each engagement is a fresh start." | Pattern data across engagements (Phase 4 Knowledge Reuse panel). Eighth client benefits from clients 1-7. |

These feelings are what survive the demo-to-paid conversion. Features get the practitioner to "interesting." Feelings get them to "I need this."

---

## The Differentiated Promise — CEO-facing, locked 2026-05-07 evening

The Year 1 audience is the **CEO**, not other fractionals. The founder pitches AI-CDIO indirectly: it's how he keeps the promises he makes to his CEO clients. Year 2+ pivots to other fractionals once the founder's outcome log validates the platform.

**The pitch — what the founder says to a CEO he's pitching as their fractional CDIO:**

> *"Three things change when I'm your fractional CDIO. Your board stops asking the same tech questions twice — you walk in with framework-cited proof. Bad tech bets die before they cost you money — every decision over $25K runs through a review with named alternatives. AI moves from board talk to real rollout — you ship something in 90 days, not strategy theater. I deliver this in one quarter at a fifth the cost of a full-time CDIO. The platform I built makes me 5x faster than peers. That's why I can promise outcomes other fractionals only hint at."*

**Three promises with proof of mechanism:**

| Promise to the CEO | What the CEO experiences | Mechanism (why the founder can keep it) |
|---|---|---|
| **Your board stops asking the same tech questions twice** | Walks into every board meeting with framework-cited maturity progression + decision logs | Module assessments anchored to NIST CSF / KPMG / TBM / NIST AI RMF. Citations on every score. Maturity chart over time. |
| **Bad tech bets die before they cost real money** | Every tech investment ≥$25K runs through a decision review with named alternatives + projected ROI of acting vs deferring | Selection Engine matrix + Decision Package surface. Catches CEO/CTO divergence BEFORE funding. |
| **AI moves from board talk to real rollout in 90 days** | A working AI quick win in production, not strategy theater | AI Accelerator MVP — Maturity Model + Use-Case Library + AI Roadmap + Build-vs-Buy + Governance scaffolding |

**Better / cheaper / faster — against the alternatives the CEO would otherwise consider:**

| Alternative | Cost | Time to outcome | Quality of proof |
|---|---|---|---|
| Full-time CDIO hire | $250-400K/year + benefits + equity | 6+ months to ramp | High but expensive; locked in |
| Big 4 / boutique consulting firm | $150-300K for one project | 3-4 months engagement | High proof but slide-deck-heavy, hard to operationalize |
| Generic ChatGPT advice | $20/mo | Instant but useless | Zero — no methodology, no citations, no continuity |
| Fractional CDIO WITHOUT AI-CDIO | $5-15K/mo | 6 months to first outcome | Variable; depends on consultant's manual work |
| **Fractional CDIO WITH AI-CDIO** | **$5-15K/mo** | **90 days to first outcome** | **Framework-cited, board-ready, auditable** |

The differentiator: **5x faster + 1/5th the cost of full-time + better proof than any consultant slide deck.**

**Command-center reframe (locked 2026-05-07):** the platform is the *strategic heartbeat* of the engagement — diagnostic, decisions, charter, oversight, value tracking, re-assessment. Tactical task management lives in the client's existing tools (Jira, Asana, Monday). Read-sync brings tactical status into the strategic view; we never compete with PM tools.

---

## The 90-Day Commitment Matrix (locked 2026-05-07 evening)

This is what goes into the founder's engagement contract with each CEO client. It's the operational backbone of the Differentiated Promise above. The platform makes each milestone deliverable on the timeline below.

| Day | Deliverable to CEO | Outcome unlocked |
|---|---|---|
| **Day 14** | Maturity assessment complete across 5-7 active modules | Baseline locked. CEO and team see the same scoreboard. |
| **Day 21** | First 3-5 Decision Packages resolved | Misalignments caught before they cost money. |
| **Day 30** | AI Readiness assessment + AI Quick Win Roadmap delivered | CEO walks into next board meeting with the AI plan. |
| **Day 45** | First initiative launched with vendor + contractor + internal team aligned | Visible execution starts. The "we don't know what's happening" worry dies. **First initiative is outcome-driven, not category-limited** — could be a cybersecurity quick win, AI quick win, data visualization / analysis quick win, process automation quick win, or any other module-anchored deliverable that's the highest-leverage outcome for THIS specific client. |
| **Day 60** | Second initiative launched. First Status Report sent. Cadence link live. | CEO sees ongoing engagement progress without asking. |
| **Day 90** | First quarter's outcome: maturity score lift on 2-3 modules + ROI documented + AI initiative shipped to production | Re-engagement secured. Board sees real numbers. |

**This matrix becomes part of `docs/CONTRACT-TEMPLATES.md`** as the contract language the founder uses with new CEO clients, and (Year 2+) the contract template AI-CDIO ships to other fractionals so they can make the same commitment to their own CEOs.

---

## Audience Shift Locked (2026-05-07 evening)

| Year | Customer | What you sell them | How |
|---|---|---|---|
| **Year 1 (now → Day ~180)** | **The founder's CEO clients** (Ambar, plus 1-2 more) | Outcomes + feelings: tech bets stop bleeding budget, AI moves from talk to rollout, board moments land cleanly, alignment month-over-month | The founder uses AI-CDIO as HIS tool. The CEO never logs in. They see Decision Packages, Status Reports, Cadence links, framework-cited maturity charts — that's it. |
| **Year 2+ (Phase 3 onward)** | **Other fractional CDIOs** (the founder's peers) | Capacity unlock + new income stream once the founder's own fractional practice maxes out | Open the platform commercially. Ship the same Differentiated Promise + 90-Day Commitment Matrix as a productized methodology other fractionals can adopt. |

**This means Phase 2 is reframed:** it's NOT 5 design partner pilots. It's the founder running the platform on Ambar + 1-2 more REAL clients of his own fractional practice, building the outcome log that Year 2+ commercialization rests on. Design partners (other fractionals testing it) move to Phase 3.

---

## Scope: The Complete Customer Journey

The platform spans **seven phases** of a fractional CDIO engagement. Every phase has explicit deliverables, explicit boundaries, and explicit AI mechanisms.

### Phase A — Onboarding (Practitioner sets up a new client)
- Practitioner adds the client, defines engagement scope (`active_modules`), invites stakeholders.
- Sandbox/Real flag protects test data from real-engagement workflows.

### Phase B — Diagnostic (Assess → Recommend → Decide)
- Stakeholders complete the assessment (16 modules; Module 5 = first deep pass; Modules 12 + 15 + 2 land Phase 1C).
- Role-tagged questions route the right question to the right respondent. Universal N/A escape protects synthesis math.
- AI generates per-stakeholder narrative + path-to-next-level for each scored module.
- Decision Packages surface where stakeholders disagree by 2+ levels. Each carries the framework recommendation, projected ROI, and a resolve form.
- Coverage warning panel flags modules with thin response coverage so the practitioner knows who to chase.

### Phase C — Strategic (Roadmap → Charter → Tech & Partner Selection)
- Roadmap Engine produces a 90/180/360-day plan with prioritized initiatives.
- **Charter Generator** (Phase 1D Day 21) creates a lean one-page charter from a Decision Package or Roadmap initiative.
- **Selection Engine — Tech mode** (Phase 1D Day 24) builds the evaluation matrix, scores vendors against client-specific criteria, suggests a leaning recommendation. Practitioner makes the call.
- **Selection Engine — Partner mode + Network Catalog** (Phase 1D Day 25) handles consultant/agency/contractor selection. Suggests from the practitioner's vetted network FIRST.

### Phase D — Execution (Initiative Pilot)
- **Initiative Pilot** (Phase 1D Days 22-23) runs the initiative end-to-end with multi-party coordination. The practitioner, internal stakeholders, vendors, and contractors all participate via contextual token-based access.
- AI co-pilot mode: each participant sees *"here's what to do next, here's the email to send, here's the decision you need to capture"*.
- Decision moments mid-initiative reuse the same Decision Package primitive — permanent record, no email-thread archaeology.
- **Jira / Asana read-sync** (Phase 1D Day 28) pulls tactical ticket status into the strategic view. Tactical work stays in the PM tool.

### Phase E — Value (Status Reports + Cadence)
- **Status Report Generator** (Phase 1D Day 27) auto-aggregates from Initiative Pilot data. The practitioner edits and sends. 90 minutes → 12 minutes.
- **Engagement Cadence** (Phase 1D Day 26) is the read-only token-based client view. CEO sees milestones, decisions, status — without a portal, without an account.

### Phase F — Re-assessment (Quarterly)
- Quarterly re-assessment cadence prompts the practitioner at 90-day intervals.
- Module score progression is tracked over time; the maturity chart becomes the renewal artifact.
- Outcomes captured per initiative feed the practitioner's weekly outcome log (`docs/OUTCOMES.md`).

### Phase G — AI Accelerator (Phase 2.5, Days 39-50)
- AI Maturity Model + AI Use-Case Library + AI Roadmap Generator + Build-vs-Buy Advisor + Governance Scaffolding + public `/ai-readiness` Quick Scan.
- All AI deliverables surface in the practitioner workspace via the same primitives (Initiative Pilot for AI initiatives, Selection Engine for AI tools, Decision Package for AI decisions).
- See Pillar 4 above for the AI claim boundary.

### MCP Server (Phase 1D Day 28)
- Distribution channel — practitioners call AI-CDIO from inside Claude.ai, Cursor, Codex, or any MCP-compatible AI surface.
- First tools: `generate_status_report`, `query_client_data`, `propose_decision_package`, `create_initiative`, `update_initiative_step`, `query_initiative_status`. Phase 2.5 adds AI-specific tools.

### Out-of-scope (explicit non-promises)

The platform is **not**:
- A project manager (Asana / Jira / Monday — we read-sync, never compete)
- A CRM (HubSpot / Pipedrive — different category)
- A billable-hours / time-tracking tool (different category)
- A document storage / file-management system (Google Drive / SharePoint — we hyperlink, don't store)
- A Slack-style threaded chat (we have lightweight per-step comments only)
- A Gantt-chart factory (we have milestones, not Gantt visualization)
- A daily standup tool (we have weekly auto-pulse, not standup mechanics)
- An end-user training platform (different audience entirely)
- A vendor marketplace or partner directory (Network Catalog is *per-practitioner private*; never cross-practitioner)
- An AI model trainer / MLOps platform (we advise on what to build/buy, never build the AI ourselves — see Pillar 4 boundary)

---

## The AI-as-Buy-Trigger Thesis (intact)

CEOs and Owners are searching urgently for: *"How do we implement AI faster in our business?"* They don't want generic ChatGPT advice. They want a fractional CDIO who can run an AI Readiness assessment, build an AI roadmap, evaluate build-vs-buy, navigate governance — and prove ROI quarterly.

**AI-CDIO equips the practitioner to be that advisor.** Phase 2.5 delivers: AI Maturity Model, AI Use-Case Library, AI Roadmap Generator, Build-vs-Buy Advisor, Governance Scaffolding, Quarterly re-assessment cadence.

**This is the buy-trigger:** practitioners who can credibly deliver "AI implementation as a service" to their CEO clients buy AI-CDIO. Practitioners who can't, lose the client to someone who can.

**Practitioner-first is preserved.** The CEO never gets a paid AI-CDIO account. They receive deliverables (AI Readiness Report, AI Roadmap, AI Decision Package) via the practitioner's Engagement Cadence — same channel as everything else. A public anonymous `/ai-readiness` Quick Scan exists as a top-of-funnel lead magnet — but it routes prospects to *practitioners*, not to direct CEO subscriptions.

---

## Why Now (2026 Tech + Market Shifts That Reshape the Plan)

| Shift | Why it matters to the practitioner |
|---|---|
| **CEO is now the AI decision-maker** ([WEF 2026](https://www.weforum.org/stories/2026/01/ceos-are-all-in-on-ai-but-anxieties-remain/)) | The fractional CDIO's seat is at the CEO table, not the IT room. The platform must equip them for that conversation. |
| **MCP standardization** (Claude, Cursor, Codex, ChatGPT all support it) | Distribution: practitioners use AI-CDIO from inside their preferred AI surface. Architectural choice, not headline. |
| **Defensibility > differentiation** ([Insignia 2025](https://review.insignia.vc/2025/04/15/moats-ai/)) | The platform's value is moat-building help, not feature parity. Phase 2.5 is the unlock. |
| **3.5x AI ROI achievable when executed well, but only 23% achieve it** ([McKinsey 2025](https://www.codurance.com/publications/beyond-functionality-building-durable-moats-in-the-ai-era)) | The execution gap is enormous. The practitioner who closes it for SMBs wins. |
| **Boards are demanding visibility, financial intelligence, ethical measurability** ([CIO 2026](https://www.cio.com/article/4113214/ai-hits-the-boardroom-what-directors-will-demand-from-cios-in-2026.html)) | Decision Packages, framework citations, and maturity progression charts are exactly the artifacts boards want. |
| **SMBs bypassing MSPs for partners who deliver outcomes** ([Techaisle 2026](https://techaisle.com/blog/661-top-10-smb-mid-market-predictions-for-2026-and-beyond)) | The fractional CDIO is precisely the outcome-delivering partner SMBs want. AI-CDIO is the productized methodology. |
| **Lovable / v0 / Replit Agent lower the SaaS-build bar** | Differentiation is methodology depth + brand authority + workflow lock-in, not "we built a CRUD app." |
| **Vertical AI consultants emerging** (Ema, Glean Agents) | 12-month window to claim "fractional executive OS" position before vertical AI consultants commoditize the space. |

---

## Practitioner-First Principle

Every feature decision must answer: *"Does this make the founder's practice better THIS WEEK?"*

If yes — ship it. If no — defer until validated by paying-customer demand.

This deprioritizes:
- Multi-tenancy at scale (only matters past customer #20)
- MSP partnerships (only matters past Phase 3)
- Direct-to-SMB sales (never matters in Year 1)
- AI-Strategist + AI-OME siblings (Phase 4 aspiration)
- Mobile app, multi-language, white-label (Year 2+)

This re-prioritizes:
- Quick Win Stack depth (close more deals, deliver faster outcomes)
- Decision Package surfacing (selling tool + retention artifact)
- Status Report Generator (90 min/client/month savings = practitioner profit margin)
- Cadence transparency (trust + accountability differentiator)
- AI Accelerator Engine (the buy-trigger for new practitioner customers)

---

## Cadence Transparency (Product Principle)

A practitioner's value is not just deliverables — it's **predictability**. Every engagement gets:

- **Engagement Cadence** in the workspace (milestones with target dates, deliverable types, success criteria)
- **Auto-populated** from roadmap + status reports + decisions log (single source of truth)
- **Shareable read-only link** for the client (signed token, no portal, no auth, no maintenance burden)
- **Read-only by design** — no client interaction means no client support load

This is the antidote to "Word docs and forgotten promises." Lightweight (1-2 days to build), high-signal (every prospect demo can show it).

It is NOT a co-branded client portal. Portal is Phase 4+, only if customer demand justifies the maintenance cost.

---

## North Star (Recalibrated)

**Year 1 (Days 1-365):** 50-100 paying practitioners. $15-30K MRR. Founder using daily across 3-5 real clients. Day 90 kill-switch test passed.

**Year 2:** 500 paying practitioners + 1,000 paying internal IT directors. $80-150K MRR. First MSP partnership pilot.

**Year 3:** 2,000-5,000 paying customers across all segments. AI-Strategist or AI-OME launched if AI-CDIO has product-market fit.

**Year 5 footnote:** "Indirect path to 100K-500K SMBs through practitioners and MSPs serving them." Aspiration, not commitment.

The original "1M SMBs by Year 3" is replaced by realistic targets that compound. The math: 50K fractional CDIOs/CTOs globally + 200K IT directors + 100K aspiring fractionals = ~350K SAM. Capturing 1% in 3 years = 3,500 paying customers — achievable.

---

## Customer Acquisition Motion

| Track | What founder does | What platform does |
|---|---|---|
| Asset library (one-time) | Approve demo video, case study, one-pager | Generates from real Ambar workflow data |
| LinkedIn rhythm (3-5/week) | Voice + opinion on real client situations | Provides build-progress data, anonymized screenshots, framework deep-dives |
| Targeted DMs (30/week ramp) | Personal note referencing shared connection | Segments search lists, drafts personalized openers |
| Discovery → Demo → Pilot | 30-min call, 30-min demo, free 14-day pilot | Quick Scan produces board-quality output during demo |
| Pilot → Paid (Day 14, 30, 60) | Personal check-in calls | Auto-tracks usage, sends pilot summary |
| Quarterly research | Approve scope, write voice | Aggregates anonymized data, drafts findings |

**Marketing principle (refined 2026-05-07 evening):** Year 1 marketing audience is the founder's **current and prospective CEO clients** — not other fractionals. Every public artifact (LinkedIn posts, case studies, demo video, one-pager) leads with what the CEO experiences when their fractional CDIO uses AI-CDIO. *"Caught Mike's encryption gap before the May 14 board meeting — reframed L2 to L3 path with $40K NIST-aligned roadmap. Ambar's CEO walked into the board confident."* — not *"I built a 5-level maturity assessment."* Year 2+ marketing pivots to other fractionals once the founder's CEO outcome log validates the platform.

---

## Architectural Laws (locked 2026-05-07)

These are not choices to revisit lightly. They constrain every future build decision. Detailed technical specifications live in `docs/ARCHITECTURE.md`; the laws below are the strategic commitments.

### Law 1 — Single-agent default; multi-agent earns its keep selectively

Most LLM operations (~20 of the ~30 in the full scope) are bounded, structured, single-call: scoring narratives, charters, status aggregation, basic Selection Engine matrix, industry overlay, adaptive questioning. **For these, single-agent is the right tool.** Multi-agent multiplies token cost 3-5×, latency 2-4×, and operational complexity 10× without changing the user outcome.

Multi-agent earns its keep on ~10 specific operations, all Phase 2.5 or later: Tech Selection deep evaluation (research + evaluator + recommender), Partner Selection sourcing (Phase 2.5 find capability), AI Use-Case Library deep dive, AI Roadmap multi-step generation, Build-vs-Buy multi-step analysis, QBR Deck section-by-section composition, Knowledge Reuse pattern surfacing, Stakeholder-pattern detector, Document/image Vision evidence analysis, Outcome prediction across engagements.

### Law 2 — Methodology is FULL on every tier; compute is the variable-cost lever

**Locked 2026-05-07.** Tiers differentiate by **scale (number of clients, number of practitioners)** and by **the compute model applied at each tier** — never by methodology depth. AI Accelerator and all multi-agent engines are available on every tier where compute economics work. Feature-gating the buy-trigger kills conversion; the platform's revenue depends on practitioners closing CEO clients with the AI advisor pitch.

**Two compute mechanisms (Phase 2 Day 35-38 pricing review decides which tier carries which):**

- **Mechanism 1 (Starter)** — Tier-included compute allowance + transparent metered overage. Practitioner sees usage running against allowance in their workspace. Overage charged at clearly-displayed marginal cost. Practitioner self-regulates — the platform doesn't artificially limit features, just exposes the cost of the next agentic run.
- **Mechanism 2 (Growth + Scale)** — Bring-your-own-API-key (BYOK). Practitioner connects their own Anthropic / OpenAI / OpenRouter / GitHub Copilot key. Compute hits their provider account directly. AI-CDIO charges a flat methodology subscription. Especially attractive to practitioners who already hold Claude Max / Pro / Codex subscriptions.

**Founder's locked preferences (inputs to Phase 2 pricing review, not locked pricing):**
- AI Accelerator included on Starter IF margin math works under Mechanism 1; otherwise Starter excludes AI Accelerator and AI is Growth+ only
- Mechanism 2 (BYOK) starts on Growth — Starter does not get BYOK
- Cost telemetry from Day 19 (Phase 1.5 — `agent_logs` per-engagement instrumentation) is the empirical input to that decision
- See `docs/PRICING.md` for provisional tier sketch with explicit "to be designed Phase 2" annotation

**Tier differentiators that DO belong (legitimate):**

| Differentiator | Starter | Growth | Scale |
|---|---|---|---|
| Number of clients | 1-3 | 4-15 | Unlimited |
| Practitioners on a single account | 1 | 1 | Up to 5 |
| Knowledge Reuse panel (Phase 4) | — | — | ✅ |
| Custom playbook ingestion (Year 2+) | — | — | ✅ |
| Cross-engagement analytics surface | — | — | ✅ |
| Priority support | — | — | ✅ |
| AI Accelerator full | (pending Phase 2 review) | ✅ | ✅ |
| Tech Selection Engine | ✅ | ✅ | ✅ |
| Decision Packages | ✅ | ✅ | ✅ |
| Status Reports | ✅ | ✅ | ✅ |
| Engagement Cadence | ✅ | ✅ | ✅ |
| Network Catalog | ✅ | ✅ | ✅ |

### Law 3 — Multi-corpus RAG with strict tenant isolation (P0 architectural concern)

Today: one corpus (`playbook_chunks`, 1,154 entries from the 30-file source playbook). Tomorrow: **seven corpora**, each with its own retrieval strategy and isolation rules.

| Corpus | Scope | Isolation |
|---|---|---|
| Playbook | Methodology guidance, action recommendations | Global (read-only across all practitioners) |
| Frameworks (NIST CSF, NIST AI RMF, EU AI Act, ITIL, TBM, KPMG, MIT, APQC, Lean Six Sigma, Prosci, Kotter, etc.) | Citations, framework-anchored language, compliance overlays | Global (read-only across all practitioners) |
| Vendor data (G2 review snippets, vendor docs, security reports) | Tech Selection criteria scoring | Global (curated, periodically refreshed) |
| Industry overlays (HIPAA, PCI-DSS, FDA, etc.) | Industry-specific question rephrasing | Global (read-only) |
| Use-case catalog (AI use cases × industry × function) | AI Accelerator engine | Global (curated) |
| **Per-practitioner historical engagements** | Knowledge Reuse — eighth client benefits from clients 1-7 | **Per-practitioner private. Never cross-practitioner visible. P0.** |
| **Per-practitioner Network Catalog** | Partner Selection — your network first | **Per-practitioner private. Never cross-practitioner visible. P0.** |

**Tenant isolation requirements (P0):**
- Defense-in-depth: app-layer filter (`practitioner_id`) + Supabase RLS policies + corpus partitioning at the table level
- Audit log of every cross-tenant retrieval attempt — must be zero in production
- No "anonymized aggregate insights" across practitioners in Year 1 (different product, different consent flow)
- Network Catalog notes encrypted at rest beyond Supabase defaults (column-level encryption for sensitive fields)
- Practitioner can export AND wipe their entire private corpora at will (GDPR-clean)

### Law 4 — Memory primitives Phase 4 commitment

Today: every LLM call is stateless, context fed per-request. Works for single-shot operations.

Phase 4: per-client conversational memory across sessions. The agent knows Ambar's history without re-retrieving. Adopts Anthropic's native memory primitives when generally available — does not roll its own. This is what makes the Practitioner Feeling Map's *"My methodology travels with me"* work for real.

### Law 5 — Cadence-as-primitive

Every artifact (assessment, decision package, charter, initiative, status report) has a Cadence representation. Cadence is the read-only token-based client view that surfaces engagement state without requiring portal/account/auth maintenance. **Cadence is a lock-in mechanism** — once a client is used to the Cadence link, switching practitioners means rebuilding the muscle memory. We protect Cadence as a differentiator, not a commodity feature.

### Law 6 — Token-based contextual access for non-paying participants

Vendors, contractors, internal stakeholders (non-practitioner participants) join initiatives via signed token magic-links. **Never** Clerk accounts, never SSO, never paying seats. They see only their assigned steps + relevant Decision Packages + the initiative goal. **They never see** other clients, other vendors, maturity scores, the strategic narrative, or the Network Catalog. Defined as the "Contextual" visibility level (locked 2026-05-07).

### Law 7 — MCP-first as a distribution channel, not a headline

MCP server (Phase 1D Day 28) lets practitioners call AI-CDIO from inside Claude.ai, Cursor, Codex, ChatGPT — wherever they already trust their AI. Architectural choice that compounds over time. Not marketed as a feature.

### Law 8 — Production-grade legal + cost telemetry from Day 1 of public traffic

Phase 1.5 (Days 18-20) is non-negotiable: Vercel deploy + verified email domain + ToS/Privacy/AI Disclaimer + cost telemetry. **No public traffic before this lands.** Cost-per-engagement visibility from Day 1 of monetization runway means Phase 3 pricing decisions are evidence-based, not guessed.

---

## Process Discipline (locked 2026-05-07)

The platform is built using gstack — Garry Tan's Claude Code skill collection installed at `~/.claude/skills/gstack/`. **Going forward, gstack skills are mandatory gates, not optional polish.** Days 1-11 under-used these skills; the strategic pivot today (outcomes-led rewrite, scope expansion, architectural laws) was done manually when `/plan-ceo-review` would have surfaced the same conclusions in one command. We don't repeat that mistake.

### Mandatory gates by scenario

| When | Skill | What it gives us |
|---|---|---|
| Before any architecture commit | `/plan-eng-review` | Surface hidden assumptions, lock data flow + state machines + edge cases |
| Before any scope change | `/plan-ceo-review` | The outcome-led / scope-expansion challenge in one command |
| Before any privacy-sensitive feature | `/cso` | OWASP + STRIDE security audit (Network Catalog Day 25 needs this) |
| For independent second opinions on architectural calls | `/codex` | OpenAI Codex CLI reviews same code/plan; cross-model agreement |
| At start of any new phase | `/autoplan` | Runs CEO + Design + Eng reviews chained automatically |
| Before any merge to main | `/review` | Catches production bugs that pass CI |
| Before any deploy | `/qa` | Real browser, real clicks, regression tests auto-generated |
| After major commits | `/learn` | Captures patterns for Phase 4 Knowledge Reuse panel |
| Weekly | `/retro` | Engineering retrospective with per-person breakdown |

### Non-negotiable gates by phase

- **Before Phase 1D Day 21 (Charter Generator) starts:** run `/plan-eng-review` on the entire Phase 1D scope (Initiative Pilot + Selection Engine + Network Catalog)
- **Before Phase 1D Day 25 (Network Catalog) starts:** run `/cso` on the privacy + tenant-isolation model
- **Before Phase 1.5 Day 18 (production deploy) starts:** run `/cso` on the production attack surface
- **Before Phase 2.5 Day 39 (AI Accelerator) starts:** run `/autoplan` on the full Phase 2.5 scope and `/codex` on the multi-agent architecture decision

### What gstack costs

The skills run inside the same Claude Code session. Each gate adds 5-15 minutes of agent runtime. The cost of skipping them is measured in re-work — today's strategic pivot would have cost zero re-work if `/plan-ceo-review` had run on Day 6. **Skipping gates is a false economy.**

---

## AMP Playbook Integration (locked 2026-05-07 — Phase 2.5 design template)

The Phase 2.5 AI Accelerator Engine is not designed in a vacuum. Its scoring, taxonomy, governance, and roadmap structure are **directly templated on the AMP AI Diagnostic Playbook** — a real ex-Google PE consulting methodology used on a $100M PE-backed vertical SaaS engagement that produced $3.3M Year-1 hard run-rate impact (~8% EBITDA uplift), $11.2M three-year impact, every dollar defensible to the LP.

This is a deliberate, documented design choice. It cuts Phase 2.5 from 12 days to 8 by reusing four pieces of AMP's structure as templates rather than designing them from scratch.

### What we adopt verbatim

| AMP element | AI-CDIO use |
|---|---|
| **5 governance components** (Sponsorship / Decision rights / Intake / Performance review cadence / Risk controls) | 5 of the 6-8 dimensions of the AI Maturity Model. Add 1-3 SMB-specific dimensions (data foundations, talent, vendor stack). |
| **4 opportunity categories** (Resource & process efficiency / Vendor & tool spend / Quality, risk & reliability / Scalability enablement) + `counts_toward_margin: bool` | AI Use-Case Library taxonomy. Hard-savings (counts toward margin) gets first-class surfacing on Decision Packages and the Quick Scan board memo. |
| **3-stage funnel (100 → 17 → 7)** | The AI Roadmap Generator's built-in flow. Longlist → screened shortlist (5×5 scored) → underwritten roadmap. Replaces "AI Roadmap" as a free-text artifact with a structured pipeline. |
| **5 Feasibility × 5 Value scoring (10 dimensions)** | The Selection Engine's `domain: "ai"` template. Same 10 dimensions, defaulted on every AI initiative; practitioner can override. |
| **Standardized Impact Formula** (Volume × Minutes saved × Fully-loaded cost × Realizable %) | The math under every AI initiative card. Surfaces in Decision Packages and the 90-Day Commitment Matrix Day-90 ROI deliverable. |
| **"Hard savings only — defensible 18 months later"** | Sharpens the 90-Day Commitment Matrix Day 90 language: "ROI documented" → "**Hard-dollar, recurring, defensible 18-month retrospective.**" Soft-benefit narratives tracked separately. |

### What we add to AMP

AMP is a PE consulting methodology designed for $100M+ engagements. AI-CDIO targets 10-250-employee SMBs as the Year 1 audience. Three SMB-specific adjustments:

1. **Lean-form-first rule** (already shipped Phase 1C Day 13) — AMP's "conservative estimates" become "propose the spreadsheet/Notion-page form before any tool". Lower threshold for "lean alternative considered."
2. **Size-band ceiling** (already shipped Phase 1C Day 13) — AMP doesn't cap maturity by size because it doesn't need to; AI-CDIO's customer set is small enough that a uniform 5-level ambition would push bank-grade governance onto 30-person companies.
3. **Practitioner-as-buyer Year 2+** — AMP is sold to PE / corporate boards directly. AI-CDIO is sold first to the founder's CEO clients (Year 1) via him, then to other fractional CDIOs (Year 2+) who use the platform on their own engagements. Asset library + onboarding emails reflect the latter buyer.

### What stays AI-CDIO native (not AMP)

- The **playbook RAG corpus** (1,154 chunks from the 30-file source playbook) — AMP doesn't have a methodology corpus; AI-CDIO's framework citations + path-to-next-level recommendations rely on it.
- The **role / area question tagging system** (Phase 1C v2 schema) — AMP screens initiatives, not stakeholders; AI-CDIO's role filter is a separate discipline solving a separate problem (which stakeholder can attest to which capability).
- The **Module 1-16 framework anchors** (NIST CSF, CMMI, TBM Council, KPMG ROO, APQC PCF, Lean SS, etc.) — AMP is AI-specific; AI-CDIO's 16-module maturity model spans the full Fractional Executive OS scope.
- The **Cadence + Engagement read-only client view** — AMP's deliverables are slide decks; AI-CDIO's Cadence is the renewal-lock-in mechanism that depends on platform persistence.

### Where this lands in the build

- **Phase 2.5 Days 39-46 (8 days, reduced from 12):** see `docs/ROADMAP.md` Phase 2.5 section.
- **AI Operator Bootcamp** (AMP's 6-module training product mapping 1:1 to engagement workflow): logged as a **Year 2+ commercial product** alongside the platform release to other fractionals. Not Year-1 scope.
- **Module 12 polish question** (m12_q14 — hard-dollar underwriting question): shipped Phase 1C Day 17. The question references both KPMG ROO and AMP's Standardized Impact Formula explicitly.

---

## Architectural Lineage (locked 2026-05-07)

AI-CDIO's architecture is not invented from scratch. It borrows deliberately from two reference systems we've studied:

### gsd-2 — Get Shit Done v2 (`~/projects/gsd-2/`)

A standalone CLI for autonomous AI coding agents built on the Pi SDK. Provides production-grade infrastructure for long-running agentic work: fresh context per task, crash recovery via lock files, cost tracking per phase / slice / model, stuck-loop detection, worktree-per-milestone git isolation, parallel orchestration, headless CI mode. Forty+ versioned releases since 2025; mature.

**Patterns AI-CDIO has adopted (already shipped, just naming the lineage):**

| gsd-2 pattern | AI-CDIO equivalent | Where it lives |
|---|---|---|
| Single-writer state engine | Atomic synthesis stored proc | `schema-v6-synthesis-rpc.sql` (Day 5) |
| Fresh context per task | Per-stakeholder LLM call (no cross-stakeholder context bleed) | `assessment.ts` |
| Durable state (not in-memory) | Engagement state in Supabase, not server memory | Schema design from Day 1 |
| Worktree isolation per milestone | Per-org workspace + sandbox flag for tenant isolation | `schema-v7-orphan-sandbox.sql` (Day 7) |
| File-based state visibility | Coverage warnings + Decision Packages surfaced in workspace | Day 9-10 |
| Cost tracking per unit | `agent_logs` table per-engagement instrumentation (Day 19) | Phase 1.5 |

**Patterns AI-CDIO will consider adopting (not yet shipped):**
- Crash-recovery lock files for long-running synthesis or AI Roadmap generation (Phase 2.5+)
- Sliding-window stuck-loop detection on multi-agent flows (Phase 2.5+)
- Soft / idle / hard timeout supervision on autonomous engagements (Phase 2.5+)

**gsd-2 runtime integration decision deferred to Phase 2.5 Day 38** — see `docs/ROADMAP.md` for the design gate. Three options on the table at that decision: (A) keep custom multi-agent build, (B) adopt gsd-2 patterns without runtime dependency, (C) build AI Accelerator multi-agent flows on top of gsd-2's Pi SDK infrastructure. Decision driven by cost-per-engagement telemetry from Day 19 onward.

### gstack — Garry Tan's Claude Code skill collection (`~/.claude/skills/gstack/`)

23 specialist roles + 8 power tools as Claude Code slash commands. Sequential workflow: `/office-hours` → `/plan-ceo-review` → `/plan-eng-review` → build → `/review` → `/qa` → `/ship`. Used as the build-process discipline (see Process Discipline section above), not embedded in the AI-CDIO product.

**Patterns AI-CDIO will adopt as the Phase 4 Knowledge Reuse panel lands:**
- `/learn` skill's pattern of cross-session memory compounding — the practitioner's eighth client benefits from clients 1-7
- `/retro` skill's pattern of per-person, per-week breakdown — could inform practitioner self-service analytics in Phase 4

---

## Network Catalog Privacy Spec (P0 — locked 2026-05-07)

The Network Catalog is the practitioner's permanent, tagged record of every partner they've worked with (consultants, agencies, contractors, vendors). It is the practitioner's **moat** — competitor practitioners can read G2, but they cannot access *your* contacts. Privacy is therefore a P0 architectural concern, not an afterthought.

### Hard requirements

- **Per-practitioner only.** Never cross-practitioner visible. No "23 other practitioners rated this person 5 stars" features in Year 1. No anonymized aggregate insights without explicit, separate, opt-in consent flow (Year 2+ decision).
- **Defense-in-depth:** application-layer `practitioner_id` filter + Supabase row-level security policies + per-practitioner table partitioning + audit log of every cross-tenant retrieval attempt (must be zero in production).
- **Encryption beyond Supabase defaults:** column-level encryption for sensitive fields (notes, ratings, partner pricing quoted, soft observations).
- **Full export + wipe controls.** Practitioner can export their entire Network Catalog to CSV/JSON at will; can wipe it in one click (GDPR-clean).
- **Never surfaced to clients, vendors, contractors, or other practitioners under any circumstance.**
- **Scoping:** when a vendor or contractor logs into a contextual workspace via token magic-link, they cannot see the Network Catalog exists; not in API responses, not in metadata, not in audit logs visible to them.

### Soft commitments

- Year 2+ may consider opt-in anonymized aggregate insights (e.g., "practitioners typically rate Salesforce implementers at 3.5/5") with a separate consent flow. That's a different product surface, not the same feature.
- The platform is never marketed as "tap into a network of 1,000 vetted partners" — that's a marketplace and a different risk profile.

### `/cso` gate before Day 25

Per Process Discipline above, `/cso` (OWASP + STRIDE audit) runs before any Network Catalog code lands. Findings are P0 blockers — no merge until cleared.

---

## Other Architectural Choices (less foundational than the laws above)

| Choice | Why |
|---|---|
| **Long-context + RAG hybrid** | Cohesive reasoning + cited retrieval. Sonnet 4.5+ for everything until cost demands otherwise. |
| **Service-role with TS-layer ownership checks today; per-user JWT + RLS later** | Ship speed now, security depth Day 30+. RLS policies pre-wired. |
| **No background-jobs framework yet** | Synchronous engines until 5+ paying customers reveal scale needs. |
| **Single Supabase project, single Clerk app** | One environment until Phase 3. |
| **Production deploy at Day 18** | Methodology depth ships INTO production. Real Ambar exec emails route through verified domain when Phase 1C dogfood begins. Demo URL exists for design-partner conversations starting Phase 2. |
| **AI Accelerator as a flagship engine, NOT a separate product** | Practitioner-first preserved. Public `/ai-readiness` Quick Scan routes leads to practitioners, not direct CEO subscriptions. |

---

## Architectural Laws (locked Day 11 — 2026-05-07)

These are commitments, not preferences. They survive feature debates. Technical detail lives in `docs/ARCHITECTURE.md`; this section explains the strategic *why*.

### Law 1 — Single-agent default; multi-agent reserved for high-leverage flows past Phase 2.5

The ~20 operations across Phases 1A–2 are well served by a single agent over a single shared context. Multi-agent adds latency, cost, and orchestration debt that customers can't perceive in the deliverable. We pay that cost only where the work genuinely benefits from specialization.

**Multi-agent flows (~10 operations, Phase 2.5+):**
- Tech Selection deep evaluation (research agent + evaluator + recommender)
- Partner Selection sourcing (Phase 2.5 find capability)
- AI Use-Case Library / AI Roadmap / Build-vs-Buy / Governance generators
- Knowledge Reuse pattern detection across engagements
- Stakeholder pattern detector / Outcome prediction
- Document/image AI Vision evidence analysis
- QBR deck generation

**Why this matters strategically:** multi-agent becomes a **tier differentiator**, not a default cost burden. Starter customers pay less because they get the cheaper architecture. Scale customers pay more because the multi-agent flows deliver work the cheaper tier literally cannot.

### Law 2 — Multi-corpus RAG with strict per-practitioner tenant isolation (P0 architectural concern)

Today: 1 corpus (1,154 playbook chunks, shared across all practitioners).

Future: 7 corpora — Playbook + Frameworks + Vendor data + Use case catalog + **Per-practitioner historical engagements** + **Per-practitioner Network Catalog** + Industry-specific overlays.

**The non-negotiable:** the two per-practitioner corpora MUST NEVER leak across practitioners. A practitioner's historical engagement notes and personal Network Catalog (vetted vendors and partners they've worked with) are the **practitioner's moat**. Cross-practitioner leakage would destroy the value proposition and create legal exposure.

**Strategic implication:** retrieval pipelines, embedding stores, and any future agent code that touches practitioner data are evaluated against this law as P0. `/cso` review is mandatory before any feature that touches per-practitioner corpora ships.

### Law 3 — Memory primitives are Phase 4, not Phase 1

Per-client conversational memory across sessions ("remember what we decided last quarter for Ambar") is real value but not Phase 1 value. We adopt Anthropic's native memory primitives when they ship, rather than building a homegrown layer that we then have to migrate. Phase 4 commitment.

### Law 4 — Tier-based multi-agent matrix (drives pricing defensibility)

| Tier | Price | Architectural capability |
|---|---|---|
| **Starter** | $199/mo | Single-agent only — Quick Scan + Assessment + Decision Package + Status Reports |
| **Growth** | $399/mo | Selective multi-agent — Tech Selection deep, AI Accelerator full, Partner Selection sourcing |
| **Scale** | $599/mo | Full multi-agent — Knowledge Reuse + Outcome prediction + Document AI Vision + cross-engagement pattern detection |

This matrix is what makes the three tiers genuinely different products, not arbitrary feature paywalls. Cost telemetry from Phase 1.5 Day 19 (per-engagement LLM cost) makes the unit economics defensible — we know what each tier actually costs to serve before Phase 3 Stripe goes live.

### Law 5 — Network Catalog is per-practitioner, never cross-practitioner (privacy boundary locked)

The Network Catalog (Phase 1D Day 25) is the practitioner's permanent address book of vetted people: name, role, domain tags, last engagement, rating, source, notes. AI suggests partners from the practitioner's OWN network FIRST, then external sourcing.

**This is the practitioner's moat. It compounds engagement-over-engagement.** Cross-practitioner visibility would destroy that compounding. Architectural commitments:
- Per-practitioner only — never cross-practitioner visible
- Encrypted at rest beyond Supabase defaults
- Full export + wipe controls on every entry
- `/cso` security audit required before ship; `/codex` second opinion required on the privacy model

### Law 6 — PM-covenant guardrail: contract language as a soft feature, not platform expansion

The platform makes execution oversight light enough that the practitioner can do it as part of strategic engagement WITHOUT it becoming the engagement. The product **does not become a PM-for-hire tool** — that's a different price point and a different buyer.

**The mechanism:** the practitioner's engagement contract requires the client to nominate or hire a PM (internal or external) the practitioner oversees. The platform supports the oversight; the platform does not replace the PM.

**Phase 2 (Days 29-31) deliverable:** ship contract template language as a soft feature in the Asset Library so practitioners can paste covenant clauses into their own engagement contracts. See `docs/CONTRACT-TEMPLATES.md` for the clause stub.

### Law 7 — Module 17 (Sales/Marketing/Revenue Tech) is a Year-2 candidate, not a Phase-1 commitment

The current 16 modules over-index on infrastructure and governance and under-index on revenue-side tech. Modern SMB CDIOs spend 30-50% of their time on sales tech, marketing tech, and customer success tech. **Module 17 ships in Year 2 if and only if customer demand confirms the gap.** Other future-module candidates flagged but not committed:
- Vision & North Star (a possible Module 0)
- Governance & Decision Rights (today partially inside Module 1, may split)
- AI as its own module (split from Module 6 once Phase 2.5 lands)
- Sustainability / ESG Tech (regulatory-pressure dependent)

---

## What's Out of Scope (Until Demand Proves Otherwise)

- Co-branded client portal (Phase 4+)
- White-label for MSPs (Phase 4+)
- AI-Strategist / AI-OME siblings (Phase 4+)
- Mobile app (Phase 4+)
- Multi-language (Phase 4+, Spanish first if Latin American demand emerges)
- Marketplace / partner API (Phase 5+)
- Open-source the playbook (revisit Year 2)

---

## Day 90 Kill Switch (Re-examined 2026-04-29)

**Schedule reality:**
- Production goes live Day 18 (Phase 1.5)
- Monetization opens Day 51 (Phase 3 — Stripe)
- **Day 90 hits Day 39 of monetization runway** (15 days into Phase 4)
- Design partners onboarded Days 34-38 → 14-day pilot ends Days 48-52 → conversion window Days 52-90 (~5 weeks)

**Realistic Day 90 outcomes (REVISED 2026-05-07 evening — audience shift to CEO-first locked):**

The Year 1 customer is the founder's CEO clients via him, not other fractionals. The Day 90 kill switch must measure **outcomes delivered to those CEO clients**, not paying-customer count from other fractionals. Paying-customer-from-fractionals is a Year 2 signal.

- **The founder has delivered all six 90-Day Commitment Matrix milestones to at least one real CEO client (Ambar)** → continue, accelerate. The platform's promise is keeping promises to CEO clients. If that's working, the rest follows.
- **The founder has delivered 4-5 of the six milestones + has 5+ qualitative outcomes logged in `docs/OUTCOMES.md`** → continue, slow burn. **Most likely actual outcome.** Real CEO outcomes are the Year 1 evidence base.
- **The founder has delivered <3 milestones to any CEO client AND has fewer than 3 qualitative outcomes logged** → STOP. Reframe or shelve. The platform isn't making the founder's practice better.
- **The founder has delivered all six milestones to multiple CEO clients (Ambar + 1-2 more) and is capacity-constrained** → trigger Year 2 commercialization. This is the cue to release to other fractionals.

**Paying-customer count at Day 90 is no longer the headline metric.** It moves to a Year 2 metric. The Year 1 metric is **CEO outcomes delivered**, measured in `docs/OUTCOMES.md` weekly entries with specific dollar amounts saved, specific decisions caught, specific board moments won.

The kill switch protects against sunk-cost spiral. It does not punish slow paying-customer ramp if the dogfood loop is healthy.

---

## What This Document Is For

- **Resolving conflicts** between older docs (PRODUCT.md, ROADMAP.md, SESSION_HANDOFF.md, GAPS.md, RISKS.md) — this one wins.
- **Onboarding new collaborators** — read this first.
- **Decision filter** — when in doubt about whether to build something, ask three questions in order:
  1. **Which of the four outcome pillars does this serve?** (If none, don't build.)
  2. **Which feeling does this give the practitioner or the CEO?** (If unclear, the messaging needs work.)
  3. **Practitioner-first?** (If no, defer.)

Refresh this doc every 30 days or when major customer feedback shifts the strategy. Stale strategy is the worst strategy.

---

## Outcome Log (founder's verification surface — added 2026-05-07)

A new lightweight discipline: **every Friday, the founder writes one entry in the outcome log** answering: *"What did the platform help me deliver to a client this week that I couldn't have done as well without it?"*

Examples (hypothetical, illustrative):
- *"Caught Mike's encryption gap on Module 5 before the May 14 board meeting — reframed it from L2 to L3 path with $40K NIST-aligned roadmap. CEO walked into the board confident."*
- *"Killed the SAP migration scope creep at Ambar — Decision Package showed CFO and COO disagreed on phase 2 timing. Saved estimated $80K and 3-month delay."*
- *"Re-engaged TestCo on the Cybersecurity quarterly re-assessment cadence — surfaced new vendor risks since last review. Locked in Q3 retainer."*

The outcome log lives at `docs/OUTCOMES.md` (created Day 11). It is the qualitative evidence the platform delivers what this strategy doc promises. Day 90 kill switch reads it.
