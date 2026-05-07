import Link from "next/link";

export const metadata = {
  title: "Privacy Policy · AI-CDIO",
};

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: 2026-05-07
          </p>
          <div className="mt-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
            <strong>Pre-attorney-review draft.</strong> This policy is a
            starting-point template. Final attorney review is scheduled for
            Phase 2 Day 30.
          </div>
        </header>

        <article className="prose prose-sm max-w-none text-gray-800 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900">1. What we collect</h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                <strong>Account information</strong> — name, email, role —
                provided through Clerk authentication.
              </li>
              <li>
                <strong>Engagement data</strong> you submit on behalf of your
                clients — assessment responses, organization metadata
                (industry, size band, engagement model), stakeholder names
                and roles, decisions log, narrative outputs.
              </li>
              <li>
                <strong>Operational telemetry</strong> — per-LLM-call token
                counts, model used, latency, status, cost in USD cents
                (stored in <code className="text-xs">agent_logs</code>).
                Required for unit-economics measurement and pricing
                decisions. Not used for advertising.
              </li>
              <li>
                <strong>Cookies and session data</strong> — Clerk session
                tokens for authentication. We do not use third-party
                advertising or tracking cookies.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">2. How we use it</h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>To provide and operate the Service (authenticate you, store your engagement records, generate AI outputs).</li>
              <li>To bill your subscription and process payments.</li>
              <li>To improve the Service&apos;s reliability, performance, and unit economics.</li>
              <li>To communicate operational and security updates.</li>
              <li>To comply with legal obligations.</li>
            </ul>
            <p className="mt-3">
              <strong>We do not</strong> use your client data to train AI
              models, sell it to third parties, or share it with other
              practitioners on the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">3. Tenant isolation</h2>
            <p>
              Each practitioner&apos;s engagement records and Network Catalog
              are isolated at three layers: application-layer ownership
              checks (<code className="text-xs">assertPractitionerOwnsOrg</code>),
              Supabase row-level security policies, and corpus partitioning
              at the table level. We treat cross-tenant data leakage as a P0
              architectural concern (per{" "}
              <code className="text-xs">docs/STRATEGY-2026.md</code> Network
              Catalog Privacy Spec).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">4. Sub-processors</h2>
            <p>
              We use the following third-party service providers as
              sub-processors. Each is contracted to maintain reasonable
              security and confidentiality:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Clerk</strong> — authentication.</li>
              <li><strong>Supabase</strong> (PostgreSQL + storage) — engagement records, vector embeddings.</li>
              <li><strong>Vercel</strong> — hosting and edge runtime.</li>
              <li><strong>Anthropic</strong> — large-language-model inference for AI-generated narratives, decision packages, roadmaps.</li>
              <li><strong>Resend</strong> — transactional email delivery.</li>
              <li><strong>Upstash Redis</strong> — rate limiting (when enabled).</li>
              <li><strong>Sentry / Langfuse</strong> — error monitoring and LLM tracing (when enabled).</li>
            </ul>
            <p className="mt-3">
              We will provide an updated sub-processor list on request and
              with reasonable notice when we add new providers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">5. International transfers</h2>
            <p>
              Our infrastructure operates primarily in the United States. EU
              clients receive standard contractual clauses on request to
              support GDPR-compliant data transfer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">6. Retention</h2>
            <p>
              Engagement records are retained for the life of your
              subscription plus 30 days, after which they are deleted. You
              may export and delete your engagement records at any time.
              Operational telemetry (<code className="text-xs">agent_logs</code>)
              is retained for 24 months for cost-trend analysis, then
              deleted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">7. Your rights</h2>
            <p>
              Subject to applicable law (including GDPR and CCPA where they
              apply), you have rights to access, correct, port, and delete
              your personal data. Submit requests to{" "}
              <a
                href="mailto:privacy@ai-cdio.example"
                className="text-blue-700 underline"
              >
                privacy@ai-cdio.example
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">8. Security</h2>
            <p>
              We use industry-standard encryption in transit (TLS) and at
              rest. Network Catalog notes containing partner pricing or
              ratings are encrypted at the column level. We do not guarantee
              absolute security; if a breach occurs that materially affects
              your data, we will notify you within the timeframe required by
              applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">9. Children</h2>
            <p>
              The Service is not directed to children under 16. We do not
              knowingly collect personal data from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">10. Changes</h2>
            <p>
              We may update this policy. Material changes will be communicated
              via email and via the Service before they take effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">11. Contact</h2>
            <p>
              <a
                href="mailto:privacy@ai-cdio.example"
                className="text-blue-700 underline"
              >
                privacy@ai-cdio.example
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
            <Link
              href="/ai-disclaimer"
              className="hover:text-gray-700 underline"
            >
              AI Disclaimer
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
