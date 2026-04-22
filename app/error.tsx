/**
 * app/error.tsx — Next.js route-level error boundary.
 *
 * Catches rendering errors in the app route segment.
 * Must be a Client Component (React error boundaries require class or hook patterns).
 *
 * API (Next.js 16): receives `error` and `unstable_retry`.
 * - `unstable_retry()` re-renders the segment without a full page reload.
 * - The "Clear data" button wipes localStorage and navigates to `/`.
 *
 * Note: this does NOT wrap app/layout.tsx. For root-level error handling,
 * a global-error.tsx would be needed — not required here as layout is simple.
 */

'use client';

import { useEffect } from 'react';
import { useComparisonStore } from '@/store/comparisonStore';

interface ErrorProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

export default function Error({ error, unstable_retry }: ErrorProps) {
  useEffect(() => {
    // Log to console in development; in production, wire to Sentry / similar
    console.error('[PayCalculator] Unhandled render error:', error);
  }, [error]);

  function handleClearAndRestart() {
    useComparisonStore.persist.clearStorage();
    window.location.reload();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-500"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        </div>

        <h1 className="mb-2 text-center text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Something went wrong
        </h1>
        <p className="mb-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Something went wrong. Please refresh or start a new comparison.
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={unstable_retry}
            className="
              w-full rounded-xl bg-indigo-600 px-4 py-3
              text-sm font-semibold text-white
              transition-colors duration-150
              hover:bg-indigo-700
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
            "
          >
            Try again
          </button>
          <button
            type="button"
            onClick={handleClearAndRestart}
            className="
              w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3
              text-sm font-semibold text-zinc-700
              transition-colors duration-150
              hover:bg-zinc-100
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2
              dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700
            "
          >
            Clear data &amp; start a new comparison
          </button>
        </div>
      </div>
    </div>
  );
}
