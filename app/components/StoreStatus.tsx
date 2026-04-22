/**
 * StoreStatus — debug/placeholder component showing current store state.
 *
 * Temporary component for verifying store integration.
 * Will be replaced by the full comparison UI in Week 3.
 */

'use client';

import { useComparisonStore } from '@/store/comparisonStore';

export function StoreStatus() {
  const scenarios = useComparisonStore((s) => s.scenarios);
  const financialYear = useComparisonStore((s) => s.financialYear);
  const displayFrequency = useComparisonStore((s) => s.displayFrequency);

  return (
    <div className="mt-8 rounded-lg border border-zinc-200 p-6 text-left text-sm dark:border-zinc-700">
      <h2 className="mb-3 text-base font-medium text-zinc-900 dark:text-zinc-100">
        Store Status
      </h2>
      <dl className="space-y-2 text-zinc-600 dark:text-zinc-400">
        <div className="flex justify-between">
          <dt>Financial Year</dt>
          <dd className="font-mono">{financialYear}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Display</dt>
          <dd className="font-mono">{displayFrequency}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Scenarios</dt>
          <dd className="font-mono">{scenarios.length}</dd>
        </div>
        {scenarios.map((s) => (
          <div key={s.id} className="flex justify-between pl-4 text-xs">
            <dt>{s.id}: {s.label}</dt>
            <dd className="font-mono">${s.salary.toLocaleString()}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
