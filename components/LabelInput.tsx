/**
 * LabelInput — text input for scenario labels.
 *
 * Enforces a 30-character maximum (matching ScenarioSchema).
 */

'use client';

import { useCallback } from 'react';

interface LabelInputProps {
  /** Current label value. */
  value: string;
  /** Callback when the label changes. */
  onChange: (value: string) => void;
  /** Optional HTML id for the input element. */
  id?: string;
}

export function LabelInput({ value, onChange, id }: LabelInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value.slice(0, 30));
    },
    [onChange],
  );

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id ?? 'label-input'}
        className="text-sm font-medium text-zinc-600 dark:text-zinc-400"
      >
        Scenario label
      </label>
      <input
        id={id ?? 'label-input'}
        type="text"
        value={value}
        onChange={handleChange}
        maxLength={30}
        placeholder="e.g. Current salary"
        aria-label="Scenario label"
        className="
          w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5
          text-sm text-zinc-900 outline-none
          transition-all duration-150
          placeholder:text-zinc-400
          hover:border-zinc-300
          focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20
          dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100
          dark:hover:border-zinc-600
          dark:focus:border-indigo-400 dark:focus:bg-zinc-900 dark:focus:ring-indigo-400/20
        "
      />
    </div>
  );
}
