import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/db/supabase";

export async function verifyOrgAccess(
  orgId: string
): Promise<{ authorized: boolean; userId: string | null }> {
  const { userId } = await auth();
  if (!userId) return { authorized: false, userId: null };

  const db = createServiceClient();
  const { data: org } = await db
    .from("organizations")
    .select("id")
    .eq("id", orgId)
    .eq("clerk_org_id", userId)
    .single();

  return { authorized: !!org, userId };
}

export async function requireAuth(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new AuthError();
  return userId;
}

export class AuthError extends Error {
  constructor() {
    super("Unauthorized");
  }
}
