/**
 * DeltaBadge — displays the net annual income delta between two scenarios.
 *
 * Props:
 *   delta  – signed annual difference in dollars (s1.net − s2.net).
 *            Positive → s1 earns more (green). Negative → s2 earns more (red). Zero → neutral.
 *
 * The displayed amount is divided by the global displayFrequency divisor so the
 * user sees the delta in the same frequency as the rest of the app.
 *
 * No tax calculations are performed here — the caller is responsible for passing
 * a pre-computed annual delta (e.g. from the store's activeComparisonDelta()).
 */

'use client';

import { useMemo } from 'react';
import { useComparisonStore } from '@/store/comparisonStore';
import type { AppState } from '@/lib/types';

type DisplayFrequency = AppState['displayFrequency'];

interface DeltaBadgeProps {
  /** Signed annual dollar difference (s1.net − s2.net). */
  delta: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DIVISORS: Record<DisplayFrequency, number> = {
  annual: 1,
  monthly: 12,
  fortnightly: 26,
  weekly: 52,
};

const FREQ_LABELS: Record<DisplayFrequency, string> = {
  annual: 'year',
  monthly: 'month',
  fortnightly: 'fortnight',
  weekly: 'week',
};

function formatAmount(amount: number): string {
  return `$${Math.round(Math.abs(amount)).toLocaleString('en-AU')}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DeltaBadge({ delta }: DeltaBadgeProps) {
  const displayFrequency = useComparisonStore((s) => s.displayFrequency);

  const { displayAmount, sign, colourClasses } = useMemo(() => {
    const divisor = DIVISORS[displayFrequency];
    const perFreq = delta / divisor;

    let sign = '';
    let colourClasses = 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';

    if (delta > 0) {
      sign = '+';
      colourClasses =
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
    } else if (delta < 0) {
      sign = '–'; // en-dash (not hyphen)
      colourClasses = 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
    }

    return {
      displayAmount: formatAmount(perFreq),
      sign,
      colourClasses,
    };
  }, [delta, displayFrequency]);

  const label = FREQ_LABELS[displayFrequency];

  return (
    <span
      data-testid="delta-badge"
      className={`
        inline-flex items-center gap-1 rounded-full px-3 py-1
        text-sm font-semibold tabular-nums
        ${colourClasses}
      `}
    >
      {sign}
      {displayAmount}/{label}
    </span>
  );
}
