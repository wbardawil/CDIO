import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/agents/conversation";
import { createServiceClient } from "@/lib/db/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";

const ChatSchema = z.object({
  session_id: z.string().min(1).max(100),
  message: z.string().min(1).max(5000),
  pain_point: z.string().max(100).optional(),
  industry: z.string().max(50).optional(),
  employee_count: z.number().int().positive().max(1_000_000).optional(),
  history: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().max(10_000),
    })
  ).max(50).default([]),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { ok } = rateLimit(`chat:${ip}`);
  if (!ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const body = await request.json();
    const input = ChatSchema.parse(body);
    const db = createServiceClient();

    // Build message history
    const messages = [
      ...input.history,
      { role: "user" as const, content: input.message },
    ];

    // Call Conversation Agent
    const result = await chat(messages, {
      painPoint: input.pain_point,
      industry: input.industry,
      employeeCount: input.employee_count,
    });

    // Save conversation to Supabase
    const fullMessages = [
      ...input.history,
      { role: "user", content: input.message },
      { role: "assistant", content: result.reply },
    ];

    // Upsert conversation
    const { data: existing } = await db
      .from("conversations")
      .select("id, implicit_scores, modules_explored, pain_points")
      .eq("session_id", input.session_id)
      .single();

    // Merge implicit scores
    const existingScores = (existing?.implicit_scores ?? {}) as Record<string, any>;
    for (const score of result.implicitScores) {
      const key = String(score.module);
      if (!existingScores[key] || score.confidence > (existingScores[key].confidence ?? 0)) {
        existingScores[key] = score;
      }
    }

    // Track explored modules
    const modulesExplored = [
      ...new Set([
        ...(existing?.modules_explored ?? []),
        ...result.implicitScores.map((s) => s.module),
      ]),
    ];

    // Track pain points
    const painPoints = [
      ...new Set([
        ...(existing?.pain_points ?? []),
        ...(input.pain_point ? [input.pain_point] : []),
      ]),
    ];

    if (existing) {
      const { error: updateError } = await db
        .from("conversations")
        .update({
          messages: fullMessages,
          implicit_scores: existingScores,
          modules_explored: modulesExplored,
          pain_points: painPoints,
        })
        .eq("id", existing.id);
      if (updateError) console.error("Conversation update failed:", updateError.message);
    } else {
      const { error: insertError } = await db.from("conversations").insert({
        session_id: input.session_id,
        messages: fullMessages,
        implicit_scores: existingScores,
        modules_explored: modulesExplored,
        pain_points: painPoints,
      });
      if (insertError) console.error("Conversation insert failed:", insertError.message);
    }

    return NextResponse.json({
      reply: result.reply,
      implicit_scores: result.implicitScores,
      modules_explored: modulesExplored,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }
    console.error("Chat error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
