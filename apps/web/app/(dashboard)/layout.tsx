import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Brain, LayoutGrid, BookOpen, Settings, LogOut, Home } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.JSX.Element> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
            <Brain className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold">InternalizePro</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            <NavLink href="/dashboard" icon={Home}>
              Dashboard
            </NavLink>
            <NavLink href="/decks" icon={LayoutGrid}>
              Decks
            </NavLink>
            <NavLink href="/review" icon={BookOpen}>
              Review
            </NavLink>
            <NavLink href="/settings" icon={Settings}>
              Settings
            </NavLink>
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-600">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 truncate">
                <p className="truncate text-sm font-medium text-gray-900">
                  {user.email}
                </p>
              </div>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

function NavLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: typeof LayoutGrid;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{children}</span>
    </Link>
  );
}
