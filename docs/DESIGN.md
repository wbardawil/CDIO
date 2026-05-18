# AI-CDIO — Design System (source of truth)

> ⛔ Client-confidentiality rule applies (see `CLAUDE.md` top). Every example
> in this doc is invented and obviously fictional.
>
> **Reconstructed 2026-05-18.** The original `DESIGN.md` (produced by
> `/design-consultation` the same day) was lost with an interrupted editor
> session; this file is regenerated faithfully from the surviving design
> preview. Every font, color, spacing, and radius value below is the source of
> truth all AI-CDIO UI is built and QA'd against. It governs in service of
> `docs/EXPERIENCE-SPINE.md` (the UX contract); where they speak to the same
> screen, the Spine governs behavior and this doc governs appearance.

## The one principle

**Authority through subtraction.** The product should feel like the calm,
unhurried clarity of someone who deeply knows the material and makes it obvious
to you. Aesthetic: an editorial advisory brief, never a SaaS dashboard. A CEO
should finish a screen already knowing what to do, and feel informed — never
scolded.

Three rules that fall out of it:

- **No blue, anywhere.** Blue is the generic-IT tell every competitor uses.
- **Amber appears exactly once per screen** — the single next thing to do.
- **Maturity reads sand → evergreen, never red/green alarm.** Inform, don't alarm.

## Tokens — light (shipped)

```css
:root {
  /* surfaces */
  --paper:#FAF8F2;  --surface:#FCFBF7;  --raised:#FFFFFF;
  /* text */
  --ink:#1A1A17;    --muted:#6B6960;    --faint:#9A968B;
  /* lines */
  --hair:#E7E2D5;   --hair-strong:#D8D2C2;
  /* brand — evergreen is the voice */
  --evergreen:#0F4C44;  --evergreen-deep:#0A352F;  --evergreen-soft:#E7F0EC;
  /* the single action color */
  --amber:#C2772E;      --amber-deep:#A35F1F;      --amber-soft:#FBF0E0;
  /* error */
  --brick:#9E4B3B;
  /* maturity ramp — sequential sand→evergreen, never alarm */
  --m1:#D9CBB0; --m2:#BFBE93; --m3:#86A276; --m4:#3E7A63; --m5:#0F4C44;
  /* spacing scale */
  --s1:4px;  --s2:8px;  --s3:12px; --s4:16px; --s5:20px; --s6:24px;
  --s8:32px; --s10:40px; --s12:48px; --s16:64px; --s20:80px; --s24:96px;
  /* radius — surfaces are gently rounded, never rounded-full */
  --r-sm:4px; --r-md:8px; --r-lg:12px;
  /* type */
  --serif:"Fraunces",ui-serif,Georgia,"Times New Roman",serif;
  --sans:"Geist",-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
  --mono:"Geist Mono",ui-monospace,"SF Mono",Menlo,monospace;
  /* motion */
  --ease:cubic-bezier(.22,.61,.36,1);
}
```

## Tokens — dark (documented, NOT shipped)

Dark mode is GAPS P3 / premise 4: the token *architecture* is preserved here so
it is a one-block add later, but no `[data-theme="dark"]` block and no toggle
ship in this pass.

```css
/* html[data-theme="dark"] — future, do not wire yet */
--paper:#14201C; --surface:#19271F; --raised:#1E2E26;
--ink:#F2EFE6;   --muted:#A4AFA4;  --faint:#7C887C;
--hair:#2C3B33;  --hair-strong:#3A4C41;
--evergreen:#5FB3A1; --evergreen-deep:#7FCAB8; --evergreen-soft:#1F352E;
--amber:#E0995A;     --amber-deep:#EBAE76;     --amber-soft:#352719;
--brick:#D08373;
--m1:#54513F; --m2:#7C7B53; --m3:#5E8A6E; --m4:#3E9079; --m5:#5FB3A1;
/* amber/evergreen filled buttons flip their text to #14201C in dark */
```

## Typography

Fraunces carries authority (a serif headline reads *advisor*, not *SaaS*).
Geist carries clarity — neutral, never generic, **tabular numbers for every
figure**. Geist Mono is for ids only.

