# LEVERS Framework — Reference Lens

> **Status: reference lens, NOT an operating override.** Added 2026-05-17
> at founder request (branch `claude/review-cdio-handoff-4bR8R`).
> This is a generic business-validation framework supplied verbatim by
> the founder. It does **not** supersede `STRATEGY-2026.md` or any locked
> decision in `CLAUDE.md`. The bracketed `[n]` markers are citations to
> the founder's external source (not in this repo) — kept for fidelity,
> ignore as dead links. The **AI-CDIO Fit Review** at the bottom is
> project-specific commentary, not part of the original framework.

---

## The Framework (as supplied)

**Role:** Act as a strategic product and business validation co-pilot.
The goal is to systematically build and refine the product by treating
the business like a mathematical equation and prioritizing validated
learning over blind feature development, using the five core principles
below [1].

### 1. Enforce the "W3" (Who, What, Why)
Before writing code or building features, define and constantly refine
the foundational W3 [2].
- **Who is the customer?** Define the customer as narrowly and
  specifically as possible [3]. The initial definition must be so tight
  that a 100% close rate in sales conversations is achievable [4]. Only
  after validating this do we expand [5].
- **What are they buying?** The difference between what is *sold* and
  what the customer *buys* [6]. Customers buy outcomes (they don't buy a
  drill; they buy a hole) [7].
- **Why do they buy it?** Articulate the value the customer gets, and
  define *how the customer measures this success* [8, 9]. For B2B,
  identify both why the *company* buys and why the *individual buyer*
  buys [10].

### 2. Map the Revenue Formula
Treat the business as a mathematical equation [11]. Define the specific
formula for how the business generates revenue [12].
- Break top-line revenue into core values (e.g.,
  Visits × Conversion Rate × Price = Revenue) [13].
- Identify the underlying "drivers" and "subdrivers" for each value so
  the tactical actions that move the metrics are explicit [14, 15].

### 3. Prioritize Assumptions and Tests
Create a culture of learning and validation [16]. Before spending
runway building a feature, categorize the belief [17-19]:
- **High-Priority Validated:** core beliefs backed by primary data
  [18, 20]. → Operationalize and build.
- **High-Priority Unvalidated:** critical guesses that could unlock
  massive growth or kill the business if wrong [19]. → Urgently design
  lightweight tests to validate *before* writing heavy code [21].
- **Low-Priority:** nice to have, not critical [22]. → Deprioritize to
  save runway.

### 4. Track KPIs that are decision tools, not vanity metrics [23, 24]
- Focus on *outputs* (results) over *inputs* (effort) [25, 26].
- Prefer *leading indicators* (predict future behavior, e.g.
  engagement) over *lagging indicators* (what already happened, e.g.
  churn/revenue) [26, 27].

### 5. Align with the Financial Model
Features and roadmap must connect back to a dynamic, bottom-up financial
model [28, 29]. Run "what-if" scenarios before executing (e.g.
mathematically predicting how a price change impacts churn and runway)
[30, 31].

**Operating instruction (as supplied):** When a new feature is proposed,
validate which specific Revenue-Formula *driver* it impacts, verify
whether the assumption is validated, and confirm it aligns with the
narrowly defined W3.

---

## AI-CDIO Fit Review (2026-05-17)

Honest assessment against the locked strategy. The framework is sound
but **largely confirmatory** here, and two of its five pillars actively
pull against decisions that are already locked. Adopt selectively.

| Pillar | Verdict for AI-CDIO | Why |
|---|---|---|
| **1. W3** | ✅ Already a project strength — confirmatory, not transformative | "Who" is locked tighter than the framework demands (Customer #0 = the founder; Year 1 = his CEO clients via him; expansion to other fractionals is explicitly Year 2+). "What" is already outcome-framed (the Differentiated Promise). "Why/measurement" surface already exists (`OUTCOMES.md` + Day-90 kill switch). |
| **2. Revenue Formula** | ⚠️ **Premature — in tension with locked strategy** | Year 1 is *deliberately not* revenue-instrumented: the Day-90 kill-switch metric is **CEO outcomes delivered, NOT paying-customer count** (locked 2026-05-07 eve). Stripe + paying customers = Phase 3. Building a revenue formula now would re-litigate a locked decision. **Park until Phase 2 Day 37-38** (pricing lock on Day-19 cost telemetry — see `PRICING.md`). |
| **3. Assumptions & Tests** | ✅ Adopt now — adds one thing `GAPS.md` lacks | `GAPS.md` already does P0/P1/P2 priority. What it does *not* make explicit is the **"lightweight test before heavy code"** gate for High-Priority-Unvalidated items. Highest-value application *today*: the **UNPROVEN extraction + grading quality** flagged in `SESSION_HANDOFF.md` — that is the textbook High-Priority-Unvalidated item and should get a cheap real-document test before further build. |
| **4. KPIs (leading vs lagging)** | ✅ Adopt now — genuinely sharpens `OUTCOMES.md` | The outcome log is currently **lagging-heavy** (outcomes already delivered). A leading indicator — e.g. *founder runs ≥1 real decision end-to-end per week*, *decisions reaching verdict* — would predict the Day-90 kill-switch verdict weeks earlier instead of at the deadline. |
| **5. Financial Model** | ⚠️ **Premature** — same reasoning as Pillar 2 | Bottom-up model + what-if pricing is a Phase 2 Day 37-38 / Phase 3 activity. `PRICING.md` already defers this intentionally. Running it now is the premature-optimization the process discipline warns against. |

### Net recommendation
- **Adopt now:** Pillars 3 and 4. Concretely: (a) tag the current
  unproven extraction/grading quality as *High-Priority Unvalidated* and
  design the cheapest possible real-document test before more build;
  (b) add one *leading* indicator to `OUTCOMES.md`.
- **Park until Phase 2 Day 37-38:** Pillars 2 and 5 (revenue formula +
  financial model). Revisit with Day-19 cost telemetry.
- **Treat Pillar 1 as confirmatory:** useful as a periodic sanity check,
  not a re-opening of the locked W3.
- **Do NOT** add this to the mandatory Read-First chain or let its
  "operating instruction" override `STRATEGY-2026.md`. Its biggest risk
  in this project is being used to reopen settled strategic decisions or
  to justify building revenue machinery before Year 1's outcome proof
  exists.
