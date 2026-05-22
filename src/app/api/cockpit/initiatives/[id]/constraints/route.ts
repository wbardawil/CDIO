import { NextResponse } from "next/server";
import { z } from "zod";
import { guardInitiative } from "@/lib/cockpit/guard";
import { replaceConstraints } from "@/lib/cockpit/db";

const ConstraintsSchema = z.object({
  constraints: z
    .array(
      z.object({
        kind: z.enum([
          "budget",
          "deadline",
          "must_integrate",
          "cannot_touch",
          "other",
        ]),
        label: z.string().trim().min(1).max(200),
        value: z.string().trim().max(500).nullable().optional(),
      })
    )
    .max(30),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const g = await guardInitiative(id);
  if (!g.ok) return g.response;

  const parsed = ConstraintsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Each non-negotiable needs a kind and a label." },
      { status: 400 }
    );
  }

  const constraints = await replaceConstraints(
    g.userId,
    id,
    parsed.data.constraints.map((c) => ({
      kind: c.kind,
      label: c.label,
      value: c.value ?? null,
    }))
  );
  return NextResponse.json({ constraints });
}
