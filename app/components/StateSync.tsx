/**
 * StateSync — client component that synchronises Zustand store ↔ URL.
 *
 * On mount:
 *   1. Reads `?state=` from the URL.
 *   2. If valid, replaces the store state.
 *   3. If present but invalid, shows a toast notification.
 *
 * On store changes:
 *   - Debounces (500ms) and updates the URL via `history.replaceState`.
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useComparisonStore } from '@/store/comparisonStore';
import { compressState, decompressState, readStateParam, STATE_PARAM } from '@/lib/urlState';
import type { AppState } from '@/lib/types';

// ---------------------------------------------------------------------------
// Toast component (lightweight, no external dependency)
// ---------------------------------------------------------------------------

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#1a1a2e',
        color: '#fff',
        padding: '0.75rem 1.5rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
        zIndex: 9999,
        fontSize: '0.875rem',
        maxWidth: '90vw',
        textAlign: 'center',
        animation: 'toast-in 0.3s ease-out',
      }}
    >
      {message}
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(1rem); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StateSync component
// ---------------------------------------------------------------------------

export function StateSync() {
  const [toast, setToast] = useState<string | null>(null);
  const hasInitialised = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissToast = useCallback(() => setToast(null), []);

  // ── On mount: read URL state ──────────────────────────────────────────
  useEffect(() => {
    if (hasInitialised.current) return;
    hasInitialised.current = true;

    const compressed = readStateParam(window.location.search);
    if (!compressed) return;

    const urlState = decompressState(compressed);
    if (urlState) {
      useComparisonStore.getState().loadFromURL(urlState);
    } else {
      setToast("Couldn't load your saved comparison. Starting fresh.");
    }
  }, []);

  // ── Subscribe to store changes → debounce URL update ──────────────────
  useEffect(() => {
    const unsubscribe = useComparisonStore.subscribe((state) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        const dataState: AppState = {
          version: state.version,
          displayFrequency: state.displayFrequency,
          financialYear: state.financialYear,
          scenarios: state.scenarios,
        };

        const compressed = compressState(dataState);
        const url = new URL(window.location.href);
        url.searchParams.set(STATE_PARAM, compressed);
        window.history.replaceState(null, '', url.toString());
      }, 500);
    });

    return () => {
      unsubscribe();
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return toast ? <Toast message={toast} onDismiss={dismissToast} /> : null;
}
