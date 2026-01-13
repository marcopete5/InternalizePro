import { createClient } from '@/lib/supabase/server';
import { getReviewStats, getDueCards, getNewCards, getDecksWithStats } from '@internalize/api-client';
import Link from 'next/link';
import { BookOpen, Flame, Target, TrendingUp, Plus, Clock } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch all data in parallel
  const [stats, dueCards, newCards, decks] = await Promise.all([
    getReviewStats(30, supabase).catch(() => null),
    getDueCards(undefined, 100, supabase).catch(() => []),
    getNewCards(undefined, 100, supabase).catch(() => []),
    getDecksWithStats(supabase).catch(() => []),
  ]);

  const totalDue = dueCards.length;
  const totalNew = newCards.length;
  const totalCards = decks.reduce((sum, d) => sum + (d.cardCount ?? 0), 0);

  // Get today's reviews
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const { count: reviewedToday } = await supabase
    .from('review_logs')
    .select('*', { count: 'exact', head: true })
    .gte('reviewed_at', todayStr);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">Your learning progress at a glance</p>
        </div>
        {totalDue + totalNew > 0 && (
          <Link
            href="/review"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <BookOpen className="h-4 w-4" />
            Start Review
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="Reviewed Today"
          value={reviewedToday ?? 0}
          sublabel="cards"
          color="primary"
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={stats?.streakDays ?? 0}
          sublabel="days"
          color="orange"
        />
        <StatCard
          icon={Target}
          label="Retention Rate"
          value={stats ? `${Math.round(stats.retentionRate * 100)}%` : '—'}
          sublabel="last 30 days"
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Reviews"
          value={stats?.totalReviews ?? 0}
          sublabel="last 30 days"
          color="blue"
        />
      </div>

      {/* Cards to Review */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Due Cards */}
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Due for Review</h2>
                <p className="text-sm text-gray-500">Cards ready to study</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-amber-600">{totalDue}</span>
          </div>

          {totalDue > 0 ? (
            <Link
              href="/review"
              className="mt-4 block w-full rounded-lg border border-amber-200 bg-amber-50 py-2 text-center text-sm font-medium text-amber-700 hover:bg-amber-100"
            >
              Review Due Cards
            </Link>
          ) : (
            <p className="mt-4 text-center text-sm text-gray-500">
              No cards due. Great job!
            </p>
          )}
        </section>

        {/* New Cards */}
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">New Cards</h2>
                <p className="text-sm text-gray-500">Cards not yet studied</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-blue-600">{totalNew}</span>
          </div>

          {totalNew > 0 ? (
            <Link
              href="/review"
              className="mt-4 block w-full rounded-lg border border-blue-200 bg-blue-50 py-2 text-center text-sm font-medium text-blue-700 hover:bg-blue-100"
            >
              Learn New Cards
            </Link>
          ) : (
            <Link
              href="/decks"
              className="mt-4 block w-full rounded-lg border border-gray-200 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Create Cards
            </Link>
          )}
        </section>
      </div>

      {/* Recent Decks */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Your Decks</h2>
          <Link
            href="/decks"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all
          </Link>
        </div>

        {decks.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {decks.slice(0, 6).map((deck) => (
              <Link
                key={deck.id}
                href={`/decks/${deck.id}`}
                className="group rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: deck.color ?? '#6366f1' }}
                  />
                  <h3 className="font-medium text-gray-900 group-hover:text-primary-600">
                    {deck.name}
                  </h3>
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                  <span>{deck.cardCount ?? 0} cards</span>
                  {(deck.dueCount ?? 0) > 0 && (
                    <span className="text-amber-600">{deck.dueCount} due</span>
                  )}
                  {(deck.newCount ?? 0) > 0 && (
                    <span className="text-blue-600">{deck.newCount} new</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
            <p className="text-gray-500">No decks yet</p>
            <Link
              href="/decks/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              Create Your First Deck
            </Link>
          </div>
        )}
      </section>

      {/* Quick Tips */}
      {totalCards === 0 && (
        <section className="mt-8 rounded-xl bg-primary-50 p-6">
          <h2 className="font-semibold text-primary-900">Getting Started</h2>
          <ul className="mt-3 space-y-2 text-sm text-primary-800">
            <li>1. Create a deck for a topic you want to learn</li>
            <li>2. Add flashcards with questions and answers</li>
            <li>3. Review daily to build long-term memory</li>
            <li>4. The FSRS algorithm optimizes your review schedule</li>
          </ul>
        </section>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  color,
}: {
  icon: typeof BookOpen;
  label: string;
  value: number | string;
  sublabel: string;
  color: 'primary' | 'orange' | 'green' | 'blue';
}) {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-400">{sublabel}</p>
        </div>
      </div>
    </div>
  );
}
