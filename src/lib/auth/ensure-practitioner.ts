import { auth, currentUser } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/db/supabase";

export interface Practitioner {
  id: string;
  clerk_user_id: string;
  name: string | null;
  email: string | null;
  plan: "starter" | "growth" | "scale";
}

/**
 * Lazy-creates the practitioners row for the currently authenticated Clerk user
 * on first call. Idempotent — subsequent calls return the existing row.
 *
 * Returns null if no Clerk user is signed in.
 */
export async function ensurePractitioner(): Promise<Practitioner | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const db = createServiceClient();

  const { data: existing } = await db
    .from("practitioners")
    .select("id, clerk_user_id, name, email, plan")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (existing) return existing as Practitioner;

  const user = await currentUser();
  const { data, error } = await db
    .from("practitioners")
    .insert({
      clerk_user_id: userId,
      name: user?.fullName ?? null,
      email: user?.primaryEmailAddress?.emailAddress ?? null,
    })
    .select("id, clerk_user_id, name, email, plan")
    .single();

  if (error) {
    // 23505 = unique_violation. Another concurrent request raced us
    // (rare; only happens for two requests on the same brand-new user
    // arriving in the same millisecond). Re-read the row they inserted.
    if ((error as { code?: string }).code === "23505") {
      const { data: retry } = await db
        .from("practitioners")
        .select("id, clerk_user_id, name, email, plan")
        .eq("clerk_user_id", userId)
        .single();
      if (retry) return retry as Practitioner;
    }
    throw error;
  }
  return data as Practitioner;
}
