/**
 * ToggleSwitch — accessible toggle switch component.
 *
 * Uses `role="switch"` with `aria-checked` for accessibility.
 * Styled with Tailwind — animated slider thumb.
 */

'use client';

interface ToggleSwitchProps {
  /** Label displayed beside the toggle. */
  label: string;
  /** Whether the toggle is checked (on). */
  checked: boolean;
  /** Callback when the toggle state changes. */
  onChange: (checked: boolean) => void;
  /** Optional HTML id for the toggle button. */
  id?: string;
}

export function ToggleSwitch({
  label,
  checked,
  onChange,
  id,
}: ToggleSwitchProps) {
  const toggleId = id ?? `toggle-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="flex items-center justify-between gap-3">
      <label
        htmlFor={toggleId}
        className="text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer select-none"
      >
        {label}
      </label>
      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer
          rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
          dark:focus-visible:ring-offset-zinc-900
          ${checked
            ? 'bg-indigo-600 dark:bg-indigo-500'
            : 'bg-zinc-200 dark:bg-zinc-700'
          }
        `}
      >
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-5 w-5
            rounded-full bg-white shadow-lg ring-0
            transition-transform duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
}
