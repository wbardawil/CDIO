import { NextResponse } from "next/server";
import { z } from "zod";
import { guardInitiative } from "@/lib/cockpit/guard";
import { setInitiativeStage } from "@/lib/cockpit/db";

const StageSchema = z.object({
  stage: z.enum(["frame", "discover", "decide", "source", "plan"]),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const g = await guardInitiative(id);
  if (!g.ok) return g.response;

  const parsed = StageSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Unknown stage." }, { status: 400 });
  }

  await setInitiativeStage(g.userId, id, parsed.data.stage);
  return NextResponse.json({ ok: true });
}
