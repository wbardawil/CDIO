import Link from "next/link";

export const metadata = {
  title: "Terms of Service · AI-CDIO",
};

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: 2026-05-07
          </p>
          <div className="mt-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
            <strong>Pre-attorney-review draft.</strong> These terms are a
            starting-point template. Final attorney review is scheduled for
            Phase 2 Day 30 of the AI-CDIO build (per{" "}
            <code className="text-xs">docs/ROADMAP.md</code>).
          </div>
        </header>

        <article className="prose prose-sm max-w-none text-gray-800 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the AI-CDIO platform (the &ldquo;Service&rdquo;),
              you (&ldquo;Practitioner&rdquo; or &ldquo;you&rdquo;) agree to be
              bound by these Terms of Service. If you do not agree, do not use
              the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">2. The Service</h2>
            <p>
              AI-CDIO is a software platform that supports fractional Chief
              Digital / Information Officers (and equivalent technology leaders)
              in delivering structured methodology-anchored advice to their
              clients. The Service produces diagnostics, decision packages,
              roadmaps, and recurring deliverables. Outputs are advisory and
              are not professional legal, financial, security, or compliance
              advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">3. Practitioner Responsibilities</h2>
            <p>
              You are responsible for: (a) verifying recommendations before
              presenting them to your clients; (b) ensuring your engagement
              with each client complies with applicable laws and contracts;
              (c) maintaining the confidentiality of your authentication
              credentials; (d) the accuracy of information you submit on
              behalf of your clients.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">4. Client Data</h2>
            <p>
              Data you and your clients&apos; stakeholders submit to the
              Service (assessment responses, engagement state, decisions log)
              is processed to produce strategic recommendations. Client data
              is jointly owned by you and your client. Either party may export
              the full engagement record at any time. Client data is not used
              to train models, is not shared with other practitioners, and is
              not disclosed to third parties without explicit written consent
              except as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">5. AI Outputs and Limitations</h2>
            <p>
              The Service uses large language models to generate narratives,
              recommendations, and decision packages. These outputs are
              probabilistic and may contain errors, omissions, or
              hallucinations. See the{" "}
              <Link
                href="/ai-disclaimer"
                className="text-blue-700 underline"
              >
                AI Disclaimer
              </Link>{" "}
              for details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">6. Practitioner Network and Vendor Catalog</h2>
            <p>
              Vendor / partner notes, ratings, and pricing you record in your
              private Network Catalog remain your private records and are not
              shared with your clients or other practitioners unless you
              explicitly choose to. The platform&apos;s tenant isolation
              treats this as a P0 architectural concern (per{" "}
              <code className="text-xs">docs/STRATEGY-2026.md</code> Network
              Catalog Privacy Spec).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">7. Subscription and Fees</h2>
            <p>
              Subscription tiers, fees, billing cycle, and refund policy are
              specified at sign-up and in your account&apos;s Billing Settings.
              Subscription continues until you cancel. We may change pricing
              with reasonable notice; existing subscriptions honor the price
              at the time of purchase through the end of the then-current
              billing period.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">8. Termination</h2>
            <p>
              You may cancel your subscription at any time via Billing
              Settings. We may suspend or terminate your access for material
              breach of these Terms with reasonable notice except where
              urgency requires immediate action (e.g., suspected fraud or
              security risk). Upon termination, you may export your
              engagement records for at least 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">9. Disclaimers</h2>
            <p>
              The Service is provided &ldquo;AS IS&rdquo; and &ldquo;AS
              AVAILABLE&rdquo;. To the maximum extent permitted by law, we
              disclaim all warranties, express or implied, including
              merchantability, fitness for a particular purpose, and
              non-infringement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, our aggregate liability
              for any claim arising from the Service is limited to the fees
              you paid in the twelve months preceding the claim. We are not
              liable for indirect, incidental, consequential, special, or
              punitive damages, including lost profits, lost savings, or
              business interruption.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">11. Indemnification</h2>
            <p>
              You agree to indemnify and hold us harmless from claims arising
              out of: (a) your use of the Service in violation of these
              Terms; (b) your engagements with your clients; (c) your
              recommendations or advice given to your clients in reliance on
              the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">12. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the jurisdiction in
              which AI-CDIO is incorporated, without regard to conflict-of-law
              principles. Disputes will be resolved in the courts of that
              jurisdiction unless the parties agree to arbitration in writing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">13. Changes</h2>
            <p>
              We may update these Terms with reasonable notice. Continued use
              of the Service after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">14. Contact</h2>
            <p>
              For questions about these Terms, contact{" "}
              <a
                href="mailto:legal@ai-cdio.example"
                className="text-blue-700 underline"
              >
                legal@ai-cdio.example
              </a>
              . (Replace with the operating contact email at attorney review.)
            </p>
          </section>
        </article>

        <footer className="mt-12 pt-6 border-t border-gray-200 text-xs text-gray-400">
          <p>
            Related:{" "}
            <Link href="/privacy" className="hover:text-gray-700 underline">
              Privacy Policy
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
