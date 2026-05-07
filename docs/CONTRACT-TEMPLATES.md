# AI-CDIO: Contract Templates

> **Status:** STUB — Phase 2 Day 29-31 deliverable. Templates are filled in by attorney review at Phase 2 Day 30. Until then, this doc reserves the structure and captures the founder's stated intent so the next session has context.

> **Created:** 2026-05-07 (Day 11)
> **Owner:** Phase 2 Day 30 attorney review (P1-12 in `docs/GAPS.md`)

## Why this doc exists

The platform's PM guardrail (locked in `docs/STRATEGY-2026.md` Pillar 1) requires the practitioner to either nominate or hire a Project Manager that the practitioner oversees — rather than the practitioner becoming the PM-for-hire. This is a contract concern, not a software feature. **The platform supports this by shipping contract template language** the practitioner can paste into their own engagement contracts.

Phase 2 Day 29-31 ships the Asset Library (one-pager, demo video, case study, LinkedIn templates). Contract template language ships alongside as part of that asset bundle.

## Three categories of clauses to draft

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

### 3. AI / data-handling clauses

**Purpose:** EU AI Act, GDPR, CCPA, and SOC2 compliance language for SMB clients in regulated industries.

**Stated intent:** AI-CDIO doesn't build the client's AI; it advises on decisions. The client retains all data, IP, and decision authority.

**Sample clauses to draft (placeholders):**
- "AI-CDIO platform analyzes Client data (assessment responses, engagement state, decisions log) to produce strategic recommendations. Client data is never used to train models, never shared with other practitioners, and never disclosed to third parties without Client's explicit written consent."
- "Practitioner's recommendations from AI-CDIO are advisory. Final decisions on technology investments, vendor selections, and strategic direction rest with Client. Practitioner shall not be liable for outcomes resulting from Client's decisions, except as set forth in standard professional services indemnification clauses."
- "EU AI Act / GDPR jurisdiction clause: Client acknowledges that AI-CDIO platform processes Client data on US-based infrastructure (Supabase, Vercel) with appropriate Data Processing Agreement in place. EU clients receive standard contractual clauses on request."

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
