# AI-CDIO: Contract Templates (PM-Covenant Clause Library)

> **Status:** Stub. Phase 2 Days 29-31 deliverable. Locked Day 11 (2026-05-07) per `STRATEGY-2026.md` Law 6.
>
> **Disclaimer:** these are template clauses for practitioners to *paste into their own engagement contracts*, edited and reviewed by their own counsel. AI-CDIO is not a law firm. The full attorney review of AI-CDIO's own legal posture (`P1-12` in `GAPS.md`) does not extend to the practitioner's downstream contracts with their clients.

---

## Why This Doc Exists

The platform makes execution oversight light enough that the practitioner can fold it into a strategic engagement WITHOUT it becoming the engagement. To preserve that boundary, the practitioner's contract with the client should require the **client to nominate or hire a PM** (internal or external) the practitioner oversees. The platform supports the oversight; the practitioner does not become the PM.

This doc is the clause library. Phase 2 ships these in the Asset Library so practitioners can paste them into their own engagement contracts.

**Reference:** `STRATEGY-2026.md` Architectural Law 6 — "PM-covenant guardrail: contract language as a soft feature, not platform expansion."

---

## Status of Each Clause

| Clause | Status | Phase 2 ship target |
|---|---|---|
| 1 — Client PM Designation | TODO (drafting) | Day 29 |
| 2 — Practitioner Oversight Scope | TODO (drafting) | Day 29 |
| 3 — Vendor / Contractor Coordination | TODO (drafting) | Day 30 |
| 4 — Reporting Cadence | TODO (drafting) | Day 30 |
| 5 — Out-of-Scope Carve-Out | TODO (drafting) | Day 30 |
| 6 — Decision Authority | TODO (drafting) | Day 31 |
| 7 — Tooling & Data Ownership | TODO (drafting) | Day 31 |
| 8 — Termination & Successor Handoff | TODO (drafting) | Day 31 |

---

## Clause 1 — Client PM Designation (TODO)

**Intent:** Client must nominate (internal) or hire (external) a Project Manager who is the day-to-day execution owner. Practitioner provides oversight; practitioner does not act as PM.

**Draft (placeholder — not legal language yet):**

> "Within [N] business days of engagement start, Client shall designate a Project Manager (the *PM*) — either an internal employee or a third-party contracted by Client — to act as the day-to-day execution owner for initiatives within scope of this engagement. The Practitioner's role is strategic oversight and methodology coordination; the Practitioner shall not act as the PM and shall not be responsible for day-to-day task management, vendor coordination logistics, or status follow-up with individual contributors."

**Open questions for legal review:**
- Trigger language if Client fails to designate within the window
- Who absorbs cost of an external PM if no internal employee is designated
- Liability split if PM fails to execute and an initiative misses its commitment

---

## Clause 2 — Practitioner Oversight Scope (TODO)

**Intent:** Define what "oversight" means concretely so the engagement doesn't drift into PM-for-hire work.

**Draft (placeholder):**

> "The Practitioner's oversight includes: (a) approval of initiative charters; (b) review and editing of monthly status reports; (c) chairing decision-package meetings when stakeholder divergence requires resolution; (d) participation in monthly cadence reviews with the Client's executive sponsor; (e) framework-cited recommendations on tech selection, partner selection, and governance. Oversight does NOT include: chasing vendors for status updates, scheduling working sessions, drafting tickets, day-to-day project administration, or any task customarily performed by a Project Manager."

---

## Clause 3 — Vendor / Contractor Coordination (TODO)

**Intent:** When the Initiative Pilot generates multi-party initiatives with vendors / contractors, define who owns the coordination.

**Draft (placeholder):**

> "Where an initiative within scope involves third-party vendors or contractors, the Client's PM shall be the primary point of contact and coordination owner. The Practitioner may participate in vendor-selection conversations and approve vendor scopes against the Client's strategic objectives, but the PM is responsible for vendor onboarding, day-to-day check-ins, and escalation."

---

## Clause 4 — Reporting Cadence (TODO)

