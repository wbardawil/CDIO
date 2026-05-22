import { NextResponse } from "next/server";
import { guardInitiative } from "@/lib/cockpit/guard";
import { getLatestBrief } from "@/lib/cockpit/db";
import { briefToMarkdown } from "@/lib/cockpit/markdown";

type Ctx = { params: Promise<{ id: string }> };

function slug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "initiative"
  );
}

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const g = await guardInitiative(id);
  if (!g.ok) return g.response;

  const latest = await getLatestBrief(g.userId, id);
  if (!latest) {
    return NextResponse.json(
      { error: "No brief to export yet — run the brief first." },
      { status: 404 }
    );
  }

  const markdown = briefToMarkdown(latest.body, g.initiative, latest.version);
  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="cdio-brief-${slug(
        g.initiative.name
      )}-v${latest.version}.md"`,
    },
  });
}
