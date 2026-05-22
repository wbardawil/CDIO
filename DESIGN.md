# Design System — AI-CDIO

> Source of truth for every visual and UI decision in this app. Read this before
> writing or reviewing any UI. Do not deviate without explicit user approval.
> Created by `/design-consultation` (2026-05-18). All example content in this
> file is invented and fictional per the project confidentiality rule.

## Relationship to the Experience Spine (read this first)

`docs/EXPERIENCE-SPINE.md` is the **governing UI specification**. It owns
structure, orientation, flow, and progress (the 5 spine laws). This file owns
the **visual language** (type, color, spacing, motion) that those structures are
rendered in. DESIGN.md is **subordinate**: when a visual choice here conflicts
with a spine law, **the Spine wins** and DESIGN.md is corrected.

They are designed to reinforce each other, not compete:

| Spine law | DESIGN.md mechanism that serves it |
|---|---|
| Law 2 — one primary action per screen | Amber used exactly once per screen = the single action |
| Law 3 — plain language; framework underneath | Editorial/advisory aesthetic; Fraunces reads "advisor," not "SaaS" |
| Law 5 — outcome first, evidence on request | Brief-not-dashboard composition; evidence behind progressive disclosure |
| Law 1 + 4 — never lost; one place; visible progress | Calm restraint + the shared shell; the 5-step maturity/progress ramp |

Every screen is reviewed against the Spine laws **and** this file, Spine first.

## The one thing this system serves

**Memorable thing:** *the calm, unhurried clarity of someone who deeply knows the
material and makes it obvious to you.*

Every type, color, spacing, and layout choice exists to make a hard technology
decision feel **resolved**. Authority comes from clarity and subtraction, not
density. When a choice fights this, the choice is wrong.

## Product Context
- **What this is:** AI-CDIO, the Fractional Executive Operating System — turns a
  30-file CDIO playbook into interactive engines (maturity assessment, decision
  packages, AI roadmap, charter, status reports) that produce real deliverables.
- **Who it's for:** Year 1, non-technical SMB **CEOs** viewing through their
  fractional CDIO (the operator). Year 2+, other fractional executives.
- **Space/industry:** fractional executive tooling / executive decision
  intelligence / IT advisory. Direct competitor: ScalePad LMX (MSP-operator
  focused, soft mint B2B-SaaS look — the gap we exploit).
- **Project type:** serious B2B web app (executive command center) with a public
  lead-gen front (free health check / quick scan).

## Aesthetic Direction
- **Direction:** Editorial / Advisory-brief — private-bank-meets-strategy-firm,
  not a SaaS dashboard.
- **Decoration level:** minimal → intentional. Hairline rules and a faint
  warm-paper surface only. No blobs, no gradient accents, no icon circles, no
  3-column feature grids, no centered hero.
- **Mood:** calm, unhurried, confident, premium. The feeling of a trusted
  advisor handing you a one-page brief where the decision is already made and
  the next step is unmistakable.
- **Reference points:** Mercury (calm authority, negative space), Linear
  (restraint, precision). Anti-reference: ScalePad LMX, and this app's prior
  default-Next.js slop (Arial body, blue-600, slate→blue gradient, icon-circle grid).

## Typography
- **Display / Hero / Section titles:** **Fraunces** (variable; opsz 9–144;
  weights 400/500/600/700; italic available). A high-craft serif headline reads
  *advisor*, not *SaaS*. Use weight 500–600 for display; italic 500 in evergreen
  for the emphasized clause ("…but one decision changes that.").
- **Body / UI / labels / data:** **Geist** (weights 300/400/500/600). Neutral,
  never generic. Body 400. UI labels/eyebrows 600, uppercase, letter-spacing
  ~0.14em. All numbers use `font-variant-numeric: tabular-nums`.
- **Code / IDs (rare):** **Geist Mono** (400/500).
- **Loading:** Google Fonts —
  `https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap`.
  `--font-geist-sans` / `--font-geist-mono` are already wired in the app; add Fraunces.
- **Scale (clamp where noted):**
  - Display XL (hero finding): Fraunces 500, `clamp(1.9rem, 4.2vw, 3.05rem)`, line-height 1.12, tracking -0.015em
  - H1: Fraunces 600, ~2rem
  - H2: Fraunces 600, ~1.4–1.5rem
  - Body large (brief lede): Geist 400, 1.06rem, line-height 1.6
  - Body: Geist 400, 1rem, line-height 1.65
  - Data figure: Geist 500, tabular-nums
  - Eyebrow / small UI: Geist 600, 0.72rem, uppercase, tracking 0.14em
  - Mono / id: Geist Mono, 0.85–0.9rem

## Color
- **Approach:** restrained. Warm paper + ink + one evergreen + exactly one amber.
  **No blue anywhere** — blue is the generic-IT tell every competitor and the old
  app used. Amber appears **once per screen**: the single recommended action.

Light (default):
- `--paper #FAF8F2` background · `--surface #FCFBF7` · `--raised #FFFFFF`
- `--ink #1A1A17` primary text · `--muted #6B6960` · `--faint #9A968B`
- `--hair #E7E2D5` · `--hair-strong #D8D2C2` (borders/rules)
- `--evergreen #0F4C44` primary · `--evergreen-deep #0A352F` (hover) ·
  `--evergreen-soft #E7F0EC`
- `--amber #C2772E` (single action only) · `--amber-deep #A35F1F` (hover) ·
  `--amber-soft #FBF0E0`
- `--brick #9E4B3B` — genuine error only (calm, not a bright alarm red)