**Intent:** Codify the practitioner's deliverable cadence so the platform's Cadence + Status Report engines map to a contractual obligation rather than a courtesy.

**Draft (placeholder):**

> "The Practitioner shall produce, on a monthly basis, a Status Report covering active initiatives, decisions taken, risks flagged, and recommended next steps. The Practitioner shall produce, on a quarterly basis, a Quarterly Business Review (QBR) covering the maturity progression across in-scope competency modules and the recommended forward-quarter priorities. Both deliverables are produced via the AI-CDIO platform and edited by the Practitioner before delivery."

---

## Clause 5 — Out-of-Scope Carve-Out (TODO)

**Intent:** Make explicit what the engagement is NOT, especially around implementation services.

**Draft (placeholder):**

> "This engagement does NOT include: implementation services (system configuration, data migration, software development); break-fix support or operational management of existing systems; legal or compliance certification; vendor sales (the Practitioner will never receive commission from vendors recommended in scope of this engagement); software licensing administration. Each of the foregoing is the Client's responsibility, either internally or via separately contracted parties."

---

## Clause 6 — Decision Authority (TODO)

**Intent:** Tie the platform's Decision Package artifact to a contractual decision-making process.

**Draft (placeholder):**

> "Where the Practitioner produces a Decision Package surfacing stakeholder divergence on a strategic question, the designated Decision Owner (named per Decision Package) shall render a decision within [N] business days, or document a deferral with rationale. The Practitioner is not the Decision Owner; the Practitioner provides framework-cited analysis and a recommended path."

---

## Clause 7 — Tooling & Data Ownership (TODO)

**Intent:** Make explicit that the engagement record (Decision Packages, narratives, scores, Network Catalog suggestions sourced from outside the practitioner's catalog) belongs to the Client; the practitioner's general methodology and own Network Catalog do not transfer.

**Draft (placeholder):**

> "All client-specific outputs of this engagement — including but not limited to Decision Packages, Status Reports, Charters, Maturity Assessments, and engagement narratives — are the property of the Client and may be exported by the Client at any time. The Practitioner's general methodology, framework citations, and the Practitioner's own Network Catalog (the Practitioner's address book of vetted external partners) remain the property of the Practitioner and do not transfer with the engagement."

**Note:** This clause connects to Network Catalog privacy boundary in `STRATEGY-2026.md` Law 5 and `ARCHITECTURE.md` "Network Catalog: Privacy Model" section. The practitioner's own Network Catalog is the practitioner's moat; client engagement data is the client's.

---

## Clause 8 — Termination & Successor Handoff (TODO)

**Intent:** Make explicit that the engagement record is exportable on termination, supporting the "successor-ready" feeling from `STRATEGY-2026.md` Practitioner Feeling Map.

**Draft (placeholder):**

> "On termination of this engagement for any reason, the Practitioner shall deliver to the Client, within [N] business days, a complete export of the engagement record from the AI-CDIO platform: all Maturity Assessments, Decision Packages, Roadmaps, Status Reports, Cadence milestones, and decision logs. The Client may use this record at the Client's discretion, including providing it to a successor practitioner or internal team."

---

## Phase 2 Day 29-31 Build Notes

- All 8 clauses drafted to plain-English fill-in-the-blank versions.
- Each clause shipped as a Markdown snippet in the Asset Library with placeholder fields the practitioner customizes.
- Clauses surface in Asset Library tagged `contract-clause` for filtering.
- A "PM Covenant Bundle" template combines Clauses 1, 2, 3, 5, 6 as a single paste-in block for engagements where the practitioner wants the full guardrail.
- Disclaimer banner on every clause: *"Template language. Have your counsel review before using."*

## Out of Scope (deliberately)

- AI-CDIO will NOT generate finalized engagement contracts. The platform never replaces the practitioner's counsel.
- AI-CDIO will NOT auto-redline a client's contract. The platform never sits in the negotiation flow.
- AI-CDIO will NOT track contract execution status (signature flow, renewals). DocuSign / PandaDoc are tools the practitioner already has.
