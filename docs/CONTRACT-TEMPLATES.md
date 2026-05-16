# AI-CDIO: Contract Templates

> **Status:** STUB — Phase 2 Day 29-31 deliverable. Templates are filled in by attorney review at Phase 2 Day 30. Until then, this doc reserves the structure and captures the founder's stated intent so the next session has context.

> **Created:** 2026-05-07 (Day 11)
> **Owner:** Phase 2 Day 30 attorney review (P1-12 in `docs/GAPS.md`)

## Why this doc exists

The platform's PM guardrail (locked in `docs/STRATEGY-2026.md` Pillar 1) requires the practitioner to either nominate or hire a Project Manager that the practitioner oversees — rather than the practitioner becoming the PM-for-hire. This is a contract concern, not a software feature. **The platform supports this by shipping contract template language** the practitioner can paste into their own engagement contracts.

Phase 2 Day 29-31 ships the Asset Library (one-pager, demo video, case study, LinkedIn templates). Contract template language ships alongside as part of that asset bundle.

## Four categories of clauses to draft

Each category lists the founder's stated intent. Attorney drafts the actual language at Phase 2 Day 30.

### 1. PM Covenant (locked intent 2026-05-07)

**Purpose:** prevent the practitioner from being pulled into project-manager-for-hire work that's outside their fractional CDIO retainer scope.

**Stated intent (paraphrased from founder discussion):**
> *"It must be a covenant on my contract that I have a PM too that I work with. I would have to oversee them too and we all have to be aligned."*

**Sample clauses to draft (placeholders):**
- "Client agrees to nominate a Project Manager (internal employee, contractor, or agency) for each Initiative scoped at $X+ or longer than Y weeks. Project Manager will work alongside Practitioner under Practitioner's strategic oversight."
- "Practitioner's role in any Initiative is strategic oversight, methodology direction, and decision facilitation — not day-to-day project management. Practitioner will not be substituted as Project Manager unless Client explicitly modifies this Agreement and adjusts retainer accordingly."
- "Project Manager (whether internal or external) will use the AI-CDIO platform to track Initiative status, milestones, and decisions. Practitioner has read access to Project Manager's tactical workspace (Jira / Asana / Monday) for engagement-related work."

### 2. Vendor and contractor platform-access clauses

**Purpose:** ensure vendors and contractors engaged through Initiatives use AI-CDIO's Initiative Pilot so the engagement record stays unified, and that data ownership is clear.

**Sample clauses to draft (placeholders):**
- "Vendors, contractors, and external implementers engaged through Initiatives will use the AI-CDIO platform for status reporting, milestone tracking, decision capture, and deliverable handoff. Magic-link access provided by Practitioner; no additional account creation required by Client or vendors/contractors."
- "Engagement records (initiative steps, decisions, status reports, charters) are jointly owned by Client and Practitioner. Either party may export full engagement record at any time."
- "Vendor / contractor pricing, performance ratings, and Practitioner's notes about vendors / contractors remain Practitioner's private records and are not shared with Client unless Practitioner explicitly chooses to."

### 3. The 90-Day Commitment Matrix (NEW 2026-05-07 evening — locked)

**Purpose:** turn the Differentiated Promise from `docs/STRATEGY-2026.md` into contractual deliverables the CEO can hold the practitioner to. This is the operational backbone of every fractional engagement contract — the founder's, and (Year 2+) every fractional customer's.

**Stated intent:**
> *"How would I be able to promise an outcome for my CEO and deliver it at a better quality? Better, cheaper, faster — those are the alternatives the CEO is choosing between."*

**Sample contract clause (placeholder for attorney review):**

> *"Practitioner commits to delivering the following milestones to Client during the first 90 days of engagement:*
>
> *Day 14 — Maturity assessment delivered, covering the agreed active modules. Baseline scores documented with framework citations.*
>
> *Day 21 — First 3-5 Decision Packages produced and reviewed with Client leadership. Misalignments between stakeholders surfaced and resolution paths proposed.*
>
> *Day 30 — AI Readiness assessment completed. AI Quick Win Roadmap delivered (90/180/360-day plan with named use cases, ROI estimates, and build-vs-buy recommendations).*
>
> *Day 45 — First Initiative launched, with vendor / contractor / internal team aligned. Initiative scope is determined by Client's highest-leverage outcome — could be cybersecurity hardening, AI implementation, data visualization or analytics, process automation, or any other outcome anchored to a recognized framework.*
>
> *Day 60 — Second Initiative launched. First Status Report delivered. Engagement Cadence (read-only client view) live for Client's executive team.*
>
> *Day 90 — First-quarter outcomes review: documented maturity score lift on 2-3 modules, ROI calculation with measurable evidence, and at least one initiative shipped to production.*
>
> *Failure to deliver any milestone by its target date triggers a written exception report from Practitioner to Client within 5 business days, with revised target date and root cause."*

