'use client';

import { useCallback, useEffect, useState } from 'react';
import { useComparisonStore } from '@/store/comparisonStore';

interface SalaryInputProps {
  scenarioId?: 's1' | 's2';
  inputId?: string;
  autoFocus?: boolean;
  onUserInteracted?: () => void;
}

function formatSalary(value: number): string {
  return value.toLocaleString('en-AU');
}

function toSanitisedNumber(value: string): number {
  const digitsOnly = value.replace(/[^\d]/g, '');
  if (!digitsOnly) return 0;
  return Number.parseInt(digitsOnly, 10);
}

export function SalaryInput({
  scenarioId = 's1',
  inputId = 'salary-input',
  autoFocus = true,
  onUserInteracted,
}: SalaryInputProps) {
  const scenario = useComparisonStore((s) =>
    s.scenarios.find((item) => item.id === scenarioId),
  );
  const updateScenario = useComparisonStore((s) => s.updateScenario);
  const [displayValue, setDisplayValue] = useState(
    formatSalary(scenario?.salary ?? 0),
  );

  useEffect(() => {
    setDisplayValue(formatSalary(scenario?.salary ?? 0));
  }, [scenario?.salary]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextSalary = toSanitisedNumber(event.target.value);
      setDisplayValue(formatSalary(nextSalary));
      updateScenario(scenarioId, { salary: nextSalary });
      onUserInteracted?.();
    },
    [onUserInteracted, scenarioId, updateScenario],
  );

  return (
    <div className="space-y-1">
      <label
        htmlFor={inputId}
        className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
      >
        Annual salary
      </label>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
        >
          $
        </span>
        <input
          id={inputId}
          data-testid="salary-input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoFocus={autoFocus}
          value={displayValue}
          onChange={handleChange}
          aria-label="Annual salary"
          className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-8 pr-3 text-xl font-semibold text-zinc-900 shadow-sm transition-all duration-150 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/25"
        />
      </div>
    </div>
  );
}
