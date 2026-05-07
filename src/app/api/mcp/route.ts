import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/db/supabase";
import { dispatchMcp, type McpRpcCall } from "@/lib/mcp/registry";

// JSON-RPC 2.0 MCP endpoint.
//
// Auth: bearer token. The token authenticates the practitioner;
// every tool call filters to that practitioner's owned orgs.
//
// Usage from Claude.ai / Cursor / Codex / ChatGPT MCP config:
//   {
//     "mcpServers": {
//       "ai-cdio": {
//         "transport": "http",
//         "url": "https://<your-domain>/api/mcp",
//         "headers": { "Authorization": "Bearer <token>" }
//       }
//     }
//   }

async function authenticatePractitioner(
  authHeader: string | null
): Promise<{ practitionerId: string } | null> {
  if (!authHeader) return null;
  const m = authHeader.match(/^Bearer\s+(.+)$/);
  if (!m) return null;
  const token = m[1].trim();
  if (!token) return null;

  const db = createServiceClient();
  const { data } = await db
    .from("mcp_tokens")
    .select("id, practitioner_id, expires_at, revoked_at")
    .eq("token", token)
    .maybeSingle();
  if (!data) return null;
  if (data.revoked_at) return null;
  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
    return null;
  }

  // Best-effort touch.
  void db
    .from("mcp_tokens")
    .update({
      last_used_at: new Date().toISOString(),
      use_count: (data as { use_count?: number }).use_count ?? 0,
    })
    .eq("id", data.id)
    .then(() => undefined);

  return { practitionerId: data.practitioner_id };
}

export async function POST(request: NextRequest) {
  const authed = await authenticatePractitioner(
    request.headers.get("authorization")
  );
  if (!authed) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32001,
          message:
            "Unauthorized. Provide a Bearer MCP token issued from /settings/mcp.",
        },
      },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: "Parse error" },
      },
      { status: 400 }
    );
  }

  // Single call vs batch. Treat both the same way.
  const calls: McpRpcCall[] = Array.isArray(body)
    ? (body as McpRpcCall[])
    : [body as McpRpcCall];

  const responses = await Promise.all(
    calls.map((c) =>
      dispatchMcp(c, { practitionerId: authed.practitionerId })
    )
  );

  return NextResponse.json(
    Array.isArray(body) ? responses : responses[0]
  );
}
