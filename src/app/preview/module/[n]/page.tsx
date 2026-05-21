import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { MODULE_META } from "@/types";
import {
  getModuleQuestions,
  moduleHasV2Schema,
  type DiagnosticQuestion,
} from "@/lib/playbook/diagnostic-questions";

export default async function PreviewModulePage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const practitioner = await ensurePractitioner();
  if (!practitioner) redirect("/sign-in");

  const { n: nParam } = await params;
  const n = Number(nParam);
  if (!Number.isFinite(n) || !MODULE_META[n]) notFound();

  const meta = MODULE_META[n];
  const questions = getModuleQuestions(n);
  const isDeep = moduleHasV2Schema(n);

  const subcategoryGroups = groupBySubcategory(questions);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Link href="/preview" className="hover:text-gray-900">
                Preview
              </Link>
              <span>/</span>
              <span className="font-mono">Module {n}</span>
              {isDeep ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Deep
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  Legacy
                </span>
              )}
            </div>
            <h1 className="text-lg font-bold text-gray-900 mt-1 truncate">
              {meta.name}
            </h1>
            <p className="text-sm text-gray-600 italic mt-1">
              &ldquo;{meta.oneLiner}&rdquo;
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Anchor: <span className="font-medium">{meta.framework}</span>
              <span className="ml-3 text-gray-400">
                {questions.length} questions
                {subcategoryGroups.length > 1
                  ? ` across ${subcategoryGroups.length} subcategories`
                  : ""}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/preview/module/${n}/try`}
              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
            >
              Try it &rarr;
            </Link>
            <Link
              href="/preview"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              &larr; All modules
            </Link>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {!isDeep && (
          <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
            <strong>Legacy schema.</strong> This module still uses the 4-level
            indicators without role/area tags or framework citations. It
            renders correctly here so you can see what it looks like before its
            depth pass.
          </div>
        )}

        {questions.length === 0 ? (
          <div className="px-5 py-8 bg-white border border-gray-200 rounded-xl text-center text-sm text-gray-500">
            No diagnostic questions defined for this module yet.
          </div>
        ) : (
          subcategoryGroups.map((group) => (
            <section key={group.subcategory} className="mb-8">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                {group.subcategory}{" "}
                <span className="text-gray-400 font-normal">
                  ({group.questions.length})
                </span>
              </h2>
              <ul className="space-y-4">
                {group.questions.map((q) => (
                  <QuestionCard key={q.id} q={q} />
                ))}
              </ul>
            </section>
          ))
        )}
      </main>
    </div>
  );
}

function QuestionCard({ q }: { q: DiagnosticQuestion }) {
  const levels: { label: string; key: keyof typeof q.level_indicators }[] = [
    { label: "1", key: "level_1" },
    { label: "2", key: "level_2" },
    { label: "3", key: "level_3" },
    { label: "4", key: "level_4" },
    { label: "5", key: "level_5" },
  ];

  // Whether the question has any metadata worth surfacing. If not, we
  // hide the "Show details" disclosure entirely so empty toggles don't
  // pollute the card.
  const hasMetadata =
    Boolean(q.framework_citation) ||
    Boolean(q.tags?.function?.length) ||
    Boolean(q.tags?.area?.length) ||
    q.na_eligible !== false;

  return (
    <li className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-gray-900 flex-1">
            {q.question}
          </p>
          <span className="text-xs font-mono text-gray-400 shrink-0">
            {q.id}
          </span>
        </div>

        {/* Metadata (tags + framework citation) collapsed behind a
            native <details>. Default view = just the question + the
            5 answers. Open the disclosure to see fn / area / N/A flag
            + the named-construct citation backing the question. */}
        {hasMetadata && (
          <details className="mt-3 group">
            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700 select-none list-none flex items-center gap-1">
              <span className="inline-block transition-transform group-open:rotate-90" aria-hidden>
                ›
              </span>
              <span className="group-open:hidden">Show methodology details</span>
              <span className="hidden group-open:inline">Hide methodology details</span>
            </summary>

            {q.tags && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {q.tags.function.map((t) => (
                  <span
                    key={`fn-${t}`}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    fn:{t}
                  </span>
                ))}
                {q.tags.area.map((t) => (
                  <span
                    key={`area-${t}`}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200"
                  >
                    area:{t}
                  </span>
                ))}
                {q.na_eligible !== false && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    N/A eligible
                  </span>
                )}
              </div>
            )}

            {q.framework_citation && (
              <div className="mt-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                <p className="font-semibold text-gray-700">
                  {q.framework_citation.framework}
                  <span className="font-normal text-gray-500">
                    {" "}
                    &middot; {q.framework_citation.reference}
                  </span>
                </p>
                <p className="text-gray-600 mt-1 italic">
                  {q.framework_citation.rationale}
                </p>
              </div>
            )}
          </details>
        )}
      </div>

      <ol className="divide-y divide-gray-100">
        {levels.map((l) => {
          const text = q.level_indicators[l.key];
          if (!text) return null;
          return (
            <li
              key={l.key}
              className="px-5 py-3 flex items-start gap-3 text-sm"
            >
              <span
                className={`shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${levelStyle(
                  l.label
                )}`}
              >
                {l.label}
              </span>
              <span className="text-gray-700">{text}</span>
            </li>
          );
        })}
      </ol>
    </li>
  );
}

function levelStyle(label: string): string {
  switch (label) {
    case "1":
      return "bg-red-50 text-red-700 border border-red-200";
    case "2":
      return "bg-orange-50 text-orange-700 border border-orange-200";
    case "3":
      return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    case "4":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "5":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    default:
      return "bg-gray-100 text-gray-600 border border-gray-200";
  }
}

function groupBySubcategory(
  questions: DiagnosticQuestion[]
): { subcategory: string; questions: DiagnosticQuestion[] }[] {
  const order: string[] = [];
  const buckets: Record<string, DiagnosticQuestion[]> = {};
  for (const q of questions) {
    const key = q.subcategory || "Uncategorized";
    if (!(key in buckets)) {
      buckets[key] = [];
      order.push(key);
    }
    buckets[key].push(q);
  }
  return order.map((s) => ({ subcategory: s, questions: buckets[s] }));
}
