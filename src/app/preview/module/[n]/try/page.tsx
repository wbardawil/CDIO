import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { MODULE_META } from "@/types";
import { getModuleQuestions } from "@/lib/playbook/diagnostic-questions";
import { TryItClient } from "../try-it-client";

export default async function TryItPage({
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
              <Link
                href={`/preview/module/${n}`}
                className="hover:text-gray-900"
              >
                <span className="font-mono">Module {n}</span>
              </Link>
              <span>/</span>
              <span className="font-medium">Try it</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900 mt-1 truncate">
              {meta.name}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Anchor: <span className="font-medium">{meta.framework}</span>
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/preview/module/${n}`}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              &larr; Module detail
            </Link>
            <UserButton />
          </div>
        </div>
      </header>

      <TryItClient
        moduleNumber={n}
        moduleName={meta.name}
        oneLiner={meta.oneLiner}
        framework={meta.framework}
        questions={questions}
      />
    </div>
  );
}
