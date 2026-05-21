import { NextRequest } from "next/server";
import { handleSubmit } from "@/app/api/_lib/approval-actions";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handleSubmit("selection", id);
}
