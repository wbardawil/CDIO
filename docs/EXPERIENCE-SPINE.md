# AI-CDIO: The Experience Spine — v2

> ⛔ Client-confidentiality rule applies (see `CLAUDE.md` top).
> **v2 created 2026-05-19.** Supersedes v1 (`EXPERIENCE-SPINE-v1-ARCHIVED.md`).
> v1 was written 2026-05-13 after Customer #0 reported being lost and
> overwhelmed; it specced only the Audit flow + a shared shell. Customer #0
> reported the **same signal again on 2026-05-19** — "the app feels shallow
> vs. the knowledge behind it; I have to walk it by the hand when I expected
> an executive assistant, a PM and an IT team covering my 360." That repeat
> is the proof v1 was correct but under-scoped: it fixed navigation, not the
> absence of a system that *carries the engagement*. v2 keeps v1's five laws
> verbatim and adds what was missing.
>
> Grounded in: `STRATEGY-2026.md` (Named Service Lines, the Pre-Purchase
> Audit, Feeling Map, 90-Day Matrix, Audience Shift — "the CEO never logs
> in", command-center reframe); v1's spine laws; gsd-2's durable
> self-advancing state model. This is the governing spec every screen and
> artifact is built and reviewed against.

---

## The one sentence (v2)

**You pour a problem in; the system carries it forward on its own, always
shows you the one next thing it already did, and turns it into a
board-grade artifact in the client's own tools — the framework is invisible
scaffolding, the artifact is the product, momentum is the feeling.**

If a screen or an artifact fails that sentence, it is wrong.

---

## Why it still feels shallow (the v2 diagnosis)

The depth exists: 16 modules, 128 questions (strict-bar validated
2026-05-19), scoring, RAG. The app feels shallow because it is **pull-based
and stateless** — every screen waits for the practitioner, computes, and
forgets. There is no engagement the system *owns and advances*. v1 fixed
"never lost"; it did not add "the system is carrying it." That missing
primitive is the entire gap between a form app and an army.

---

## The value hierarchy — everything is subordinate to business-case success

The unit of value is an initiative's job-to-be-done and the success of its
business case. But "success, measured" has a hard operability constraint we
must design around, not pretend away: **the founder does not execute, the
CEO never logs in, and realized economic outcomes land 3-18 months later.**
The product therefore cannot directly observe realized value. Making an
unobservable thing the gating metric is the contradiction this spine
explicitly resolves with a two-tier model:

- **Tier 1 — Decision GATE passed (observable now, the product's real unit).**
  At the gate/artifact, all of: JTBD named; business case quantified with a
  target economic outcome, a falsifiable success metric, and checkpoint
  dates; de-risking questions answered; ≥1 named alternative; reversibility
  assessed. This is an honest **process fact** — the questions were forced
  and answered — NOT a quality claim that the answers are good. It is
  **self-certified** by the same person who made the decision, so it is
  circular as a *measure*: a weak artifact can satisfy the checklist. The
  product tracks and lights the map on "gate passed", and must label it as
  exactly that (process completeness), never as "this decision is good".
  Promoting Tier 1 to a real quality measure requires a hard rubric,
  evidence thresholds, and an independent/second check — **deferred to the
  EngagementState primitive review**, not claimed here.
- **Tier 2 — Realized value (lagging, client-reported, NOT
  product-observable).** The actual economic outcome later. The product
  does not measure it; it *captures a lightweight founder-logged,
  client-confirmed checkpoint* at cadence ("client confirms saved $X /
  shipped / abandoned"). The core experience never blocks on Tier 2.

So the north star is honest: **the product enforces and tracks the
decision gate (observable process fact), and records realized value when
the world reports it (lagging).** It does not claim either is proof the
decision was good — that honesty is the point. A maturity score or a lit
map with no decision gate passed under it
is still production value with no value — but the spine no longer pretends
to measure something it structurally cannot see.

Everything else is a *helper* of that, never a destination:

- **Maturity assessment (16 modules, 128 questions)** → an **input** that
  frames and de-risks an initiative's business case: which lenses matter
  for *this* bet, the baseline, what "good" looks like. It is never a
  deliverable in itself. A maturity score with no initiative business case
  attached is production value with no value.
- **The map** → the **context and progress surface**: where this bet sits,
  what it touches, and visible accretion. It is the scaffold that makes
  business-case progress legible, not the point.
- **Audit / charter / selection / roadmap** → instruments that make a
  specific business case more likely to succeed.

The test for any screen or artifact is therefore not "is the map richer"
or "is maturity higher" but "**did this force the decision gate to be
answered, and is the business case set up so reality can later confirm
it?**" Maturity lift and a lit map are downstream proxies, never the goal,
and never proof on their own that the decision was good.

## The seven spine laws

Laws 1-5 are **verbatim from v1** (they were earned through a real failure;
they stand). Laws 6-7 are the v2 additions.

### Law 1 — Never lost, never dead-ended
Every screen: where you are (breadcrumb), the way back (one click to the
client, one to all clients), the one next thing. Enforced by a single
shared shell, not per-page chrome.

### Law 2 — One primary action per screen
Exactly one obvious next thing, visually dominant. Everything else
secondary or hidden.

### Law 3 — Plain language on the surface; framework underneath
The surface speaks the way a CEO speaks at dinner. No "M2", no
"consensus 2.2/4". NIST/CMMI/the lenses/the matrix live behind an
explicit, optional **"Show the full analysis."**

### Law 4 — Visible progress; the system carries it
A small, persistent indicator of where this piece is. Blank states say
what to do, not "no data". Feeling: "it's handling it."

### Law 5 — Outcome first, evidence on request
Every output leads with the plain answer + the money/decision a principal
reads in 15 seconds. Reasoning, citations, lens detail come after, behind
a disclosure.

### Law 6 — The artifact is the product (NEW)
The CEO never logs in (`STRATEGY-2026.md` Audience Shift). Therefore the
**generated document is the entire product surface to the client**, and
every artifact must stand alone as a board-grade, branded, shareable
deliverable that is *also a conversion instrument* — sufficient, by itself,
to sell the next depth of engagement at whatever moment the opening
appears. Sales is not a stage; every emitted artifact is a sale moment.
An artifact that needs the app open beside it to make sense is a Law 6
violation.

### Law 7 — The system owns durable engagement state and advances it (NEW)
There is one persistent `EngagementState` per client the system carries
across sessions. Screens *render and advance* that state; they never
recompute from scratch and forget. A single proactive **Home** reads it
and shows, per client, the one next thing **already done** (draft ready
to review), not a to-do for the practitioner. The feeling is an executive
assistant who worked while you were out, not a form waiting for input.
This generalizes Law 4 from a progress strip to an owned object. It is
the load-bearing primitive; Laws 1-6 are only fully delivered once it
exists.

---

## The missing primitive, concretely

`EngagementState` (per client, durable, server-owned):

- **Where each piece is** across the journey (which initiatives, which
  audits, what stage each is in, what's owed, what's slipping, the clock).
- **What the system already advanced** since the practitioner last looked
  (the drafted charter, the prepped questions, the updated map) — pending
  *review*, not pending *work*.
- **The living map** (see below) as accreting state, not a redrawn artifact.

The proactive **Home**: one screen, per client, "Here is what I did and
the one thing for you to decide." This is the executive-assistant feeling.
Everything else (audit, initiative, map) is a depth-view onto the same
state.

**Build order — inverted from "architecture first" (the meta-flaw fix).**
The kill switch is real and the runway is finite; building the
`EngagementState` primitive "right" before any real client outcome
optimizes elegance over the only Day-90 proof that counts. So:

1. **Ship-to-learn first (this week):** use whatever exists today to
   produce **one real deliverable for the live vendor-selection
   engagement** (a real paying client). No new primitive. Let reality
   grade the spine.
2. **Then** build the `EngagementState` primitive + Home, justified by
   what the dogfood exposed, not by this document.
3. Audit throttle and Deliverable Builder ride on the primitive after it
   has earned its place.

Laws 1-7 are the destination; step 1 is the forcing function that proves
the destination is the right one before the runway is spent on it.

---

## One spine, three throttles

Same machine, same validated-question universe, same scoring axis. The
client's *posture* sets the depth. Maps to `STRATEGY-2026.md` Named Service
Lines.

| Throttle | Posture | Depth | Emits | STRATEGY anchor |
|---|---|---|---|---|
| **Audit** | Reactive — a check is on the table | Fast, shallow pass | Verdict (BUY/DON'T/RENEGOTIATE/HOLD) + **lite map** + board one-pager | Pre-Purchase Technology Audit (Service Line 2) |
| **Preventive** | Sold by *aggregate, anonymized* audit evidence | Med | The pattern: "this is how these bets fail" → fractional | Audit flywheel (anonymized/aggregate ONLY — confidentiality P0) |
| **Proactive Fractional** | Ongoing, ahead of need | Full, continuous | Living map + governed initiatives + 90-Day Matrix deliverables | Core Fractional Engagement |

The audit's lite map is literally the full map at low throttle — not a
separate artifact. The audit's credibility (its power *as a marketing
tool*) is borrowed entirely from the strict-bar-validated question bank;
that is why the 2026-05-19 validation work is the substrate of this GTM,
not a detour.

---

## The Deliverable Builder (the output organ — Law 6 made real)

Because the artifact *is* the product:

- **Document Model** = the artifact as structured data (sections,
  findings, the board one-pager, the requirements brief, the map, the
  roadmap). Durable, per-engagement, tenant-isolated (Architectural Law 3,
  P0). This is the thing that lasts; renderers are swappable.
- **Renderer v1 (build first):** publication-grade files —
  `.docx` / `.pptx` / Google-Docs-importable. Zero OAuth, works for
  **both** Google and Microsoft ecosystems, dogfoggable on live clients
  this week. This alone delivers "pour unstructured in → board-grade out."
- **Renderer v2 (one live integration, later):** a single bidirectional
  office-suite sync (Google **or** M365). The choice is set by what the
  founder's *actual paying clients run* — a real input the founder
  supplies, never fabricated here. It is the only new auth/tenant surface;
  added deliberately, behind the proven Document Model, never before it.
- Every rendered artifact carries the practitioner's brand and stands
  alone (Law 6). Templated per artifact type and per industry (throughput:
  generate, don't hand-build).

Engineering discipline: generation and sync are separate concerns. We do
not spend an innovation token on Graph/Drive round-trip before the
Document Model and the spine are proven. Reversible by construction.

---

## The map as the universe

The EDEC-style target architecture map (layered, systems classified,
regulatory overlays) is **not a deliverable you draw** — it is a render of
`EngagementState`, industry-templated (a library, not a blank page),
generated from an intake interview, and accreting per initiative with a
**two-state node** (resolving the value-hierarchy operability constraint):

- `gate-passed` — the Tier-1 decision gate was answered (observable
  process fact, self-certified). The node lights up **immediately**, so
  the map is alive from day one. The UI must label this "decision gate
  complete", never "good decision".
- `value-confirmed` — a Tier-2 client-reported checkpoint was later
  logged. The node deepens. This may take months and is never required
  for the map to feel alive.

Maturity is positioned *on the map per initiative*, in service of that
initiative's decision gate, not as a one-time 16-module survey. The
128 questions are the lens; the map is the terrain; sound decisions are
the moves. Sitting with a CEO watching their architecture light up as
**decisions are made soundly** (and deepen as value is confirmed) is
"make the work visible" — and it works on day one, not in 18 months.

---

## The journey = throttle depths, not separate apps

`STRATEGY-2026.md` Phases A-G recast: one spine, each phase emits **one
visible decision-grade artifact in minutes** (the anti-analysis-paralysis
law — the #1 thing CEOs named: they will follow a process if it is fast
and progress is visible).

| Phase | Spine stage | The one artifact it emits |
|---|---|---|
| A Onboarding | Frame the client + intake | Client + first map skeleton |
| B Diagnostic | Real business pain + strategic job | Pain/JTBD brief (blank field → first finding) |
| C Strategic | Charter + Tech/Vendor selection | Charter; selection rationale |
| D Execution | Initiative governance (advise/coach) | Roadmap + next steps (PM execution stays in client tools) |
| E Value | Status + cadence | Auto-drafted Status Report |
| F Re-assessment | Re-position on the map | Updated map + maturity delta |
| G AI Accelerator | (Phase 2.5) | AI roadmap |
| Audit (parallel) | Reactive throttle | Verdict + lite map + board one-pager |

**Phase success metric is decision-gate-passed (Tier 1, observable
process fact — NOT a quality claim), not phase completion and not
realized value the product cannot see.** An initiative reaches
`gate-passed` when its decision gate is answered; it reaches
`value-confirmed` only if/when a client-reported checkpoint is later
logged (Tier 2). The map node lights `gate-passed` at the decision
moment and deepens to `value-confirmed` later — never blocking on the
lagging signal.

You **advise, decide, negotiate, coach. You never execute** — every
artifact is decision-grade or coaching-grade, never PM/delivery tooling
(command-center reframe: never compete with Jira/Asana).

---

## The scoring invariant — weapon, not tool (the hierarchy's intake gate)

This is how the value hierarchy is *enforced at the front door*. Every
initiative and every audit must name the **strategic job-to-be-done** the
technology serves **and the business case whose success will be measured**.
Tech with no named job + no measurable business case is flagged a *tool*
(commodity buy — the failure pattern clients arrive with) and cannot
proceed. Tech with both is a *weapon*. Pillar 3 + Audit Lens 1 (Strategy
Fit) made a hard gate, not a slogan. A blank job or a blank business case
is not an error — it is the first finding (`STRATEGY-2026.md` intake gate
discipline). Nothing downstream (map, maturity, roadmap) renders until
this gate is answered, because everything downstream is its helper.

---

## What v2 adds over v1 (the legible delta)

1. Law 6 (artifact is the product / conversion instrument).
2. Law 7 + the `EngagementState` primitive + the proactive Home.
3. The three throttles on one spine.
4. The Deliverable Builder (Document Model + file-first renderer +
   deferred single office-suite sync).
5. The map as accreting state, industry-templated.
6. The full journey as throttle depths (v1 specced only the Audit).
7. The value hierarchy with the **two-tier measurement model**: Tier-1 is
   "decision GATE passed" — an observable, self-certified **process fact**
   the product tracks and lights the map on, explicitly NOT a quality
   claim (relabelled per the Codex outside-voice 2026-05-19 catch that a
   self-certified checklist is circular as a measure; promotion to a real
   quality measure — rubric + thresholds + independent check — deferred to
   the EngagementState primitive review). Tier-2 realized value is
   lagging, client-reported, never product-gated. Maturity assessment and
   the map are subordinate helpers, never destinations (weapon-not-tool is
   the intake gate).
8. Build order **inverted to ship-to-learn-first**: one real client
   deliverable on the live engagement before the `EngagementState`
   primitive is built (the meta-flaw / kill-switch fix).

---

## Eng-review outcome (2026-05-19)

`/plan-eng-review` ran on this v2 spec. Scope gated to **step 1 only**
(ship-to-learn on the live vendor-selection engagement). Result: **CLEAR,
scope-reduced.** 5 issues raised + 3 cross-model tensions (Codex outside
voice) resolved. Spine changes applied: Tier-1 relabelled "decision GATE
passed" (honest process fact, self-certification limit stated, hardening
deferred). Step-1 plan locked: expanded full-data-surface P0 gate → npm ci
→ Selection Engine distilled content → external doc-gen → content-layer
safety + passive shadow log. No `EngagementState`/map/renderer/sync built
in step 1. Deferred items in `TODOS.md` §3. 0 unresolved, 0 critical gaps.

## Known strategic risks carried into the eng-review

A MECE challenge (2026-05-19) surfaced six flaws. Two were spine-structural
and are fixed above (#3 measurement contradiction → two-tier model; #6
sequencing → ship-to-learn-first build order). The remaining four are
strategy-level, are NOT silently resolved, and a future `/plan-ceo-review`
must treat them as live risks, not settled (tracked in `TODOS.md` §3e):

1. **Audit buyer segment.** The buyer is the accountable principal who
   *already has doubt*, not "anyone buying tech." Narrower and closer to
   the founder's existing network than the strategy implies. Move the
   intervention earlier than signing? Unresolved tension with "audit is
   at the end."
2. **Leverage optimizes the cheap part.** The bottleneck is the founder's
   judgment/presence, not document production. Realistic throughput is
   3→5 clients, not 3→15; deep review of every artifact can *raise*
   cost-to-serve unless generation is trusted on light review.
4. **Pitch vs. validated reality.** "Framework-cited, board-ready" is the
   differentiator, but the strict validation is 30% strong / 9
   indefensible. Reconcile the promise language to what survived; the
   `TODOS.md` second pass is remediation, not optional.
5. **Flywheel needs scale.** "Aggregate anonymized audit evidence" is
   re-identifiable at N=2-3 and barred by the confidentiality rule. It is
   a Year-2+ mechanism; Year-1 pipeline is network + referral only.

What is sound and must not be re-litigated: business-case-over-maturity as
the unit of value; advise-never-execute as scope/premium boundary;
anti-paralysis as a design law; supersede-don't-destroy governance; doing
the validation at all.

## Review gate (mandatory, strengthened)

Before any code moves against v2: run **`/plan-eng-review`** on this spec
(architecture of the `EngagementState` primitive, the Document Model,
tenant isolation of the sync surface, the build sequence). Before any new
user-facing screen or artifact ships: review it against the seven laws; a
screen/artifact that fails any law does not ship. This is the discipline
whose absence produced the overwhelm — twice. Not optional.

This doc is refreshed in place when the spine changes and supersedes
per-screen and per-artifact decisions everywhere.
