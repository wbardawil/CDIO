# Audit Validation Protocol

> ⛔ Confidentiality rule applies. Run this against real decisions, but
> record only scores and generic notes here — never client names, vendor
> names, figures, or quotes. The protocol is in git; the evidence is not.

## Why this exists

The Audit verdict gate (`AUDIT_GATE_OPEN`, premise 7) is default-closed
because extraction + grading quality is **unproven on real documents**.
This protocol is how that gets proven (or disproven). It is the kill-switch
evidence the strategy calls for: a measured pass, not vibes, not
whack-a-mole on whatever error you happen to notice.

It exists because first-contact dogfooding surfaced four distinct
trust gaps in a single sitting — Spanish register, unverified evidence,
missing stage awareness, unsourced money figures. Those are not bugs to
patch one by one; they are dimensions to **measure**.

## When to run it

- Before flipping `AUDIT_GATE_OPEN=true` on Production.
- Before any real client sees a verdict.
- Re-run after any change to the audit prompt, extraction, or model.
- Quarterly thereafter (re-assessment cadence).

## The sample

Pick **5 real decisions you already know the answer to** — past
purchases where you know how it actually played out (good buy, bad buy,
the thing that broke, what it really cost). Past decisions, not live
ones, so you have ground truth to score against. Spread the sample
across stages (at least one already-signed, one early-exploration) and
at least two in Spanish.

For each: run it through the audit exactly as a practitioner would
(upload the real evidence), then score the output below.

## The six dimensions (score each: PASS / CONCERN / FAIL)

1. **Verdict correctness.** Does the call match what you know actually
   happened? A confident wrong verdict is a FAIL, not a CONCERN.
2. **Evidence trust.** Did it rely on a load-bearing claim that was
   never verified (vendor-asserted number, omitted failed pilot) without
   flagging it as unverified? Silent reliance = FAIL. Flagged "verify
   before acting" = PASS even if unverifiable.
3. **Stage awareness.** Did it use the given stage, or (if blank) infer
   it and **state the assumption**? Wrong stage assumed silently = FAIL.
   Stated assumption, even if it had to guess = PASS.
4. **Money sourcing.** Is each figure traceable to the evidence, or is
   it an LLM estimate? Estimates presented as fact = CONCERN; estimates
   labelled as estimates = PASS; a number that is just wrong = FAIL.
5. **Method-Capture completeness (the MECE check).** Read the verbatim
   questions it asked. For THIS decision, name the one material question
   it did **not** ask. If that question would have changed the verdict =
   FAIL. If minor = CONCERN. If nothing material missing = PASS.
6. **Language register.** (Spanish samples) Euphonic conjunctions
   (`y→e`, `o→u`), correct word choice (no over-formal invented
   cognates), native professional tone. Any error a native speaker
   catches instantly = CONCERN (FAIL if it changes meaning).

## Scorecard (record per run — scores only, no client data)

| # | Stage | Lang | 1 Verdict | 2 Evidence | 3 Stage | 4 Money | 5 Method | 6 Lang | Net |
|---|-------|------|-----------|-----------|---------|---------|----------|--------|-----|
| 1 |       |      |           |           |         |         |          |        |     |
| 2 |       |      |           |           |         |         |          |        |     |
| 3 |       |      |           |           |         |         |          |        |     |
| 4 |       |      |           |           |         |         |          |        |     |
| 5 |       |      |           |           |         |         |          |        |     |

Append each run's date + commit SHA. Keep history; track the trend.

## The decision rule

- **Any dimension-1 (verdict) FAIL across the 5** → gate stays closed.
  Fix the root cause, re-run the full sample.
- **Zero verdict FAILs, but ≥2 CONCERNs on dimensions 2/4/5** → gate
  stays closed for autonomous use; verdicts may be shown **only** with
  the practitioner's explicit "verify before acting" framing on top.
- **All PASS, ≤1 isolated CONCERN** → eligible to open the gate for that
  client class. Log the decision and who signed it.

The practitioner sign-off is part of the rule, not a formality — the
tool is advisory by design (see the independence boundary in the audit
output). This protocol gates the *machine*; the human still signs.

## What this feeds

Results are kill-switch evidence for `docs/OUTCOMES.md`. A clean pass is
also the precondition for the deferred hardening work (the self-critique
pass, the Spanish proofreading pass, external deep-research verification)
— build those against the failure patterns this surfaces, not a hunch.
