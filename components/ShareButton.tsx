/**
 * ShareButton — copies a compressed share link to the clipboard.
 *
 * Uses the Clipboard API (navigator.clipboard.writeText). If the API is
 * unavailable or the user denies permission, shows a user-friendly error
 * toast rather than exposing internal details.
 *
 * A success toast auto-dismisses after 3 seconds.
 */

'use client';

import { useState, useCallback } from 'react';
import { useComparisonStore } from '@/store/comparisonStore';
import { compressState } from '@/lib/urlState';
import type { AppState } from '@/lib/types';
import { Toast } from '@/components/Toast';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type ClipboardLike = {
  writeText: (text: string) => Promise<void>;
};

type LocationLike = {
  origin: string;
  pathname: string;
};

export function ShareButton({
  clipboard: injectedClipboard,
  location: injectedLocation,
}: {
  clipboard?: ClipboardLike | null;
  location?: LocationLike;
} = {}) {
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(
    null,
  );

  const showToast = useCallback((message: string, variant: 'success' | 'error') => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 3000);
  }, []);

  async function handleCopy() {
    const storeState = useComparisonStore.getState();
    const appState: AppState = {
      version: storeState.version,
      displayFrequency: storeState.displayFrequency,
      financialYear: storeState.financialYear,
      scenarios: storeState.scenarios,
    };

    const compressed = compressState(appState);
    const loc = injectedLocation ?? window.location;
    const shareUrl = `${loc.origin}${loc.pathname}?state=${compressed}`;

    const clipboard =
      injectedClipboard === undefined ? (navigator.clipboard as unknown as ClipboardLike | undefined) : injectedClipboard;
    const writeText = clipboard?.writeText;

    if (typeof writeText !== 'function') {
      showToast(
        'Could not copy link. Please copy it manually from the address bar.',
        'error',
      );
      return;
    }

    try {
      await writeText.call(clipboard, shareUrl);
      showToast('Share link copied to clipboard!', 'success');
    } catch {
      // Do not expose internal error details (security)
      showToast(
        'Could not copy link. Please copy it manually from the address bar.',
        'error',
      );
    }
  }

  return (
    <div className="inline-flex">
      <button
        type="button"
        id="share-link-button"
        aria-label="Copy share link"
        onClick={handleCopy}
        className="
          inline-flex items-center gap-1.5 rounded-lg
          border border-zinc-200 bg-white px-3 py-2
          text-sm font-medium text-zinc-700
          transition-all duration-150
          hover:border-zinc-300 hover:bg-zinc-50
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
          dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300
          dark:hover:border-zinc-600 dark:hover:bg-zinc-700
        "
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share
      </button>

      {toast ? (
        <Toast
          message={toast.message}
          onDismiss={() => setToast(null)}
          variant={toast.variant}
          durationMs={3000}
        />
      ) : null}
    </div>
  );
}
