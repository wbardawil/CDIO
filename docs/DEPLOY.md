# AI-CDIO — Vercel Deploy Guide

> **Created:** 2026-05-13 — to support faster iteration while Phase 1.5 (custom domain + verified email + attorney legal review) remains pending.
> **Status of this deploy:** Iteration deploy, NOT public launch. `public/robots.txt` blocks search engines. Per `docs/STRATEGY-2026.md` Architectural Law 8, the marketed public launch with custom domain + verified email + attorney-reviewed legal docs is Phase 1.5 Day 18-20.

---

## Why we're deploying now (not waiting for Phase 1.5)

Founder's working style: *"wants to see things working in browser, not just in commits."* Local dev (port 3010) requires the founder to spin up the server every time he wants to look at a feature — high friction. A `*.vercel.app` deploy means:

- Every push to `main` (or the feature branch) auto-deploys
- Founder can demo to himself across devices (phone, laptop, tablet) without local setup
- Once Vendor Lifecycle / pain-entry / verbal-scale ships, it's instantly visible
- Preview URLs on feature branches give shareable artifacts for client conversations

The "no public traffic before Phase 1.5" rule (Law 8) is about **marketed public launch**, not iteration. Iteration deploy = hosted dev, gated by Clerk on the workspace surfaces + `robots.txt` on the public ones. We are not marketing this URL.

---

## Pre-deploy checklist (one-time)

- [x] `package.json` has `"build": "next build"` and `"start": "next start"` ✅
- [x] Next.js project layout (App Router) is Vercel-compatible ✅
- [x] `.env.example` lists every required + optional env var (see file at repo root)
- [x] `public/robots.txt` disallows all crawlers (remove when Phase 1.5 lands)
- [x] `/terms`, `/privacy`, `/ai-disclaimer` pages exist (Termly-template-level — attorney review at Phase 2 Day 30)
- [x] Clerk auth wired (sign-in / sign-up / middleware)
- [ ] **Vercel account exists** — founder action
- [ ] **GitHub repo connected to Vercel project** — founder action (or use Vercel CLI)
- [ ] **Env vars set in Vercel project settings** — founder action, see env list below

---

## Founder-side steps (~10 minutes)

### 1. Create the Vercel project

**Option A — GitHub integration (recommended for the "automated workflows" preference):**

1. Go to https://vercel.com → "Add New Project"
2. Pick the GitHub repo `wbardawil/CDIO`
3. **Root directory:** leave as repo root (the Next.js app is at the repo root)
4. **Framework preset:** Vercel auto-detects Next.js
5. **Build command:** leave default (`next build`)
6. **Output directory:** leave default
7. Don't click Deploy yet — set env vars first (next step)

**Option B — Vercel CLI (faster if you already use it):**

```bash
cd C:\Users\Dell\projects\CDIO\app
npx vercel login
npx vercel
```

Follow the prompts. Same env-var setup applies.

### 2. Set environment variables

In Vercel Project Settings → **Environment Variables**, add each of the following. Copy values from your local `.env.local`:

**REQUIRED (must set before first deploy):**

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | From clerk.com dashboard |
| `CLERK_SECRET_KEY` | From clerk.com dashboard |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/` |
| `NEXT_PUBLIC_SUPABASE_URL` | From supabase.com dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From supabase.com dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only, never expose to browser |
| `SUPABASE_DB_HOST` | Transaction Pooler (IPv4 ON) — see `docs/LOCAL_DEV.md` |
| `SUPABASE_DB_PORT` | `6543` |
| `SUPABASE_DB_USER` | From supabase.com dashboard |
| `SUPABASE_DB_PASSWORD` | From supabase.com dashboard |
| `SUPABASE_DB_NAME` | `postgres` |
| `ANTHROPIC_API_KEY` | From console.anthropic.com |
| `RESEND_API_KEY` | From resend.com |

**OPTIONAL (no-op if absent):**

| Variable | Why defer |
|---|---|
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Rate limiting — add before any meaningful public traffic |
| `SENTRY_DSN` | Error monitoring — add when iteration produces noise worth capturing |
| `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY` | LLM observability — add when cost telemetry decisions need finer signal |

**Scope each variable** to all three environments (Production, Preview, Development) unless there's a reason to differ.

### 3. Pick a deployment branch

- **Recommended for iteration:** set Production Branch to `main`. Every push to `main` auto-deploys to `*.vercel.app`. Push to `claude/continue-ai-cdio-vBHyN` (or any feature branch) auto-deploys to a preview URL.
- **Alternative (if you want to test the current session's work first):** set Production Branch to `claude/continue-ai-cdio-vBHyN` temporarily. Switch to `main` once the outcome reframe + Vendor Lifecycle / pain-entry direction is decided and merged.

### 4. Deploy

Click "Deploy" in Vercel dashboard, or run `npx vercel --prod` from CLI. First deploy takes 2-4 minutes. Subsequent deploys ~1 minute.

### 5. Update Clerk allowed origins

Once Vercel gives you the URL (e.g. `cdio-xxx.vercel.app`):

1. Go to clerk.com → your app → Configure → Domains
2. Add the Vercel URL as an allowed domain
3. (Optional, when ready) add the custom domain when Phase 1.5 lands

### 6. Smoke test

Visit `https://<your-vercel-url>.vercel.app/scan` — Quick Scan should load (no auth required).
Sign in at `/sign-in` — should redirect through Clerk and return you to the workspace.
Open `/clients` — should show your client list.

---

## Iteration loop (after first deploy)

