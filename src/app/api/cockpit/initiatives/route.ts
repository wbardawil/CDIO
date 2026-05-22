import { NextResponse } from "next/server";
import { z } from "zod";
import { guardUser } from "@/lib/cockpit/guard";
import { createInitiative, listInitiatives } from "@/lib/cockpit/db";

const CreateSchema = z.object({
  name: z.string().trim().min(1, "Give the initiative a name.").max(200),
  initiativeType: z
    .enum(["crm", "erp", "data", "security", "infra", "other"])
    .nullable()
    .optional(),
});

export async function GET() {
  const g = await guardUser();
  if (!g.ok) return g.response;
  const initiatives = await listInitiatives(g.userId);
  return NextResponse.json({ initiatives });
}

export async function POST(req: Request) {
  const g = await guardUser();
  if (!g.ok) return g.response;

  const parsed = CreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }

  const initiative = await createInitiative(g.userId, {
    name: parsed.data.name,
    initiativeType: parsed.data.initiativeType ?? null,
  });
  return NextResponse.json({ initiative }, { status: 201 });
}
