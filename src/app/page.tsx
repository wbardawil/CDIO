import Link from "next/link";
import { AuthHeader } from "@/components/auth-header";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-bold text-gray-900">AI-CDIO</span>
        <AuthHeader />
      </header>
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI-CDIO
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-2">
            Smart technology decisions for your business.
          </p>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            No jargon. No vendor bias. Just clear answers and actions.
          </p>
        </div>

        {/* Problem-first CTA */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-12 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            What's your biggest technology challenge right now?
          </h2>
          {/* Problem chips */}
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {[
              { label: "Systems keep breaking", href: "/chat?p=systems_breaking" },
              { label: "Spending too much on software", href: "/chat?p=spending_too_much" },
              { label: "Not sure if we're secure", href: "/chat?p=not_secure" },
              { label: "Can't find good tech people", href: "/chat?p=cant_find_talent" },
              { label: "Competitors seem more digital", href: "/chat?p=competitors_digital" },
              { label: "Our data is a mess", href: "/chat?p=data_mess" },
              { label: "Customers deserve better", href: "/chat?p=customer_experience" },
            ].map((chip) => (
              <Link
                key={chip.label}
                href={chip.href}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                {chip.label}
              </Link>
            ))}
          </div>
          {/* Aspirational + Discovery chips */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {[
              { label: "I want to use AI but don't know how", href: "/chat?p=want_to_use_ai", style: "border-amber-200 text-amber-700 hover:border-amber-400 hover:bg-amber-50" },
              { label: "We have no IT team", href: "/chat?p=no_it_team", style: "border-amber-200 text-amber-700 hover:border-amber-400 hover:bg-amber-50" },
              { label: "Our tech projects keep failing", href: "/chat?p=projects_keep_failing", style: "border-amber-200 text-amber-700 hover:border-amber-400 hover:bg-amber-50" },
              { label: "I don't know what I don't know", href: "/chat?p=dont_know_where_to_start", style: "border-green-200 text-green-700 hover:border-green-400 hover:bg-green-50" },
              { label: "Full technology health check", href: "/chat?p=full_assessment", style: "border-green-200 text-green-700 hover:border-green-400 hover:bg-green-50" },
            ].map((chip) => (
              <Link
                key={chip.label}
                href={chip.href}
                className={`px-4 py-2 bg-white border rounded-full text-sm transition-all ${chip.style}`}
              >
                {chip.label}
              </Link>
            ))}
          </div>
          <Link
            href="/scan"
            className="inline-block px-8 py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors text-lg"
          >
            Start Your Health Check
          </Link>
          <p className="text-xs text-gray-400 mt-3">Free. No signup required. See your results build in real-time.</p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl font-bold">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Tell us the problem</h3>
            <p className="text-sm text-gray-600">
              Describe what's frustrating you about technology in plain language.
              No forms. No jargon.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-amber-600 text-xl font-bold">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Get a clear assessment</h3>
            <p className="text-sm text-gray-600">
              AI-CDIO asks a few smart questions and tells you exactly where you
              stand compared to similar businesses.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-green-600 text-xl font-bold">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Do this next</h3>
            <p className="text-sm text-gray-600">
              Get ONE specific action — with steps, time estimate, and expected
              impact. Not a 90-page report.
            </p>
          </div>
        </div>

        {/* Social proof / stats */}
        <div className="text-center mb-16">
          <p className="text-sm text-gray-500 mb-4">Built on a proven framework covering</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              "Security", "Cloud", "Data & AI", "Automation",
              "Strategy", "Architecture", "Analytics", "Leadership",
            ].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
              >
                {tag}
              </span>
            ))}
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
              +8 more domains
            </span>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-gray-500 mb-4">
            90% of SMBs have no technology leadership. AI-CDIO changes that.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/scan"
              className="inline-block px-8 py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Start Your Health Check
            </Link>
            <Link
              href="/chat"
              className="inline-block px-8 py-4 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Just Chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
