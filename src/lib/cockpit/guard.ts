// ============================================================
// CDIO Review Cockpit — route guards
//
// Every cockpit API route is auth-gated AND ownership-checked.
// proxy.ts is the first gate; these run server-side as the
// second. guardInitiative also confirms the caller owns the
// initiative — without it, a signed-in user could act on
// someone else's initiative by guessing an id.
// ============================================================

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getInitiative } from "./db";
import type { Initiative } from "@/types/cockpit";

const unauthorized = () =>
  NextResponse.json({ error: "Sign in to continue." }, { status: 401 });

export type UserGuard =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse };

export async function guardUser(): Promise<UserGuard> {
  const { userId } = await auth();
  if (!userId) return { ok: false, response: unauthorized() };
  return { ok: true, userId };
}

export type InitiativeGuard =
  | { ok: true; userId: string; initiative: Initiative }
  | { ok: false; response: NextResponse };

export async function guardInitiative(
  initiativeId: string
): Promise<InitiativeGuard> {
  const { userId } = await auth();
  if (!userId) return { ok: false, response: unauthorized() };
  const initiative = await getInitiative(userId, initiativeId);
  if (!initiative) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Initiative not found." },
        { status: 404 }
      ),
    };
  }
  return { ok: true, userId, initiative };
}