- Push to `claude/continue-ai-cdio-vBHyN` → preview URL auto-generates → review in browser
- Merge to `main` → production URL updates within a minute
- Founder shares the preview URL with himself across devices to validate UX
- Vercel deploy logs surface in dashboard; build failures (e.g., type errors) caught before they hit the URL

---

## When to remove `public/robots.txt` (Phase 1.5 gate)

`robots.txt` currently disallows all crawlers. Remove (or replace with a normal allow-policy) ONLY when ALL of the following hold per `docs/STRATEGY-2026.md` Law 8:

- [ ] Custom domain decision made + DNS configured
- [ ] Resend verified email domain (SPF / DKIM / DMARC records live)
- [ ] Attorney-reviewed Terms / Privacy / AI Disclaimer (Phase 2 Day 30 deliverable)
- [ ] Cost telemetry instrumented (`agent_logs` populating per-engagement costs)
- [ ] Founder explicitly committed to public launch posture

Until then, **the Vercel URL is internal iteration only**. Don't share it in marketing channels.

---

## Cost expectations

- **Vercel Hobby plan: $0/mo** — sufficient for iteration deploy. Limits: 100GB bandwidth/mo, 1000 deployments/day, no team collaboration.
- **Vercel Pro: $20/user/mo** — needed when marketing the URL publicly OR when team members beyond the founder need dashboard access. Phase 3 trigger.
- **Anthropic compute** — usage-based. Per-engagement cost lands in the `agent_logs` table (already shipped). Watch this when iterating on agents.

---

## Rollback

If a deploy breaks production:

- Vercel dashboard → Deployments → find last good deploy → "Promote to Production"
- Or revert the bad commit on `main` and push — auto-redeploys to the prior good state

No SSH access, no server config, no DNS panic.

---

## Future (Phase 1.5 Day 18-20)

When Phase 1.5 lands, this doc gets a second section covering:

- Custom domain DNS setup (CNAME → `cname.vercel-dns.com`)
- Resend verified email domain on the custom domain
- Removing / updating `robots.txt`
- Cookie consent banner if EU traffic anticipated
- Attorney-reviewed legal docs swapped in
- Cost telemetry surfacing dashboards (`/admin/metrics` per ROADMAP Phase 3 Day 59)

Not in scope today. Today is: deploy fast, iterate fast, keep the iteration URL private.

---

## GO-LIVE CHECKLIST — close the proof loop (R1, ~30 min, founder-side)

> Added 2026-05-13. This is the single consolidated pass that turns the
> branch's built capability into the platform's first logged outcome.
> Until this is done, nothing shipped this session can be dogfooded, so
> nothing produces Day-90 evidence. Per docs/STRATEGY-2026.md Day 90
> kill switch, logged CEO outcomes — not features — are the metric.
> Do these in order.

**Branch note:** all 2026-05-13 work is on `claude/continue-ai-cdio-vBHyN`,
not `main`. Decide your deploy target: either point the Vercel project
at this branch, or merge to `main` after step 4 verifies clean (R2).

### 1. Fix the Vercel 500 (env vars + redeploy)

The `cdio-rho.vercel.app` 500 is missing/misconfigured Clerk env vars,
not a code bug (app builds + runs locally).

- Vercel → Project → Settings → Environment Variables → add **all
  REQUIRED** vars from `.env.example` (repo root). Homepage specifically
  needs the 6 Clerk vars; deeper routes need Supabase + Anthropic.
- Scope each to **Production** (and Preview if you want branch URLs).
- ⚠️ **Redeploy.** Env-var changes do NOT apply to existing
  deployments — Vercel → Deployments → latest → ⋯ → Redeploy.
- Clerk dashboard → your app → Domains → add the Vercel URL as an
  allowed origin.
- Verify: load `/scan` (no auth), `/sign-in` (Clerk roundtrip).

### 2. Apply the two Audit migrations (in order)

From your local machine (DB creds live in your `.env.local`; never
paste into the Supabase dashboard per project rule):

```
node scripts/migrate.js   # ensure schema-v16-audits.sql is applied
node scripts/migrate.js   # then schema-v17-audit-companion.sql
```

(If `migrate.js` doesn't auto-pick new files, point it at
`src/lib/db/schema-v16-audits.sql` then `schema-v17-audit-companion.sql`.)
v17 is an additive idempotent ALTER — safe. Order matters: v16 creates
the table, v17 adds the `companion` column.

### 3. Smoke-test the Audit Engine

- Open a client → **Audits** → **+ New audit**.
- Title it after a real live decision (an ERP / CRM / contact-center
  call you are actually weighing).
- Fill what you have. Leave one required field blank deliberately to
  confirm the gap-as-finding behavior.
- **Generate companion** → confirm the lens-by-lens question sheet +
  "do not leave without asking" renders.
- **Run the audit** (~30-60s) → confirm verdict badge, headline money,
  board summary, 5 lens findings, Method Capture, and the advisory
  footer print correctly (Print / Save as PDF).

### 4. Log the first outcome

After running it on a real decision, write one entry in
`docs/OUTCOMES.md`: what the audit caught, the money quantified, the
verdict. **This single entry is the Day-90 kill-switch evidence.** It
matters more than any further feature.

### Done =

The 500 is gone, both migrations applied, one real audit run on a live
decision, one `OUTCOMES.md` entry written. At that point: merge the
branch to `main` (R2), update `CLAUDE.md` Current Sprint to reality
(R3), and the evidence-driven tightening batch begins (R6 + the 4
logged intake hardenings).
