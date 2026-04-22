/**
 * StickyFooter — persistent footer showing net take-home pay.
 *
 * Reads the first scenario's net income from the store and displays
 * it in a fixed-position bar at the bottom of the viewport.
 */

'use client';

import { useMemo } from 'react';
import { useComparisonStore } from '@/store/comparisonStore';
import { getTaxConfig } from '@/lib/tax-config';
import { calculateNetIncome } from '@/lib/engine/taxEngine';

/** Format a dollar amount for display. */
function formatCurrency(amount: number): string {
  return `$${Math.round(amount).toLocaleString('en-AU')}`;
}

/** Get the display label for a frequency. */
function frequencyLabel(freq: string): string {
  switch (freq) {
    case 'weekly':
      return 'per week';
    case 'fortnightly':
      return 'per fortnight';
    case 'monthly':
      return 'per month';
    case 'annual':
      return 'per year';
    default:
      return 'per year';
  }
}

export function StickyFooter() {
  const scenario = useComparisonStore((s) => s.scenarios[0]);
  const financialYear = useComparisonStore((s) => s.financialYear);
  const displayFrequency = useComparisonStore((s) => s.displayFrequency);

  const netPay = useMemo(() => {
    if (!scenario) return 0;
    const config = getTaxConfig(financialYear);
    const result = calculateNetIncome(scenario, config);
    return result.netPerFrequency[displayFrequency];
  }, [scenario, financialYear, displayFrequency]);

  return (
    <footer
      data-testid="sticky-footer"
      className="
        fixed bottom-0 left-0 right-0 z-40
        border-t border-zinc-200/80 bg-white/80 backdrop-blur-lg
        dark:border-zinc-700/80 dark:bg-zinc-900/80
      "
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Take-home pay
        </span>
        <span
          data-testid="footer-net-pay"
          className="text-lg font-bold text-emerald-700 dark:text-emerald-300"
        >
          {formatCurrency(netPay)}
          <span className="ml-1 text-sm font-normal text-zinc-600 dark:text-zinc-400">
            {frequencyLabel(displayFrequency)}
          </span>
        </span>
      </div>
    </footer>
  );
}
