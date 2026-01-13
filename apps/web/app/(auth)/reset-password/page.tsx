'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Brain, Loader2, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // No session means the reset link is invalid or expired
        setError('This password reset link is invalid or has expired. Please request a new one.');
      }
      setChecking(false);
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);

      // Redirect to decks after a short delay
      setTimeout(() => {
        router.push('/decks');
      }, 2000);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <p className="mt-4 text-gray-600">Verifying reset link...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <Brain className="h-10 w-10 text-primary-600" />
              <span className="text-2xl font-bold">InternalizePro</span>
            </Link>
          </div>

          <div className="mt-8 rounded-lg bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-100">
              <CheckCircle className="h-6 w-6 text-success-600" />
            </div>
            <h1 className="mt-4 text-xl font-semibold text-gray-900">
              Password updated
            </h1>
            <p className="mt-2 text-gray-600">
              Your password has been successfully reset. Redirecting you to your decks...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if link is invalid
  if (error && !password && !confirmPassword) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <Brain className="h-10 w-10 text-primary-600" />
              <span className="text-2xl font-bold">InternalizePro</span>
            </Link>
          </div>

          <div className="mt-8 rounded-lg bg-white p-8 shadow-sm">
            <div className="rounded-lg bg-error-50 p-4 text-sm text-error-600">
              {error}
            </div>
            <div className="mt-6">
              <Link
                href="/forgot-password"
                className="block w-full rounded-lg bg-primary-600 px-4 py-2 text-center font-medium text-white hover:bg-primary-700"
              >
                Request new reset link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Brain className="h-10 w-10 text-primary-600" />
            <span className="text-2xl font-bold">InternalizePro</span>
          </Link>
          <h1 className="mt-6 text-2xl font-semibold text-gray-900">
            Set new password
          </h1>
          <p className="mt-2 text-gray-600">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-lg bg-error-50 p-4 text-sm text-error-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Update password
          </button>
        </form>
      </div>
    </div>
  );
}
