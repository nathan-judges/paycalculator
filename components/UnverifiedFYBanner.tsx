/**
 * UnverifiedFYBanner — dismissible warning banner for tax years with
 * lastVerifiedAgainstATO === null.
 *
 * Dismissal is persisted in localStorage so the banner does not reappear
 * in the same browser session or subsequent visits.
 */

'use client';

import { useState, useEffect } from 'react';
import { useComparisonStore } from '@/store/comparisonStore';
import { getTaxConfig } from '@/lib/tax-config';

function dismissalKey(financialYear: string): string {
  return `dismissedWarning_${financialYear}`;
}

export function UnverifiedFYBanner() {
  const financialYear = useComparisonStore((s) => s.financialYear);
  const [dismissed, setDismissed] = useState(true); // Start hidden, reveal after hydration

  // Read dismissal state from localStorage on mount / when FY changes
  useEffect(() => {
    const isDismissed =
      localStorage.getItem(dismissalKey(financialYear)) === 'true';
    setDismissed(isDismissed);
  }, [financialYear]);

  const config = getTaxConfig(financialYear);
  const isUnverified = config.lastVerifiedAgainstATO === null;

  if (!isUnverified || dismissed) {
    return null;
  }

  function handleDismiss() {
    localStorage.setItem(dismissalKey(financialYear), 'true');
    setDismissed(true);
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      data-testid="unverified-fy-banner"
      className="
        flex items-start justify-between gap-4
        border-b border-amber-200 bg-amber-50 px-6 py-3
        text-sm text-amber-800
        dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300
      "
    >
      <div className="flex items-start gap-2">
        {/* Warning icon */}
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span>
          <strong>Heads up:</strong> Rates for {financialYear} are legislated
          but not yet ATO-verified. Results are indicative.
        </span>
      </div>
      <button
        type="button"
        aria-label={`Dismiss warning about ${financialYear} rates`}
        onClick={handleDismiss}
        className="
          shrink-0 rounded p-1
          text-amber-600 transition-colors
          hover:bg-amber-100 hover:text-amber-800
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
          dark:text-amber-400 dark:hover:bg-amber-900/40
        "
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
