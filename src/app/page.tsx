import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-6 py-24">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI-CDIO
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Objective, data-driven digital strategy for your organization.
            Remove the politics. Focus on decisions.
          </p>
        </div>

        {/* Value props */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Assess Objectively</h3>
            <p className="text-sm text-gray-600">
              Each stakeholder answers independently. No groupthink. No
              loudest-voice-wins. The system collects honest data.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-amber-600 text-xl">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Surface Divergences</h3>
            <p className="text-sm text-gray-600">
              When leadership disagrees, the system shows the data behind each
              position — replacing "who is right" with "what does the evidence say."
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-green-600 text-xl">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Act on a Roadmap</h3>
            <p className="text-sm text-gray-600">
              Get a prioritized 90-day plan with quick wins and strategic
              initiatives, backed by ROI projections.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <Link
            href="/onboarding"
            className="inline-block px-8 py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors text-lg"
          >
            Start Your Assessment
          </Link>
          <div>
            <Link
              href="/dashboard"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              View demo dashboard
            </Link>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-24">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            16 Competency Modules
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              "CIDO Role", "Digital Strategy", "Architecture", "Cloud",
              "Cybersecurity", "Data & AI", "Platforms", "Analytics",
              "Design & CX", "Leadership", "Organization", "Financial",
              "Portfolio", "Agile/DevOps", "Automation", "Change Mgmt",
            ].map((module, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-lg p-3 text-center"
              >
                <span className="text-xs font-medium text-gray-400">M{i + 1}</span>
                <p className="text-sm font-medium text-gray-700 mt-1">{module}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
