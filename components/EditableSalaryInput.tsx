/**
 * EditableSalaryInput — formatted currency input for salary editing.
 *
 * Displays the value as $XX,XXX when blurred.
 * On focus, shows the raw number for easy editing.
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface EditableSalaryInputProps {
  /** Current salary value in dollars. */
  value: number;
  /** Callback when the value changes (receives the numeric value). */
  onChange: (value: number) => void;
  /** Optional label displayed above the input. */
  label?: string;
  /** Optional HTML id for the input element. */
  id?: string;
}

/** Format a number as Australian dollars (e.g., $90,000). */
function formatAUD(value: number): string {
  return `$${value.toLocaleString('en-AU')}`;
}

export function EditableSalaryInput({
  value,
  onChange,
  label,
  id,
}: EditableSalaryInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [rawValue, setRawValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync rawValue when external value changes (and input is not focused)
  useEffect(() => {
    if (!isFocused) {
      setRawValue(String(value));
    }
  }, [value, isFocused]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setRawValue(String(value));
    // Select all text on focus for easy replacement
    requestAnimationFrame(() => {
      inputRef.current?.select();
    });
  }, [value]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const parsed = parseFloat(rawValue.replace(/[^0-9.]/g, ''));
    const sanitised = isNaN(parsed) ? 0 : Math.max(0, Math.round(parsed));
    setRawValue(String(sanitised));
    onChange(sanitised);
  }, [rawValue, onChange]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRawValue(e.target.value);
    },
    [],
  );

  const inputId = id ?? 'salary-input';

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-zinc-600 dark:text-zinc-400"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {!isFocused && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
            $
          </span>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type={isFocused ? 'number' : 'text'}
          inputMode="numeric"
          value={isFocused ? rawValue : formatAUD(value).replace('$', '')}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          aria-label={label ?? 'Salary'}
          className={`
            w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5
            text-base font-medium text-zinc-900 outline-none
            transition-all duration-150
            placeholder:text-zinc-400
            hover:border-zinc-300
            focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20
            dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100
            dark:hover:border-zinc-600
            dark:focus:border-indigo-400 dark:focus:bg-zinc-900 dark:focus:ring-indigo-400/20
            ${!isFocused ? 'pl-7' : ''}
          `}
        />
      </div>
    </div>
  );
}
