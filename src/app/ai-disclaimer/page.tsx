import Link from "next/link";

export const metadata = {
  title: "AI Disclaimer · AI-CDIO",
};

export default function AIDisclaimerPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          &larr; Home
        </Link>

        <header className="mt-6 mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">AI Disclaimer</h1>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: 2026-05-07
          </p>
          <div className="mt-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
            <strong>Pre-attorney-review draft.</strong> Final attorney review
            scheduled for Phase 2 Day 30.
          </div>
        </header>

        <article className="prose prose-sm max-w-none text-gray-800 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              What AI-CDIO does and does not do
            </h2>
            <p>
              AI-CDIO uses large language models (currently Anthropic Claude)
              to generate diagnostic narratives, decision packages, roadmaps,
              and recommendations from your engagement data. <strong>The
              platform is an advisory tool, not an implementation guarantee.</strong>{" "}
              It does not autonomously make business decisions, deploy
              technology changes, manage vendors, or execute on your behalf.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              Probabilistic outputs
            </h2>
            <p>
              AI-generated text is probabilistic. It can contain errors,
              omissions, or fabricated detail (&ldquo;hallucinations&rdquo;).
              Quoted statistics, vendor recommendations, and framework
              citations should be verified against primary sources before
              being communicated to a client&apos;s board, leadership team,
              or external auditor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              Final decisions rest with you
            </h2>
            <p>
              All technology investment decisions, vendor selections,
              security postures, AI governance choices, and strategic
              direction rest with the practitioner and the client&apos;s
              leadership team. AI-CDIO&apos;s recommendations inform these
              decisions; they do not substitute for professional judgment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              Domains requiring qualified professionals
            </h2>
            <p>
              Several domains the platform touches require qualified human
              professionals before action. Use AI-CDIO output as input to
              those conversations, not as a substitute:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Legal</strong> — contracts, IP, regulatory exposure
                (consult licensed legal counsel).
              </li>
              <li>
                <strong>Cybersecurity</strong> — incident response,
                penetration testing, breach disclosure (engage a qualified
                CISO or specialized security firm).
              </li>
              <li>
                <strong>Compliance</strong> — HIPAA, PCI-DSS, SOX, EU AI
                Act, GDPR, CCPA, FDA (engage compliance specialists for the
                applicable regime).
              </li>
              <li>
                <strong>Tax and finance</strong> — capitalization, tax
                treatment, audit (engage a CPA or qualified tax advisor).
              </li>
              <li>
                <strong>Medical / safety-critical decisions</strong> —
                AI-CDIO is not designed for clinical use or safety-of-life
                decisions.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              Framework citations
            </h2>
            <p>
              The platform anchors recommendations to recognized frameworks
              (NIST CSF, NIST AI RMF, CMMI, TBM Council, KPMG Return on
              Objectives, APQC Process Classification Framework, Lean Six
              Sigma, ITIL, TOGAF, EU AI Act, and others). Citations are
              attributed in good faith from publicly available descriptions.
              Frameworks evolve; always confirm against the issuing
              organization&apos;s latest published version before relying on
              a citation in a regulated context.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              Data used in AI generation
            </h2>
            <p>
              Your client data (assessment responses, engagement state,
              decisions log) is used as context for AI-generated outputs in
              your engagements. It is{" "}
              <strong>not used to train Anthropic&apos;s models</strong>,
              not shared with other practitioners, and not used for
              advertising. See the{" "}
              <Link
                href="/privacy"
                className="text-blue-700 underline"
              >
                Privacy Policy
              </Link>{" "}
              for the full data-handling description.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              No vendor endorsement
            </h2>
            <p>
              The platform may surface specific vendor names (e.g., in the
              AI Use-Case Library or Selection Engine outputs). These are
              examples drawn from public market data, not endorsements.
              Vendor selection should follow the practitioner&apos;s
              independent due diligence and the client&apos;s procurement
              process.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              Limitation
            </h2>
            <p>
              You agree that the practitioner, not AI-CDIO, is responsible
              for the recommendations made to your clients. We accept no
              liability for outcomes resulting from your clients&apos;
              decisions, except as set forth in our standard professional
              services indemnification clauses (see the{" "}
              <Link
                href="/terms"
                className="text-blue-700 underline"
              >
                Terms of Service
              </Link>
              ).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">Contact</h2>
            <p>
              <a
                href="mailto:legal@ai-cdio.example"
                className="text-blue-700 underline"
              >
                legal@ai-cdio.example
              </a>
            </p>
          </section>
        </article>

        <footer className="mt-12 pt-6 border-t border-gray-200 text-xs text-gray-400">
          <p>
            Related:{" "}
            <Link href="/terms" className="hover:text-gray-700 underline">
              Terms of Service
            </Link>
            {" · "}
            <Link href="/privacy" className="hover:text-gray-700 underline">
              Privacy Policy
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
