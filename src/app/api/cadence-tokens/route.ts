import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertCanApprove } from "@/lib/auth/role-gates";
import { createServiceClient } from "@/lib/db/supabase";
import { randomBytes } from "node:crypto";

const createSchema = z.object({
  org_id: z.string().uuid(),
  label: z.string().max(200).nullable().optional(),
  expires_in_days: z.number().int().min(1).max(365).default(180),
});

function makeToken(): string {
  // 32 bytes, base64url. Long enough that brute-force is
  // computationally pointless even without rate limiting.
  return randomBytes(32)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const input = parsed.data;

  // codex-audit-2026-05-21 finding #9 (review followup) — minting
  // a cadence token grants external (CEO/board) read access to the
  // engagement; strategic_approver only.
  const ownership = await assertCanApprove(input.org_id);
  if (!ownership.ok) return ownership.response;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + input.expires_in_days);

  const db = createServiceClient();
  const { data, error } = await db
    .from("cadence_tokens")
    .insert({
      org_id: input.org_id,
      practitioner_id: ownership.practitionerId,
      token: makeToken(),
      label: input.label ?? null,
      expires_at: expiresAt.toISOString(),
    })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Failed to create cadence token", details: error?.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ cadence_token: data }, { status: 201 });
}
