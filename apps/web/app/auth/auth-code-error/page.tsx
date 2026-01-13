import Link from 'next/link';
import { Brain, AlertCircle } from 'lucide-react';

export default function AuthCodeErrorPage(): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <Brain className="h-10 w-10 text-primary-600" />
          <span className="text-2xl font-bold">InternalizePro</span>
        </Link>

        <div className="mt-8 rounded-lg bg-white p-8 shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-error-100">
            <AlertCircle className="h-6 w-6 text-error-600" />
          </div>

          <h1 className="mt-4 text-xl font-semibold text-gray-900">
            Authentication Error
          </h1>

          <p className="mt-2 text-gray-600">
            We couldn&apos;t complete your sign in. This can happen if:
          </p>

          <ul className="mt-4 space-y-2 text-left text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-gray-400" />
              The confirmation link has expired
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-gray-400" />
              The link was already used
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-gray-400" />
              There was a network issue
            </li>
          </ul>

          <div className="mt-6 space-y-3">
            <Link
              href="/login"
              className="block w-full rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700"
            >
              Try signing in again
            </Link>
            <Link
              href="/signup"
              className="block w-full rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
              Create a new account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
