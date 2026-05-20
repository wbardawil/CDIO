// Wire the "show API error details to the user" pattern across all client
// components that hit our own API routes. Without this, the user sees
// "HTTP 400" or a generic error message while the actual cause (Supabase
// NOT NULL violation, RLS rejection, validation detail) is stranded in
// the API's response.details field. The initiative-form fix in commit
// 63e81c1 used this same pattern; this script extends it to the other 6
// callsites found in audit 2026-05-20.
//
// Idempotent — only replaces the unmodified original pattern. Re-running
// is a no-op.
//
// Run: node scripts/wire-error-details.js
const fs = require("fs");
const path = require("path");

const FILES = [
  "src/app/clients/[orgId]/initiatives/[id]/step-buttons.tsx",
  "src/app/clients/[orgId]/selections/new/form-client.tsx",
  "src/components/delete-sandbox-org-button.tsx",
  "src/components/reset-assessment-button.tsx",
  "src/components/resolve-decision-form.tsx",
  "src/components/stakeholder-row-actions.tsx",
];

// Match the exact old single-line throw — note that JS template-literal
// `${res.status}` is literal in the source.
const OLD_RE = /throw new Error\(body\?\.error \?\? `HTTP \$\{res\.status\}`\);/;

// Multi-line replacement. Preserves the calling line's indentation by
// capturing whitespace before the matched pattern.
const NEW_LINES = [
  "// Surface the API's `details` field so the user sees the real cause",
  "// (Supabase / validation message) instead of a friendly-but-useless",
  "// one-liner. Pattern shared with initiative form (commit 63e81c1).",
  '// eslint-disable-next-line no-console',
  'console.error("[api error]", { status: res.status, body });',
  "const detail = body?.details",
  '  ? typeof body.details === "string"',
  "    ? body.details",
  "    : JSON.stringify(body.details)",
  "  : null;",
  "throw new Error(",
  "  body?.error",
  "    ? detail",
  "      ? `${body.error}: ${detail}`",
  "      : body.error",
  "    : `HTTP ${res.status}`",
  ");",
].join("\n");

let touched = 0;
const skipped = [];
for (const rel of FILES) {
  const full = path.resolve(rel);
  if (!fs.existsSync(full)) {
    skipped.push({ file: rel, reason: "missing" });
    continue;
  }
  const src = fs.readFileSync(full, "utf-8");
  if (!OLD_RE.test(src)) {
    skipped.push({ file: rel, reason: "pattern not found (already wired?)" });
    continue;
  }
  // Indent the replacement by the leading whitespace of the matched line.
  const matched = src.match(/(^|\n)([ \t]*)throw new Error\(body\?\.error \?\? `HTTP \$\{res\.status\}`\);/);
  const indent = matched ? matched[2] : "        ";
  const indented = NEW_LINES.split("\n").map((l) => (l ? indent + l : "")).join("\n");
  const out = src.replace(OLD_RE, indented.trim().replace(new RegExp("^" + indent), ""));
  fs.writeFileSync(full, out);
  touched++;
}

console.log(`Wired error details in ${touched} files.`);
if (skipped.length) {
  console.log("Skipped:");
  for (const s of skipped) console.log(`  - ${s.file} (${s.reason})`);
}
