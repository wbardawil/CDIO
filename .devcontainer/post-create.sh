#!/bin/bash
# Post-create script for AI-CDIO dev container
# Runs once when the codespace is first created

set -e

echo "AI-CDIO Codespace Setup"
echo "======================="

# Install npm dependencies
echo ""
echo "[1/4] Installing npm dependencies..."
npm install

# Install Claude Code CLI globally
echo ""
echo "[2/4] Installing Claude Code CLI..."
npm install -g @anthropic-ai/claude-code 2>/dev/null || echo "  (skipping if not yet published as @anthropic-ai/claude-code — install manually if needed)"

# Install gstack (Garry Tan's Claude Code skills)
echo ""
echo "[3/4] Installing gstack..."
if [ ! -d "$HOME/.claude/skills/gstack" ]; then
  mkdir -p "$HOME/.claude/skills"
  git clone --single-branch --depth 1 https://github.com/wbardawil/gstack.git "$HOME/.claude/skills/gstack" || echo "  (gstack clone failed — install manually)"
  if [ -f "$HOME/.claude/skills/gstack/setup" ]; then
    cd "$HOME/.claude/skills/gstack" && ./setup --no-prefix && cd -
  fi
else
  echo "  (gstack already present, skipping)"
fi

# Install gsd-2 (spec-driven development)
echo ""
echo "[4/4] Installing gsd-2..."
npm install -g gsd-pi 2>/dev/null || echo "  (gsd-pi install failed — check the gsd-2 repo for current install method)"

# Reminder
echo ""
echo "Setup complete."
echo ""
echo "Next steps:"
echo "  1. Copy .env.local.example to .env.local and add your secrets"
echo "  2. Run 'npm run dev' to start the dev server on port 3010"
echo "  3. Open the forwarded port (3010) in your browser"
echo "  4. To use Claude Code: run 'claude' in any directory"
echo ""
echo "Read docs/SESSION_HANDOFF.md to know what to work on next."
