import { NextRequest } from "next/server";

const requests = new Map<string, number[]>();

const WINDOW_MS = 60_000;
const DEFAULT_MAX = 10;

export function rateLimit(
  key: string,
  max: number = DEFAULT_MAX
): { ok: boolean; remaining: number } {
  const now = Date.now();
  const timestamps = requests.get(key) ?? [];
  const recent = timestamps.filter((t) => now - t < WINDOW_MS);

  if (recent.length >= max) {
    requests.set(key, recent);
    return { ok: false, remaining: 0 };
  }

  recent.push(now);
  requests.set(key, recent);

  if (requests.size > 10_000) {
    const cutoff = now - WINDOW_MS;
    for (const [k, v] of requests) {
      if (v.every((t) => t < cutoff)) requests.delete(k);
    }
  }

  return { ok: true, remaining: max - recent.length };
}

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "anonymous"
  );
}
