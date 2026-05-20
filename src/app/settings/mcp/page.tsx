import Link from "next/link";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import { McpTokenManager } from "./manager-client";
import { TOOL_REGISTRY } from "@/lib/mcp/registry";

interface McpTokenRow {
  id: string;
  created_at: string;
  token: string;
  label: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  last_used_at: string | null;
  use_count: number;
}

export default async function McpSettingsPage() {
  const practitioner = await ensurePractitioner();
  if (!practitioner) redirect("/sign-in");

  const db = createServiceClient();
  const { data } = await db
    .from("mcp_tokens")
    .select("id, created_at, token, label, expires_at, revoked_at, last_used_at, use_count")
    .eq("practitioner_id", practitioner.id)
    .order("created_at", { ascending: false });

  const tokens = (data ?? []) as McpTokenRow[];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              AI-CDIO &middot; MCP Tokens
            </h1>
            <p className="text-xs text-gray-500">
              Call AI-CDIO from inside Claude.ai / Cursor / Codex / ChatGPT
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/clients"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              &larr; Workspace
            </Link>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
          <strong>MCP-first as a distribution channel.</strong> Per
          Architectural Law 7, the platform meets you where you already work
          with AI. Issue a token, paste it into your Claude.ai / Cursor /
          Codex / ChatGPT MCP config, and you can ask &ldquo;what&apos;s the
          status on <anchor client>?&rdquo; without leaving the chat.
        </div>

        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Available tools ({TOOL_REGISTRY.length})
          </h2>
          <ul className="space-y-2">
            {TOOL_REGISTRY.map((t) => (
              <li
                key={t.name}
                className="border border-gray-200 rounded-lg px-3 py-2"
              >
                <p className="text-xs font-mono text-gray-500">{t.name}</p>
                <p className="text-sm text-gray-700 mt-0.5">{t.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <McpTokenManager initialTokens={tokens} />

        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Configure your AI surface
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Add this to your MCP configuration (replace the URL with your
            deployed origin and the token with one issued above):
          </p>
          <pre className="text-[11px] bg-gray-50 border border-gray-200 rounded p-3 overflow-x-auto">
{`{
  "mcpServers": {
    "ai-cdio": {
      "transport": "http",
      "url": "https://<your-domain>/api/mcp",
      "headers": { "Authorization": "Bearer <your-token>" }
    }
  }
}`}
          </pre>
          <p className="text-[11px] text-gray-400 mt-3">
            Each tool call is logged via{" "}
            <code className="text-[10px]">agent_logs</code> alongside the rest
            of the cost telemetry. Tokens can be revoked at any time on this
            page.
          </p>
        </section>
      </main>
    </div>
  );
}
