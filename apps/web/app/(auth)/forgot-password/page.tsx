'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Brain, Loader2, ArrowLeft, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

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
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
              <Mail className="h-6 w-6 text-primary-600" />
            </div>
            <h1 className="mt-4 text-xl font-semibold text-gray-900">
              Check your email
            </h1>
            <p className="mt-2 text-gray-600">
              We&apos;ve sent a password reset link to{' '}
              <span className="font-medium text-gray-900">{email}</span>
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Didn&apos;t receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setSuccess(false)}
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                try again
              </button>
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 font-medium text-primary-600 hover:text-primary-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </p>
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
            Reset your password
          </h1>
          <p className="mt-2 text-gray-600">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-lg bg-error-50 p-4 text-sm text-error-600">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Send reset link
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 font-medium text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
