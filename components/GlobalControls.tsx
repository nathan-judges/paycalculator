/**
 * GlobalControls — frequency and financial year selectors.
 *
 * Reads from and writes to the Zustand store.
 */

'use client';

import { useComparisonStore } from '@/store/comparisonStore';
import type { AppState } from '@/lib/types';
import type { FinancialYear } from '@/lib/types';

type DisplayFrequency = AppState['displayFrequency'];

const FREQUENCY_OPTIONS: { value: DisplayFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
];

const FY_OPTIONS: { value: FinancialYear; label: string }[] = [
  { value: '2025-26', label: '2025–26' },
  { value: '2026-27', label: '2026–27' },
];

export function GlobalControls() {
  const displayFrequency = useComparisonStore((s) => s.displayFrequency);
  const financialYear = useComparisonStore((s) => s.financialYear);
  const setDisplayFrequency = useComparisonStore((s) => s.setDisplayFrequency);
  const setFinancialYear = useComparisonStore((s) => s.setFinancialYear);

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Frequency selector */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="frequency-select"
          className="text-sm font-medium text-zinc-600 dark:text-zinc-400"
        >
          Display as
        </label>
        <select
          id="frequency-select"
          value={displayFrequency}
          onChange={(e) =>
            setDisplayFrequency(e.target.value as DisplayFrequency)
          }
          className="
            rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2
            text-sm font-medium text-zinc-900 outline-none
            transition-all duration-150
            hover:border-zinc-300
            focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20
            dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100
            dark:hover:border-zinc-600
            dark:focus:border-indigo-400 dark:focus:bg-zinc-900 dark:focus:ring-indigo-400/20
          "
        >
          {FREQUENCY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Financial year selector */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="fy-select"
          className="text-sm font-medium text-zinc-600 dark:text-zinc-400"
        >
          Financial year
        </label>
        <select
          id="fy-select"
          value={financialYear}
          onChange={(e) =>
            setFinancialYear(e.target.value as FinancialYear)
          }
          className="
            rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2
            text-sm font-medium text-zinc-900 outline-none
            transition-all duration-150
            hover:border-zinc-300
            focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20
            dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100
            dark:hover:border-zinc-600
            dark:focus:border-indigo-400 dark:focus:bg-zinc-900 dark:focus:ring-indigo-400/20
          "
        >
          {FY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
