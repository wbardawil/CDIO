// MANDATORY confidentiality test (build-order step 1 finding).
//
// The cockpit holds real client data. The public anon key ships in
// the browser bundle; if it could read the cockpit tables, every
// client's material would be exposed. schema-v26 revokes anon and
// scopes RLS to service_role. This test proves the lockdown holds
// against the live database — the one failure that would otherwise
// be silent.
//
// Read-only: it asserts the anon key is DENIED and the service_role
// key is allowed. It never writes.
import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const TABLES = ["initiatives", "briefs", "documents", "constraints"] as const;

describe("confidentiality — cockpit tables are server-only", () => {
  it("has the Supabase env configured (the test is meaningless without it)", () => {
    expect(url, "NEXT_PUBLIC_SUPABASE_URL must be set").toBeTruthy();
    expect(anonKey, "NEXT_PUBLIC_SUPABASE_ANON_KEY must be set").toBeTruthy();
    expect(serviceKey, "SUPABASE_SERVICE_ROLE_KEY must be set").toBeTruthy();
  });

  for (const table of TABLES) {
    it(`the public anon key CANNOT read public.${table}`, async () => {
      const anon = createClient(url!, anonKey!);
      const { data, error } = await anon.from(table).select("*").limit(1);
      // anon has had ALL privileges revoked — a select must fail
      // with a permission error and return no rows.
      expect(error, `anon should be denied on ${table}`).toBeTruthy();
      expect(data ?? []).toHaveLength(0);
    });
  }

  it("the service_role key CAN reach the tables (positive control)", async () => {
    const service = createClient(url!, serviceKey!, {
      auth: { persistSession: false },
    });
    const { error } = await service.from("briefs").select("id").limit(1);
    expect(error, "service_role should be able to read briefs").toBeNull();
  });
});