Dark ("Night brief") — **SPEC-ONLY, DEFERRED to Phase 4-5.** Dark mode is GAPS
P3 and the `globals.css` note explicitly defers it; these tokens are recorded so
the system is ready, but dark mode is **not implemented in the remediation work**.
A deep evergreen-ink canvas, not generic gray:
- `--paper #14201C` · `--surface #19271F` · `--raised #1E2E26`
- `--ink #F2EFE6` · `--muted #A4AFA4` · `--faint #7C887C`
- `--hair #2C3B33` · `--hair-strong #3A4C41`
- `--evergreen #5FB3A1` · `--amber #E0995A` · `--brick #D08373`
- On dark, evergreen/amber buttons use `#14201C` text.

**Maturity ramp (5 levels, sequential sand→evergreen, never red/green alarm):**
`L1 #D9CBB0` Initial · `L2 #BFBE93` Reactive · `L3 #86A276` Defined ·
`L4 #3E7A63` Managed · `L5 #0F4C44` Optimizing. A CEO should feel informed,
never scolded.

- **Semantic:** success = evergreen; attention/action = amber; error = brick.
  Info = muted ink. No additional status hues.

## Spacing
- **Base unit:** 8px (4px allowed for fine adjustments).
- **Density:** spacious on trust screens (Decision Brief), comfortable on data
  screens (Maturity, Portfolio).
- **Scale (px):** 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96.
- Generous line-height on brief copy is a clarity requirement, not a preference.

## Layout
- **Approach:** hybrid. Disciplined left-aligned grid for app/data surfaces;
  **brief composition** for trust screens.
- **Brief composition (the core pattern):** one large serif finding as the hero,
  a calm 5-step maturity indicator, **one** amber recommended-action callout, and
  a quiet text disclosure ("See the N findings behind this →"). Evidence,
  sources, and dissent are **hidden by default** — progressive disclosure, never
  shown unprompted. Withholding density *is* the design.
- **Max content width:** ~1080px for marketing/brief; app surfaces may go wider
  with a calm grid.
- **Border radius (restrained — editorial, not bubbly):** sm 4px · md 8px ·
  lg 12px. No fully-rounded pills for primary actions (pills read SaaS). Status
  chips may use 100px radius.

## Motion
- **Approach:** minimal-functional. Calm = nothing bounces. Motion should feel
  like a decision *resolving*, never performing.
- **Easing:** `cubic-bezier(.22,.61,.36,1)` (settled ease-out); standard ease-in
  for exits.
- **Duration:** state changes 150–250ms · view transitions 250–400ms · theme
  switch ~400ms. No scroll-driven choreography.

## Localization readiness (Spanish + English) — design-level only

Full i18n (translated strings/deliverables) is roadmap-deferred (GAPS P3,
Phase 5). This section is the **design discipline** that keeps the system from
blocking it later, because the founder's live customers are Spanish- and
English-native:

- **Glyph coverage:** Fraunces and Geist both ship full Latin-Extended — á é í
  ó ú ñ ü ¿ ¡ « » render correctly. Do not substitute a font that lacks them.
- **Text expansion:** Spanish runs ~15-25% longer than English. No fixed-width
  or single-line-truncated headings, buttons, nav labels, or the amber action
  callout. Size containers by `ch`/`max-width` and let text wrap; never clip.
- **No baked-in English copy in shared primitives.** The shell, buttons, and
  status chips take their label as a prop, never hard-code it, so a future i18n
  pass is a string swap, not a re-layout.

This is hygiene, not implementation: it costs nothing now and prevents a full
re-layout when i18n actually lands.

## Anti-patterns (auto-fail in QA)
- Any blue as a UI/brand color (the old `blue-600` CTA, slate→blue gradients).
- Arial/Helvetica/system-ui as display or body font.
- Centered hero, 3-column icon-circle "how it works" grid, gradient buttons,
  uniform bubble radius — the prior default-Next.js slop.
- Amber used more than once per screen, or for anything but the single action.
- Red/green "alarm" coloring on the maturity scale.
- Dashboard density on a CEO trust screen instead of brief composition.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-18 | Initial design system created | `/design-consultation`. Memorable thing = "tech finally makes sense to me" delivered as advisor-grade clarity. Editorial/advisory aesthetic; Fraunces+Geist; warm paper + evergreen + single amber, no blue; brief-not-dashboard on trust screens. Validated via real-font HTML preview. |
| 2026-05-18 | No blue (deliberate risk) | Blue is the universal IT/SaaS default and the prior app's color; dropping it is the primary differentiation bet vs ScalePad. Authority is carried by type + composition instead. |
| 2026-05-18 | Serif display in a B2B IT tool (deliberate risk) | Fraunces headline reads "strategy firm / private bank," not "dashboard" — the memorability lever. Must stay restrained in weight/usage. |
| 2026-05-18 | Brief-not-dashboard on trust screens (deliberate risk) | Structurally encodes the eureka: density destroys CEO comprehension. Evidence behind progressive disclosure for the operator, never cluttering the CEO default. |
| 2026-05-18 | Subordinated DESIGN.md to `EXPERIENCE-SPINE.md` | DESIGN.md was written without referencing the governing UI spec — a self-contradiction. Spine owns structure/flow; DESIGN.md owns visual language; Spine wins on conflict. |
| 2026-05-18 | Dark mode marked spec-only / deferred | "Night brief" was ahead of roadmap. GAPS P3 + `globals.css` note defer dark mode to Phase 4-5. Tokens recorded for readiness; not built in remediation. |
| 2026-05-18 | Spanish/English localization readiness as design constraint | Founder's live customers are Spanish/English-native. Full i18n stays roadmap-deferred; design-level glyph-coverage + text-expansion + prop-driven-label discipline added so i18n is later a string swap, not a re-layout. |
