# AI-CDIO: The Experience Spine

> ⛔ Client-confidentiality rule applies (see `CLAUDE.md` top).
> **Created 2026-05-13.** Produced after Customer #0 (the founder, the
> person who designed the product) reported being lost and overwhelmed
> using it. That is the most serious possible signal: the product
> violates its own `STRATEGY-2026.md` contract ("features subordinate
> to outcomes, outcomes subordinate to feelings; no jargon; CEO-facing").
> This doc is the governing spec every screen is built and reviewed
> against. Grounded in: the strategy's Practitioner Feeling Map;
> gstack's design-review discipline (`design-review`,
> `plan-design-review`, `design-consultation`); gsd-2's progress model
> (the system carries the work forward and always shows where you are).

---

## The one sentence

**You pour a problem in, the app carries it, you always know where you
are and what the one next thing is, and you get a plain-English answer
— the framework is invisible scaffolding, never the screen.**

If a screen fails that sentence, the screen is wrong.

---

## The five spine laws (every screen is reviewed against these)

### Law 1 — Never lost, never dead-ended
Every screen has, always visible: where you are (breadcrumb), the way
back (one click to the client, one to all clients), and the one next
thing. No screen is an island. The legacy dashboard dead-end (you
clicked in and couldn't get back) is the canonical violation this spine
exists to kill. **Enforced by a single shared shell, not per-page
chrome.**

### Law 2 — One primary action per screen
Each screen has exactly one obvious thing to do next, visually dominant.
Everything else is secondary or hidden. A wall of equal-weight options
(the old audit form, the dashboard tab grid) is a Law 2 violation.

### Law 3 — Plain language on the surface; framework underneath
The surface speaks the way a CEO speaks at dinner. No "M2", no
"Strategic Bet / Defer", no "consensus 2.2/4", no radar/matrix as the
first thing. The framework (NIST, CMMI, the 5 lenses, the priority
matrix) is real and rigorous but lives behind an explicit, optional
**"Show the full analysis"** disclosure. Rigor is earned trust, not
front-of-house decoration.

### Law 4 — Visible progress; the system carries it
The engagement has a spine the user can see advancing: a small,
persistent progress indicator of where this piece is (e.g. Audit:
1 Frame · 2 Prep · 3 Verdict). Blank states say what to do, not "no
data". The feeling is "it's handling it", not "I have to drive every
step." (gsd-2 lesson: durable, visible, self-advancing state.)

### Law 5 — Outcome first, evidence on request
Every output leads with the plain answer and the money/decision — the
thing a busy principal reads in 15 seconds. The reasoning, citations,
lens-by-lens detail come *after*, behind a disclosure. Never make the
user assemble the conclusion from analyst internals.

---

## What this maps to in the Feeling Map (STRATEGY-2026)

| Feeling the strategy promises | Spine law that delivers it |
|---|---|
| "I'm not the bottleneck" | Law 4 — the system carries it, visible progress |
| "I look like the CEO I want to be" | Law 3 + Law 5 — plain language, outcome-first |
| "My methodology travels with me" | Law 1 — one coherent place, nothing lost |
| Ease / a sense of progress (the founder's exact words) | Laws 1, 4 — never lost, always advancing |

---

## The shell (Law 1 + 4, made concrete)

A single shared component renders the chrome on **every** client-scoped
screen — workspace, audits, the legacy dashboard, everything:

- **Line 1 — orientation:** `Your clients ‹ {Client} ‹ {Where you are}`
  — each crumb a link. The "Your clients" and "{Client}" crumbs are
  the always-available way back. This alone kills the dead-end.
- **Line 2 — the client + one-line state** (size · industry · the one
  next thing for this client).
- **Section nav** stays, but it is the *same* nav everywhere, so moving
  between Audit / Assessment / Roadmap feels like one place, not
  separate apps.

No screen renders its own bespoke header anymore. One shell, used
everywhere, is what makes it "feel like one thing."

---

## The Audit flow as the proof (rebuilt against the spine)

The Audit is the pitch-ready piece; it proves the spine:

1. **Frame the decision** (intake) — plain prompts, paste-raw, one
   primary action: *Create*.
2. **Prep the room** (companion) — one primary action: *Generate the
   questions to ask*.
3. **The verdict** — leads with the plain answer + the money + the
   recommendation in a sentence a board reads in 15 seconds. The
   five-lens analysis, evidence, method capture all sit behind
   **"Show the full analysis."**

A persistent 1-2-3 progress strip is always visible so the user feels
the system carrying it.

---

## Review gate (the discipline we skipped — now mandatory)

Before any new user-facing screen or flow ships: review it against the
five spine laws above (this is the local stand-in for gstack
`plan-design-review` / `design-review`, which were never run this
session and should be — that omission is what produced the overwhelm).
A screen that fails any law does not ship until it passes.

This doc is refreshed when the spine changes. It supersedes per-screen
header/nav decisions everywhere.