| Role | Family / weight | Size · line-height | Notes |
|---|---|---|---|
| Display | Fraunces 500 | 3rem · 1.08 · ls −.02em | the finding / hero |
| H1 / H2 | Fraunces 600 | 2rem / 1.4rem · 1.12 · ls −.01em | section heads |
| Emphasis | Fraunces 500 italic | 1.5rem · evergreen | the pivot ("…but one decision changes that") |
| Body | Geist 400 | 1.02rem · 1.65 · max 62ch | `ss01`,`cv01`, antialiased |
| Data | Geist 500 | 1.7rem · tabular-nums | money / levels / day counts |
| Small / eyebrow | Geist 600 | .72–.82rem · ls .14em · UPPERCASE | label color = evergreen (amber/faint variants) |
| Id | Geist Mono | .9rem · muted | `decision-pkg-7f3a` style |

Base rule: `h1,h2,h3 { font-family:var(--serif) }`; `body { font-family:var(--sans) }`.

## Components

- **Button** — `primary` = evergreen fill / white text (hover → evergreen-deep);
  `secondary` = transparent, `--hair-strong` border, ink text (hover → evergreen);
  `ghost` = muted text only; `amber` = amber fill (the one action per screen).
  Radius `--r-sm`.
- **Input** — `--raised` bg, `--hair-strong` border, ink text; `:focus` border →
  evergreen. No blue focus ring.
- **Card / panel** — `--raised` bg, `1px solid --hair`, radius `--r-md`, soft
  shadow `0 18px 48px -28px rgba(26,26,23,.22)`. Never `bg-white border-gray-200`.
- **Note / callout** — `calm` = evergreen-soft bg + evergreen text;
  `attn` = amber-soft bg + amber-deep text. (Maps to interaction states:
  in-progress = calm/evergreen-soft, attention = amber, error = brick.)
- **Chip / status** — neutral outline by default; `on` = evergreen ("On track");
  `due` = amber ("Action due"). Status reads at a glance without color-shouting.
- **Eyebrow** — uppercase, letter-spaced, evergreen; the small label above a block.
- **Disclosure** — "Show the full analysis" / "See the N findings behind this →"
  rendered as an evergreen text link, deliberately off the main screen
  (Spine Law 5: evidence one click away).
- **Maturity ramp** — 5 sequential steps m1→m5, the current level outlined in
  ink; replaces radar/spider/matrix as the first thing (Spine Law 3).

## De-slop mapping (slop utility → semantic token)

The mechanical codemod uses exactly this table. No new colors are introduced.

| Slop (before) | Token utility (after) |
|---|---|
| `bg-gray-50` / `bg-slate-50` | `bg-paper` |
| `bg-white` (cards/chrome) | `bg-raised` |
| `bg-gray-100` | `bg-surface` |
| `text-gray-900` / `text-black` | `text-ink` |
| `text-gray-600` / `text-gray-500` | `text-muted` |
| `text-gray-400` | `text-faint` |
| `border-gray-200` / `border-gray-300` | `border-hair` |
| `bg-blue-600` / `bg-indigo-600` | `bg-evergreen` |
| `text-blue-600` / `hover:text-blue-600` | `text-evergreen` / `hover:text-evergreen` |
| `border-blue-600` / `ring-blue-500` | `border-evergreen` / `ring-evergreen` |
| `bg-red-*` (error) | `bg-brick` / `text-brick` |
| `from-slate-* via-* to-blue-*` gradient | removed → `bg-paper` |
| `rounded-full` on a surface/number-circle | structural fix (steps 4–7), not a rename |

## QA rules (every screen, before it ships)

1. `git grep` slop pattern in the scoped tree → **0**.
2. No `blue-*` rendered anywhere. Headings Fraunces, body Geist, page `--paper`.
3. **Exactly one** amber action element per screen.
4. No `rounded-full` surfaces / number-circle bullets; brief hierarchy, not a
   gray card stack.
5. Interaction states present in-system: loading, empty (says the next action,
   not "no data" — Spine Law 4), error (brick), partial, in-progress
   (evergreen-soft).
6. Re-check Spine Laws 1, 2, 4, 5 still pass (`docs/EXPERIENCE-SPINE.md`).

This doc is refreshed only when the design system itself changes. It supersedes
ad-hoc color/type choices everywhere.
