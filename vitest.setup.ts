import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import "@testing-library/jest-dom/vitest";

// Load .env.local so integration tests (e.g. the confidentiality
// check) can reach Supabase. Vitest does not read it automatically.
const envPath = join(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
