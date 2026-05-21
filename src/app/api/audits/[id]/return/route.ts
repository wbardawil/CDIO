import { NextRequest } from "next/server";
import { handleReturn } from "@/app/api/_lib/approval-actions";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handleReturn(req, "audit", id);
}
