# Lovable mockup prompt — AI-CDIO Executive OS

Paste the prompt block below into [lovable.dev](https://lovable.dev). It generates a clickable React + Tailwind mockup of the four key surfaces. Iterate on each surface via Lovable's natural-language editing. Screenshot what feels right; describe what feels wrong. The output is a SPEC for the in-repo `/mockup` route, not a foundation.

## Process

1. Sign in to lovable.dev (or wait if you're not in the rush to subscribe).
2. New project. Paste the prompt below verbatim.
3. Wait ~30 seconds for generation.
4. Click through the four surfaces. Note what feels right and wrong.
5. Iterate via Lovable chat: "the Architecture Map needs X", "the Decision Package wizard step 3 should ask Y instead", etc.
6. When a surface feels close enough, screenshot it.
7. Share the screenshots + notes with me. I'll rebuild what worked in the real Next.js app at `/mockup/...` using the actual DESIGN.md tokens.

## The Lovable prompt (paste this verbatim)

---

Build a clickable React + Tailwind mockup of an "Executive Operating System for IT leadership" called AI-CDIO. The product helps CDIOs and IT teams govern technology and run successful IT initiatives, with a methodology backbone of 16 IT modules (CMMI, COBIT, NIST, ITIL, TBM) + 6 PM cross-cutters (RAID, stakeholder map, scope baseline, change log, value tracking, retro). The product has two main surfaces that share data: a CDIO Workbench (the Architecture Map) and an IT Project Portfolio.

**Visual aesthetic.** Off-white background (#faf8f2). Serif headings (use a serif font like Lora or Source Serif). Evergreen accent color (#0f4c44) for primary actions. Brick red (#a14d3a) only for danger / failure states. Calm and executive. No gradients. Generous whitespace. Think Linear meets McKinsey deck meets Notion. Avoid SaaS-default purple. No emojis.

**Top chrome (every page).** Left side: breadcrumb "Your clients › TestCo Industries › [current page]". Right side: a chip "Wadi · Strategic Approver" and a user avatar. Below the chrome, a one-line subtitle "TestCo Industries · Day 14 of 90 · Maturity baseline 3.0/5 · 5 active initiatives".

**Section navigation tabs (every page).** Two main toggles, distinct from sub-nav: "CDIO Workbench" and "IT Project Portfolio". Active tab has the evergreen underline.

---

**Page 1 — CDIO Workbench: Company IT Architecture Map (the landing page).**

Show three view toggles at top: "Layered" (default selected), "Matrix", "Force-directed". Below the toggles, the default Layered view:

A 5-band horizontal diagram with connecting lines showing the strategic chain top to bottom:

Band 1 (top) — STRATEGIC PILLARS. Four labeled rectangles: "Growth", "Operational Efficiency", "Compliance & Risk", "Customer Experience". Each pillar is colored evergreen with white text.

Band 2 — BUSINESS CAPABILITIES. Eight smaller rounded rectangles: "Sales", "Service", "Operations", "Finance", "HR", "Legal", "Marketing", "Supply Chain". Lines from each capability up to one or two pillars.

Band 3 — IT CAPABILITIES. Eight rectangles: "CRM", "ERP", "HRIS", "Identity & Access", "Data Platform", "Cybersecurity", "Network", "Collaboration". Lines from each IT capability up to one or two business capabilities.

Band 4 — APPLICATIONS. Twelve app cards in a grid. Each card shows: app name, vendor logo placeholder, TIME tag (Tolerate / Invest / Migrate / Eliminate as small color-coded pill), annual cost ($XXk), contract renewal date. Sample apps: Salesforce (Invest, $180k), NetSuite (Invest, $220k), Workday (Tolerate, $95k), Snowflake (Invest, $140k), Okta (Tolerate, $45k), CrowdStrike (Invest, $80k), Microsoft 365 (Tolerate, $120k), GitHub (Tolerate, $30k), Tableau (Migrate, $40k), Jira (Tolerate, $25k), Zendesk (Invest, $60k), Slack (Tolerate, $30k). Lines connect each app to its parent IT capability.

Band 5 (bottom) — INFRASTRUCTURE & DATA. Three rectangles for infrastructure (AWS us-east, Azure eu-west, On-prem datacenter), and three for data domains (Customer data, Financial data, HR data).

Right sidebar — seven LENS filters as a vertical list. Each is a checkbox + label: "Security posture", "Vendor portfolio", "AI readiness", "Cost / TBM", "Strategic alignment gaps", "Compliance", "Talent capability". Clicking a lens filters the apps band to show only relevant apps + adds an overlay metric (for "Security posture" it shows a maturity score per security app; for "Cost / TBM" it shows a heatmap by cost; etc.).

---

**Page 2 — CDIO Workbench: Matrix Heatmap toggle of the same data.**

When user clicks the "Matrix" toggle on Page 1: render a matrix with Strategic Pillars as rows (4 rows) and IT Capabilities as columns (8 columns). Cells are colored by coverage strength: deep evergreen = strong coverage (3+ apps), light evergreen = some coverage (1-2 apps), white = no coverage (gap). Hover on a cell shows the apps in that intersection. Most cells should be partially covered; one or two should be empty (the gaps the CDIO needs to address). Below the matrix, a legend.

---

**Page 3 — IT Project Portfolio (when user clicks the second top-toggle).**

Kanban with 5 columns left-to-right: "① Parking Lot", "② Deciding", "③ Executing", "④ Communicating", "⑤ Graduating". Each column has a count chip.

Sample initiatives as cards (drag-and-drop look, but don't need to actually work):

In "Parking Lot" (3 cards):
- "Replace legacy expense tool" · owner Maria · 1 idea
- "Vendor consolidation review" · owner Ahmed · 0 votes
- "AI assistant for customer service" · owner unassigned · 2 votes

In "Deciding" (2 cards):
- "CRM migration to HubSpot" · Day 14 · RAG: amber · modules M2 M5 M7 M10 M11 · owner Maria
- "Cloud cost optimization" · Day 8 · RAG: green · modules M4 M11 · owner Ahmed

In "Executing" (3 cards):
- "Security baseline upgrade" · Day 58 · RAG: green · modules M7 M13 · owner James
- "Data platform consolidation" · Day 32 · RAG: amber · modules M5 M6 · owner Priya
- "Identity federation" · Day 45 · RAG: green · modules M7 · owner Maria

In "Communicating" (1 card):
- "Q3 status to board" · due Friday · owner Wadi · ready for review

In "Graduating" (1 card):
- "ERP integration v2" · final ROI 118% of projected · success scorecard 4/5 · owner Maria

Each card shows: title (bold), owner avatar, Day-X-of-90, RAG status colored dot, 3-5 module-touch chips (M2, M7, etc. with evergreen background), success-score badge if graduated.

---

**Page 4 — Initiative detail (when user clicks "CRM migration to HubSpot" card).**

Header: title "CRM migration to HubSpot", subtitle "TestCo Industries · Day 14 of 90 · Stage: Deciding · Owner: Maria", action buttons "Approve" (evergreen) and "Return with comments" (border-only).

Main column (two-thirds width):

**Module touch profile** as a row of 6 chips: M2 Strategy, M5 Data, M7 Security, M10 Vendor, M11 TBM, M15 Customer-Centric. Each chip is clickable (visually).

**Decision Package — wizard step 3 of 8.** Headline: "What problem is this solving?" Below it, a textarea (with placeholder text "Sales is losing deals because the current CRM data is stale and reps spend 40% of their time on data entry instead of selling"). Below the textarea, a small annotation: "This question is anchored to M2 Strategy Alignment best practice + COBIT 2019 EDM02." Right under, a "Save and continue" button (evergreen) and a "Save draft" button (border).

**Wizard stepper** at the top showing steps 1-8 with labels: 1. Context, 2. Stakeholders, 3. Problem, 4. Options, 5. Cost, 6. Risk, 7. Decision, 8. Approval. Step 3 highlighted in evergreen; steps 1-2 checkmarked.

Right sidebar (one-third width):

**Success scorecard preview.** Title "If approved, success measured at graduation against:" with 5 dimensions listed as cards:
- ① On-time (target Dec 15)
- ② On-budget ($240k, ±10%)
- ③ Value-realized ($500k projected, ±25%)
- ④ No security incident in first 90 days
- ⑤ Retro ≥ 4/5

**Module guardrails** below the scorecard. Title "Guardrails from touched modules". List 4-5 items like:
- "M7: Does this respect the org's security baseline (3.2/5)?" — currently green checkmark
- "M5: Has data migration risk been assessed?" — currently amber
- "M10: Has vendor due diligence been completed?" — currently green
- "M11: Has 3-year TCO been modeled?" — currently red (not done)

---

**Page 5 — Graduation Scorecard (for the "ERP integration v2" card in the Graduating column).**

Headline: "ERP integration v2 — Graduation Scorecard"
Subtitle: "Engaged Day 1 · Shipped Day 78 · Closed Day 91"

Big 5-dimension scorecard centerpiece, each dimension shown as a card with a result:
- On-time: ✓ Shipped 12 days early (green)
- On-budget: ✓ Came in at 92% of budget (green)
- Value-realized: ✓ 118% of projected ($590k vs $500k projected) (green)
- No security incident (90 days): ✓ Zero incidents (green)
- Retro: ✓ 4.4/5 score (green)

Aggregate badge: "5 / 5 · Success". In the top right.

Below the cards, a "Lessons learned" section pulled from the retro (5 short bullet points, lorem-ipsum-style placeholder).

Below that, a "Generate Board Memo" button (evergreen) that would compile this into an executive narrative.

---

**Navigation behavior.**

Clicking the top "CDIO Workbench" tab returns to Page 1 (Architecture Map). Clicking "IT Project Portfolio" goes to Page 3 (Kanban). Clicking any initiative card goes to Page 4 (detail). Clicking the "Graduating" lane's lone card goes to Page 5 (scorecard). Clicking "Matrix" toggle on Page 1 swaps to Page 2.

All clickable; no real backend; mock data static.

---

## After Lovable generates

Tell me:

1. What FEELS right (screenshot or describe)
2. What FEELS wrong (specific: "the Architecture Map looks too busy", "the wizard step 3 wording is generic", "the scorecard should be one page not two", etc.)
3. What's MISSING that you expected to see
4. What's THERE that you didn't expect

I take that feedback and either iterate the Lovable prompt, OR start building the in-repo `/mockup` pages directly based on what worked.

## Why we're doing this

The earlier-this-session failure mode was "build → find out the UX is wrong → re-do". This breaks that loop. The mockup is throwaway, but the feedback it generates is reusable. The in-repo `/mockup` route built next is what informs S4 (Workbench) and S5 (Portfolio) sprint scoping, with no surprises at implementation time.
