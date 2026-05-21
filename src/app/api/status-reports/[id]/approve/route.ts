import { NextRequest } from "next/server";
import { handleApprove } from "@/app/api/_lib/approval-actions";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handleApprove(req, "status_report", id);
}
