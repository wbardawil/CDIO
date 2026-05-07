import Link from "next/link";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { MODULE_META } from "@/types";
import {
  getModuleQuestions,
  moduleHasV2Schema,
} from "@/lib/playbook/diagnostic-questions";

export default async function PreviewIndexPage() {
  const practitioner = await ensurePractitioner();
  if (!practitioner) redirect("/sign-in");

  const moduleNumbers = Object.keys(MODULE_META)
    .map(Number)
    .sort((a, b) => a - b);

  const rows = moduleNumbers.map((n) => {
    const meta = MODULE_META[n];
    const questions = getModuleQuestions(n);
    const isDeep = moduleHasV2Schema(n);
    return {
      n,
      name: meta.name,
      oneLiner: meta.oneLiner,
      framework: meta.framework,
      count: questions.length,
      isDeep,
    };
  });

  const deepCount = rows.filter((r) => r.isDeep).length;
  const totalQuestions = rows.reduce((acc, r) => acc + r.count, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              AI-CDIO &middot; Methodology Preview
            </h1>
            <p className="text-sm text-gray-500">
              Practitioner-only read-only view of every module&apos;s question
              bank. No stakeholder flow, no scoring, no synthesis.
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

      <main className="max-w-5xl mx-auto px-6 py-8">
        <section className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Modules
            </p>
            <p className="text-2xl font-bold text-gray-900">{rows.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Deep (v2 schema)
            </p>
            <p className="text-2xl font-bold text-emerald-700">
              {deepCount}{" "}
              <span className="text-sm font-normal text-gray-500">
                / {rows.length}
              </span>
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Total questions
            </p>
            <p className="text-2xl font-bold text-gray-900">{totalQuestions}</p>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              All 16 modules
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Click any module to see its full question bank: all level
              indicators, role/area tags, framework citations.
            </p>
          </div>
          <ul className="divide-y divide-gray-100">
            {rows.map((r) => (
              <li key={r.n}>
                <Link
                  href={`/preview/module/${r.n}`}
                  className="flex items-start justify-between gap-4 px-5 py-4 hover:bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-gray-400">
                        Module {r.n}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {r.name}
                      </span>
                      {r.isDeep ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Deep
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          Legacy
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 italic">
                      &ldquo;{r.oneLiner}&rdquo;
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Anchor: <span className="font-medium">{r.framework}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold text-gray-900">
                      {r.count}
                    </p>
                    <p className="text-xs text-gray-500">questions</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <p className="text-xs text-gray-400 mt-6">
          Read-only preview surface. To run the actual stakeholder assessment,
          go to the workspace and copy a stakeholder&apos;s magic link.
        </p>
      </main>
    </div>
  );
}
