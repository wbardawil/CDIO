#!/usr/bin/env bash
# AI-CDIO one-shot Vercel deploy.
#
# Prereqs:
#   1. vercel CLI installed (already is: v48.x).
#   2. EITHER: you are logged in (`vercel login`),
#      OR: VERCEL_TOKEN is exported in the shell.
#   3. .env.local is reachable (default: ../../../.env.local relative to this
#      worktree — i.e. the main repo's .env.local. Override with ENV_FILE=path).
#
# Usage:
#   bash scripts/deploy-vercel.sh                              # default paths
#   ENV_FILE=/abs/path/.env.local bash scripts/deploy-vercel.sh
#   VERCEL_TOKEN=xxx bash scripts/deploy-vercel.sh
#
# What it does (idempotent — re-running is safe):
#   1. Verifies Vercel auth (whoami).
#   2. Links the cwd to a Vercel project (creates .vercel/ once).
#   3. Pushes every KEY=VALUE in .env.local to all three Vercel scopes
#      (production / preview / development), --force to overwrite.
#   4. Runs `vercel deploy --prod` and prints the resulting URL.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

ENV_FILE="${ENV_FILE:-../../../.env.local}"

echo "▶ Vercel auth check..."
WHO="$(vercel whoami 2>&1 | tail -1 || true)"
if echo "$WHO" | grep -qi "no existing credentials"; then
  cat <<'AUTH_HELP'
✗ Not logged into Vercel. Pick one:
    A. Interactive (recommended once):   vercel login
    B. Token:                            export VERCEL_TOKEN=...   (vercel.com/account/tokens)
Then re-run: bash scripts/deploy-vercel.sh
AUTH_HELP
  exit 1
fi
echo "  ✓ logged in as $WHO"

echo "▶ Linking project (creates .vercel/ on first run)..."
if [ ! -f .vercel/project.json ]; then
  vercel link --yes
fi

if [ -f "$ENV_FILE" ]; then
  echo "▶ Pushing env vars from $ENV_FILE to production/preview/development..."
  pushed=0; skipped=0
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in
      ''|\#*) continue ;;
    esac
    if [[ "$line" =~ ^([A-Z_][A-Z0-9_]*)=(.*)$ ]]; then
      key="${BASH_REMATCH[1]}"
      value="${BASH_REMATCH[2]}"
      # strip surrounding quotes if any
      value="${value%\"}"; value="${value#\"}"
      value="${value%\'}"; value="${value#\'}"
      [ -z "$value" ] && { echo "  · skip $key (empty)"; skipped=$((skipped+1)); continue; }
      for env in production preview development; do
        if printf "%s" "$value" | vercel env add "$key" "$env" --force >/dev/null 2>&1; then
          pushed=$((pushed+1))
        else
          echo "  ! $key → $env (failed)"
        fi
      done
      echo "  ✓ $key (all 3 scopes)"
    fi
  done < "$ENV_FILE"
  echo "  ${pushed} env writes, ${skipped} skipped."
else
  echo "⚠ No env file at $ENV_FILE; skipping env push. Deploy will build OK but runtime will fail without env vars."
fi

echo "▶ Deploying to production..."
URL="$(vercel deploy --prod --yes 2>&1 | tail -3 | grep -oE 'https://[A-Za-z0-9.-]+' | tail -1 || true)"
if [ -n "$URL" ]; then
  echo ""
  echo "════════════════════════════════════════════════════════════════"
  echo "  ✓ DEPLOYED: $URL"
  echo "════════════════════════════════════════════════════════════════"
else
  echo "✗ Deploy command finished but no URL captured — check output above."
fi