**Notes for attorney:**
- These milestones are deliverables, not aspirations. The clause should make them enforceable but not crippling — reasonable miss-and-replan language with exception reports is the right balance.
- The Day 45 initiative is intentionally outcome-driven, not category-limited — the practitioner picks the highest-leverage move for THIS specific Client. Don't pin it to a fixed category in the contract; pin it to "highest-leverage outcome anchored to a recognized framework."
- The 90-Day Commitment is what differentiates the fractional CDIO using AI-CDIO from a traditional fractional CDIO who delivers vague advisory hours. Protect it as the contractual differentiator.

### 4. AI / data-handling clauses

**Purpose:** EU AI Act, GDPR, CCPA, and SOC2 compliance language for SMB clients in regulated industries.

**Stated intent:** AI-CDIO doesn't build the client's AI; it advises on decisions. The client retains all data, IP, and decision authority.

**Sample clauses to draft (placeholders):**
- "AI-CDIO platform analyzes Client data (assessment responses, engagement state, decisions log) to produce strategic recommendations. Client data is never used to train models, never shared with other practitioners, and never disclosed to third parties without Client's explicit written consent."
- "Practitioner's recommendations from AI-CDIO are advisory. Final decisions on technology investments, vendor selections, and strategic direction rest with Client. Practitioner shall not be liable for outcomes resulting from Client's decisions, except as set forth in standard professional services indemnification clauses."
- "EU AI Act / GDPR jurisdiction clause: Client acknowledges that AI-CDIO platform processes Client data on US-based infrastructure (Supabase, Vercel) with appropriate Data Processing Agreement in place. EU clients receive standard contractual clauses on request."

### 5. Pre-Purchase Technology Audit — advisory-not-liable clause (NEW 2026-05-13)

**Purpose:** the Pre-Purchase Technology Audit (named service line, see `docs/STRATEGY-2026.md`) produces a decisive verdict — BUY / DON'T BUY / RENEGOTIATE / HOLD — on a major technology purchase. The verdict is advisory. The accountable principal owns the decision. This clause protects the practitioner legally; the independence stance protects credibility. Same discipline as the Pillar 4 AI-claim boundary.

**Stated intent:**
> *The audit's loyalty is to the principal who is personally accountable if the purchase goes wrong — never the vendor, never the internal champion. The verdict is the practitioner's honest professional judgment on the evidence available. The decision, and accountability for it, remains the principal's.*

**Sample clauses to draft (placeholders for Phase 2 Day 30 attorney review):**
- "The Pre-Purchase Technology Audit delivers Practitioner's independent professional opinion (BUY / DON'T BUY / RENEGOTIATE / HOLD) based on information made available by Client during the engagement. The verdict is advisory. Final purchasing authority and accountability rest solely with Client."
- "Practitioner's verdict is rendered on the evidence Client provides. Where Client cannot provide an input the audit requires (strategy served, current operating model, vendor proposal), Practitioner may render a HOLD verdict and that limitation is itself a documented finding. Practitioner is not liable for outcomes arising from incomplete or inaccurate information supplied by Client or the vendor."
- "Practitioner receives no fee, referral, commission, or consideration of any kind from any vendor evaluated. The engagement is Client-paid only. Practitioner warrants this independence in writing in every audit deliverable (the Independence Statement)."
- "The audit is one decision per engagement. It does not include implementation design, contract negotiation, or organizational rollout. Those are separate engagements scoped separately."

**Notes for attorney:**
- The HOLD verdict + 'blank input is a finding' logic must be defensible: the practitioner is paid for judgment, including the judgment that the evidence is insufficient to proceed.
- The Independence Statement (no vendor fees, ever) is the credibility spine and should be contractually warranted, not just asserted in marketing.
- Mirror the Pillar 4 AI-claim-boundary language: advisory tool / professional opinion, not an outcome guarantee.

## Attorney brief (for Phase 2 Day 30 review)

**Targeting:** SMB engagement contracts (10-250 employee organizations). US-first; EU language as opt-in if Client is EU-based.

**Founder's note for the attorney:**
> *Templates are starting points, not finished contracts. Practitioners customize per engagement. The platform's role is to give them defensible boilerplate so they're not drafting from scratch.*

**Risk areas to scrutinize:**
- AI advice liability — explicit disclaimer that AI-CDIO is an advisory tool, not an implementation guarantee (mirrors `docs/STRATEGY-2026.md` Pillar 4 boundary on the AI claim)
- Data ownership — Client retains all of their own data; Practitioner retains all of their Network Catalog and methodology IP
- Vendor / contractor pricing confidentiality — practitioner-private notes never disclosed to Client by default
- Mutual termination clauses — if engagement ends, both parties can export engagement record
- IP retention — Practitioner's methodology, frameworks, and accumulated learnings stay with Practitioner across engagements

## Status

- [ ] Phase 2 Day 30: attorney review of starter language above
- [ ] Phase 2 Day 31: starter templates published in Asset Library
- [ ] Phase 4: revisit annually as legal landscape shifts (EU AI Act enforcement timeline, US state-level AI bills, GDPR updates)
