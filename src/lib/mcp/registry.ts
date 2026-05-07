// ============================================================
// AI-CDIO — MCP Tool Registry (Phase 1D Day 28)
//
// JSON-RPC 2.0 MCP server foundation. Three starter tools that
// surface AI-CDIO state from inside Claude.ai / Cursor / Codex /
// ChatGPT - the AI surfaces the practitioner already trusts.
//
// Per Architectural Law 7 - MCP-first as a distribution channel,
// not a headline. The practitioner doesn't tell their CEO "use
// our MCP integration"; they sit inside Claude.ai with their
// engagement state already at hand.
//
// Phase 2.5 Day 47-48 plugs in 5 AI-specific tools against this
// same registry. The registry pattern lets new tools land
// without touching the dispatch / auth / response shape.
// ============================================================

import { createServiceClient } from "@/lib/db/supabase";
import { MODULE_NAMES, MODULE_META } from "@/types";
import type { Initiative } from "@/types/initiative";
import type { Selection } from "@/types/selection";
import type { StatusReport } from "@/types/cadence";

export interface McpToolContext {
  practitionerId: string;
}

interface McpTool<TArgs = unknown, TResult = unknown> {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  handler: (args: TArgs, ctx: McpToolContext) => Promise<TResult>;
}

// --- Helpers ---

async function listOwnedOrgs(practitionerId: string): Promise<
  Array<{ id: string; name: string; industry: string; size_category: string }>
> {
  const db = createServiceClient();
  const { data } = await db
    .from("practitioner_clients")
    .select("organizations:org_id(id, name, industry, size_category)")
    .eq("practitioner_id", practitionerId);
  if (!data) return [];
  // PostgREST returns the join nested.
  type Row = {
    organizations:
      | { id: string; name: string; industry: string; size_category: string }
      | null;
  };
  const rows = data as unknown as Row[];
  return rows
    .map((r) => r.organizations)
    .filter(
      (o): o is {
        id: string;
        name: string;
        industry: string;
        size_category: string;
      } => o !== null
    );
}

async function ownsOrg(
  practitionerId: string,
  orgId: string
): Promise<boolean> {
  const db = createServiceClient();
  const { data } = await db
    .from("practitioner_clients")
    .select("org_id")
    .eq("practitioner_id", practitionerId)
    .eq("org_id", orgId)
    .maybeSingle();
  return !!data;
}

// --- Tools ---

const listClientsTool: McpTool<
  Record<string, never>,
  {
    clients: Array<{
      id: string;
      name: string;
      industry: string;
      size_category: string;
    }>;
  }
> = {
  name: "list_clients",
  description:
    "List all client organizations this practitioner is engaged with. Returns id, name, industry, size_category for each.",
  inputSchema: { type: "object", properties: {} },
  handler: async (_args, ctx) => {
    const clients = await listOwnedOrgs(ctx.practitionerId);
    return { clients };
  },
};

const getClientSnapshotTool: McpTool<
  { org_id: string },
  {
    org_name: string;
    industry: string;
    size_category: string;
    active_modules: number[];
    initiative_summary: { active: number; blocked: number; done: number; total: number };
    decision_summary: { open: number; recommended: number; decided: number; total: number };
    latest_status_report: {
      title: string;
      headline: string;
      published_at: string | null;
    } | null;
  }
