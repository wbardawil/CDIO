# Local Development

How to run AI-CDIO on your laptop without the dev server hanging or compile times exploding.

## TL;DR

```bash
cd C:/Users/Dell/projects/CDIO/app
npm install                    # only on a fresh clone or after pulling new deps
npm run dev:warm               # ~30 sec; pre-builds then starts dev server on :3010
```

Open http://localhost:3010 in Chrome or Edge. Done.

If you've already run `npm run dev:warm` once today and the `.next/` cache exists, you can use the faster:

```bash
npm run dev                    # starts on :3010, uses warm cache
```

## What yesterday's "crash" actually was

The dev server hung at `Compiling / ...` for several minutes, you assumed it was crashed and restarted. The actual cause was a stray `package-lock.json` in the parent `C:\Users\Dell\projects\CDIO\` directory which made Next 16's Turbopack pick the wrong workspace root and try to resolve modules from a directory with no `node_modules`.

That orphan file has been **deleted** in commit history; the project's `next.config.ts` also pins `turbopack.root` as a defense-in-depth measure. You shouldn't see this hang again.

## Run requirements

| | Required | What you have | OK? |
|---|---|---|---|
| Node.js | ≥ 20.0.0 | 22.22.2 | ✅ |
| npm | ≥ 10.0.0 | 11.6.4 | ✅ |
| Free RAM | ≥ 4 GB | ~13 GB | ✅ |
| Free disk on C: | ≥ 2 GB | 78 GB | ✅ |
| Browser for testing | Chrome/Edge | — | manual |

The Node 20+ requirement is enforced via `package.json` `engines`. `npm install` will warn if you're on an older Node.

## The two `dev` scripts

| Command | What it does | Use when |
|---|---|---|
| `npm run dev` | Starts Turbopack dev server on port 3010 | Daily run after the cache is warm |
| `npm run dev:warm` | Runs `next build` first (warms cache), then starts dev | First run of the day, after pulling, after deleting `.next/` |

`dev:warm` takes about 30-60 sec to start because it builds first. `dev` after that is ~5 sec.

## If the dev server hangs

1. **`Ctrl+C` to stop the process.** Don't restart your laptop.
2. Check terminal output. The hang is almost always at `Compiling / ...` or `Compiling proxy ...`.
3. Delete the cache and warm-rebuild:
   ```bash
   rm -rf .next          # in Git Bash; or `Remove-Item -Recurse -Force .next` in PowerShell
   npm run dev:warm
   ```
4. If it still hangs after `dev:warm`, capture the terminal output and paste in chat — that tells me what failed.

## Environment variables (`.env.local`)

This file is `.gitignore`d, never committed. It needs:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://jowfdcontbpetgldrzix.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Direct DB connection (for migrations via scripts/migrate.js).
# Use the Transaction Pooler with IPv4 ON.
SUPABASE_DB_HOST=aws-1-us-east-1.pooler.supabase.com
SUPABASE_DB_PORT=6543
SUPABASE_DB_USER=postgres.jowfdcontbpetgldrzix
SUPABASE_DB_PASSWORD=...
SUPABASE_DB_NAME=postgres

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

The Supabase pooler must use **IPv4** (toggle in dashboard) — your network is IPv4-only and the IPv6 pooler won't resolve.

## Useful scripts (already in `scripts/`)

| Command | What it does |
|---|---|
| `node scripts/inspect-db.js` | Read-only audit of which tables exist and how many rows each has |
| `node scripts/migrate.js [path-to-sql]` | Apply a SQL migration to the DB; default path is `src/lib/db/schema-v4-practitioners.sql` |
| `node scripts/ingest-playbook.js` | Re-ingest the cleaned playbook into the `playbook_chunks` RAG table |
| `node scripts/verify-cmu-purge.js` | Confirm zero CMU/Carnegie Mellon mentions remain in the DB |
| `node scripts/check-db-url.js` | Diagnose a malformed `DATABASE_URL` without leaking the password |

## What to test in the browser after `npm run dev:warm`

1. Open http://localhost:3010 — landing page renders, "Sign in" / "Sign up" in top-right
2. Click **Sign in** → enter your Clerk credentials
3. After sign-in you land back on `/` with "Open Portfolio →" button visible
4. Click **Open Portfolio →** → `/clients` page (will be empty until you onboard a client)
5. Click **+ New client** → onboard a test org (the existing `/onboarding` flow)
6. After creating, you should see it in the Portfolio table
7. Click the client name → `/clients/[orgId]` workspace shell with 6 tabs (Overview active)
8. Click **Open full dashboard →** → existing `/dashboard?org=...` (assessment/synthesis/roadmap engines)

If any of those steps fail, paste the URL + error message in chat.

## Common gotchas

- **Port 3010 already in use:** another instance is running. Find it: `Get-NetTCPConnection -LocalPort 3010` (PowerShell) and stop the process.
- **Clerk widget shows "Application not found":** the `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env.local` doesn't match your Clerk project. Re-grab from Clerk dashboard.
- **Database error on first sign-in:** the `practitioners` table doesn't exist. Run `node scripts/migrate.js`.
- **Empty portfolio when you expect data:** the existing test-data org has no `practitioner_clients` mapping (a Day 7 backfill task). Onboard a fresh client to see the table populate.
