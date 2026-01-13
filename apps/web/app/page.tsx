import Link from 'next/link';
import { ArrowRight, Brain, Link2, Target, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold">InternalizePro</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Stop Memorizing.
              <span className="block text-primary-600">Start Understanding.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              InternalizePro uses proven cognitive science to help you build
              flexible, transferable knowledge—not just facts you'll forget
              after the exam.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-base font-medium text-white hover:bg-primary-700"
              >
                Start Learning Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="text-base font-medium text-gray-600 hover:text-gray-900"
              >
                See how it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              The Three Pillars of True Learning
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Based on decades of cognitive science research
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Acquire */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                <Sparkles className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                Acquire
              </h3>
              <p className="mt-2 text-gray-600">
                Efficient encoding with our FSRS algorithm—scientifically
                optimized intervals that adapt to your memory.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li>• AI-powered card generation</li>
                <li>• Smart spacing algorithm</li>
                <li>• Confidence-based ratings</li>
              </ul>
            </div>

            {/* Connect */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-50">
                <Link2 className="h-6 w-6 text-success-600" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                Connect
              </h3>
              <p className="mt-2 text-gray-600">
                Build mental schemas through elaboration and linking. See how
                concepts relate in your knowledge graph.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li>• Knowledge graph visualization</li>
                <li>• "Why" and "how" prompts</li>
                <li>• Connection cards</li>
              </ul>
            </div>

            {/* Apply */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-50">
                <Target className="h-6 w-6 text-warning-600" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">Apply</h3>
              <p className="mt-2 text-gray-600">
                Transfer practice through varied application. Use your knowledge
                in new contexts.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li>• Application scenarios</li>
                <li>• Teaching mode</li>
                <li>• Transfer gym</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              Ready to learn smarter?
            </h2>
            <p className="mt-4 text-lg text-primary-100">
              Join thousands of learners who've upgraded from memorization to
              true understanding.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-medium text-primary-600 hover:bg-primary-50"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary-600" />
              <span className="font-semibold">InternalizePro</span>
            </div>
            <p className="text-sm text-gray-500">
              Built on science. Designed for understanding.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