> = {
  name: "get_client_snapshot",
  description:
    "Get a one-shot snapshot of a single client: org name, industry, size, active modules, initiative + decision counts, and the latest published Status Report headline. Use this to ground any further conversation about the engagement.",
  inputSchema: {
    type: "object",
    properties: {
      org_id: {
        type: "string",
        description: "The UUID of the client organization (from list_clients).",
      },
    },
    required: ["org_id"],
  },
  handler: async (args, ctx) => {
    if (!(await ownsOrg(ctx.practitionerId, args.org_id))) {
      throw new Error("Forbidden: practitioner does not own this org");
    }
    const db = createServiceClient();
    const [{ data: org }, { data: inits }, { data: sels }, { data: report }] =
      await Promise.all([
        db
          .from("organizations")
          .select("name, industry, size_category, active_modules")
          .eq("id", args.org_id)
          .single(),
        db
          .from("initiatives")
          .select("status")
          .eq("org_id", args.org_id),
        db
          .from("selections")
          .select("status")
          .eq("org_id", args.org_id),
        db
          .from("status_reports")
          .select("title, headline, published_at")
          .eq("org_id", args.org_id)
          .eq("status", "published")
          .order("period_end", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

    const initRows = (inits ?? []) as Pick<Initiative, "status">[];
    const selRows = (sels ?? []) as Pick<Selection, "status">[];
    const repRow = report as
      | { title: string; headline: string; published_at: string | null }
      | null;

    return {
      org_name: org?.name ?? "Unknown",
      industry: org?.industry ?? "unknown",
      size_category: org?.size_category ?? "unknown",
      active_modules: org?.active_modules ?? [],
      initiative_summary: {
        active: initRows.filter((i) => i.status === "active").length,
        blocked: initRows.filter((i) => i.status === "blocked").length,
        done: initRows.filter((i) => i.status === "done").length,
        total: initRows.length,
      },
      decision_summary: {
        open: selRows.filter((s) => s.status === "open").length,
        recommended: selRows.filter((s) => s.status === "recommended").length,
        decided: selRows.filter((s) => s.status === "decided").length,
        total: selRows.length,
      },
      latest_status_report: repRow,
    };
  },
};

const lookupModuleFrameworkTool: McpTool<
  { module_number: number },
  {
    module_number: number;
    name: string;
    one_liner: string;
    framework: string;
  }
> = {
  name: "lookup_module_framework",
  description:
    "Look up the AI-CDIO module by number (1-16) and return its name, plain-English one-liner, and anchor framework (e.g. 'NIST CSF v2.0 + CMMI' for module 5). Useful for grounding conversations with the right framework citation.",
  inputSchema: {
    type: "object",
    properties: {
      module_number: {
        type: "number",
        description: "Module number, 1 through 16.",
      },
    },
    required: ["module_number"],
  },
  handler: async (args) => {
    const meta = MODULE_META[args.module_number];
    if (!meta) {
      throw new Error(`Unknown module number: ${args.module_number}`);
    }
    return {
      module_number: args.module_number,
      name: meta.name,
      one_liner: meta.oneLiner,
      framework: meta.framework,
    };
  },
};

// --- Registry ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TOOL_REGISTRY: McpTool<any, any>[] = [
  listClientsTool,
  getClientSnapshotTool,
  lookupModuleFrameworkTool,
];

export interface McpRpcCall {
  jsonrpc: "2.0";
  id: number | string | null;
  method: string;
  params?: unknown;
}

export interface McpRpcResponse {
  jsonrpc: "2.0";
  id: number | string | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

/**
 * Dispatch a single JSON-RPC call against the tool registry.
 * Supported methods (subset of MCP spec):
 *   - "initialize" - returns server capabilities
 *   - "tools/list" - lists available tools
 *   - "tools/call" - calls a tool with { name, arguments }
 *
 * Phase 1D ships this minimal subset; full MCP spec compliance
 * (resources, prompts, sampling) lands when there's demand.
 */
export async function dispatchMcp(
  call: McpRpcCall,
  ctx: McpToolContext
): Promise<McpRpcResponse> {
  const id = call.id ?? null;

  try {
    if (call.method === "initialize") {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: { name: "ai-cdio", version: "0.1.0" },
          capabilities: { tools: {} },
        },
      };
    }

    if (call.method === "tools/list") {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          tools: TOOL_REGISTRY.map((t) => ({
            name: t.name,
            description: t.description,
            inputSchema: t.inputSchema,
          })),
        },
      };
    }

    if (call.method === "tools/call") {
      const params = (call.params ?? {}) as {
        name?: string;
        arguments?: Record<string, unknown>;
      };
      const tool = TOOL_REGISTRY.find((t) => t.name === params.name);
      if (!tool) {
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Unknown tool: ${params.name}` },
        };
      }
      const result = await tool.handler(params.arguments ?? {}, ctx);
      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            { type: "text", text: JSON.stringify(result, null, 2) },
          ],
        },
      };
    }

    return {
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Method not found: ${call.method}` },
    };
  } catch (err) {
    return {
      jsonrpc: "2.0",
      id,
      error: {
        code: -32603,
        message: err instanceof Error ? err.message : "Internal error",
      },
    };
  }
}

// MODULE_NAMES is imported above so the bundle picks it up; export
// for any tool that needs it.
export { MODULE_NAMES };
