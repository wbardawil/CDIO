// ============================================================
// AI-CDIO — Cost Telemetry (Phase 1.5 Day 19, P1-21)
//
// Wrap every Anthropic call so we know the cost per call, per
// engagement, per agent, per model. Required for evidence-based
// pricing at Phase 2 Day 35-38 and the Day-90 metrics dashboard
// at Phase 3.
//
// The shape of the public API is small:
//
//   const log = await logAnthropicCall({
//     orgId, practitionerId, agentName,
//     call: () => anthropic.messages.create({ ... }),
//   });
//
// `call` is the actual SDK call. We measure latency around it,
// extract usage + model from the response, compute USD cost,
// and write a row to agent_logs. Failures still log (status =
// "error") so we can see error rates per agent.
//
// Pricing table is hardcoded; published Anthropic prices as of
// 2026-05. Update when prices change. Rates in USD per million
// tokens.
// ============================================================

import { createServiceClient } from "@/lib/db/supabase";

// USD per million tokens. Anthropic published prices, May 2026.
// Cache create rate = 1.25× input. Cache read rate = 0.10× input.
// Update whenever Anthropic changes pricing.
const MODEL_PRICES: Record<
  string,
  { input: number; output: number; cacheCreate: number; cacheRead: number }
> = {
  // Sonnet 4 family
  "claude-sonnet-4-20250514": {
    input: 3.0,
    output: 15.0,
    cacheCreate: 3.75,
    cacheRead: 0.3,
  },
  "claude-sonnet-4-6": {
    input: 3.0,
    output: 15.0,
    cacheCreate: 3.75,
    cacheRead: 0.3,
  },
  // Haiku 4.5
  "claude-haiku-4-5-20251001": {
    input: 1.0,
    output: 5.0,
    cacheCreate: 1.25,
    cacheRead: 0.1,
  },
  // Opus 4.7
  "claude-opus-4-7": {
    input: 15.0,
    output: 75.0,
    cacheCreate: 18.75,
    cacheRead: 1.5,
  },
};

interface UsageBreakdownLike {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
}

interface LogContext {
  orgId?: string | null;
  practitionerId?: string | null;
  agentName: string;
  metadata?: Record<string, unknown>;
}

export interface LogAnthropicArgs<T> extends LogContext {
  call: () => PromiseLike<T>;
}

/**
 * Wrap an Anthropic SDK call so its cost, tokens, latency, and
 * status are recorded in agent_logs. Returns the original response
 * unchanged so callers don't need to touch their existing code path
 * beyond this wrapper.
 *
 * Generic `T` is unconstrained so the SDK's specific Message type
 * (which carries content / id / etc.) survives the call. The wrapper
 * extracts model + usage via best-effort property access and writes
 * the telemetry row.
 *
 * Errors thrown by the underlying call are re-thrown after the row
 * is written. If the agent_logs write itself fails, it is silenced
 * (telemetry should never be load-bearing on user-facing requests).
 */
export async function logAnthropicCall<T>(
  args: LogAnthropicArgs<T>
): Promise<T> {
  const start = Date.now();
  let response: T | null = null;
  let errorCode: string | null = null;
  let status: "ok" | "error" | "rate_limited" | "timeout" = "ok";
  let thrown: unknown = null;

  try {
    response = await args.call();
  } catch (err) {
    thrown = err;
    status = "error";
    if (err instanceof Error) {
      const msg = err.message.toLowerCase();
      if (msg.includes("rate") && msg.includes("limit")) status = "rate_limited";
      else if (msg.includes("timeout")) status = "timeout";
      errorCode = err.message.slice(0, 200);
    } else {
      errorCode = String(err).slice(0, 200);
    }
  }

  const latencyMs = Date.now() - start;
  const r = (response ?? null) as { model?: string; usage?: UsageBreakdownLike } | null;
  const usage = r?.usage;
  const model = r?.model ?? null;

  const inputTokens = usage?.input_tokens ?? 0;
  const outputTokens = usage?.output_tokens ?? 0;
  const cacheCreateTokens = usage?.cache_creation_input_tokens ?? 0;
  const cacheReadTokens = usage?.cache_read_input_tokens ?? 0;

  const costCents = model ? computeCostCents(model, {
    inputTokens,
    outputTokens,
    cacheCreateTokens,
    cacheReadTokens,
  }) : null;

  // Fire-and-forget. Cost telemetry must never block the response.
  void writeRow({
    org_id: args.orgId ?? null,
    practitioner_id: args.practitionerId ?? null,
    agent_name: args.agentName,
    model: model ?? "unknown",
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cache_create_tokens: cacheCreateTokens,
    cache_read_tokens: cacheReadTokens,
    cost_cents: costCents,
    latency_ms: latencyMs,
    status,
    error_code: errorCode,
    metadata: args.metadata ?? {},
  });

  if (thrown !== null) throw thrown;
  return response as T;
}

interface CostInputs {
  inputTokens: number;
  outputTokens: number;
  cacheCreateTokens: number;
  cacheReadTokens: number;
}

/**
 * Compute USD cost in cents for a single LLM call. Returns null if
 * the model has no published price in MODEL_PRICES — the caller
 * stores null rather than guessing.
 */
export function computeCostCents(model: string, t: CostInputs): number | null {
  const price = MODEL_PRICES[model];
  if (!price) return null;
  // USD per million → USD per token, then × 100 to get cents.
  const usd =
    (t.inputTokens * price.input +
      t.outputTokens * price.output +
      t.cacheCreateTokens * price.cacheCreate +
      t.cacheReadTokens * price.cacheRead) /
    1_000_000;
  return Math.round(usd * 100);
}

interface AgentLogRow {
  org_id: string | null;
  practitioner_id: string | null;
  agent_name: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_create_tokens: number;
  cache_read_tokens: number;
  cost_cents: number | null;
  latency_ms: number;
  status: string;
  error_code: string | null;
  metadata: Record<string, unknown>;
}

async function writeRow(row: AgentLogRow): Promise<void> {
  try {
    const db = createServiceClient();
    await db.from("agent_logs").insert(row);
  } catch {
    // Telemetry must never throw into the user-facing request path.
  }
}
