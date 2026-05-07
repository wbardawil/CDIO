import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";

const createSchema = z.object({
  label: z.string().max(200).nullable().optional(),
  expires_in_days: z.number().int().min(1).max(365).default(180),
});

function makeToken(): string {
  return randomBytes(32)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export async function POST(request: NextRequest) {
  const practitioner = await ensurePractitioner();
  if (!practitioner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + input.expires_in_days);

  const db = createServiceClient();
  const { data, error } = await db
    .from("mcp_tokens")
    .insert({
      practitioner_id: practitioner.id,
      token: makeToken(),
      label: input.label ?? null,
      expires_at: expiresAt.toISOString(),
    })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Failed to issue token", details: error?.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ mcp_token: data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const practitioner = await ensurePractitioner();
  if (!practitioner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const db = createServiceClient();
  const { error } = await db
    .from("mcp_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .eq("practitioner_id", practitioner.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to revoke token", details: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ revoked: true });
}
