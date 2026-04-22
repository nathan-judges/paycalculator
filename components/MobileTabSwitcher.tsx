/**
 * MobileTabSwitcher — tab bar for switching between scenarios on mobile.
 *
 * Props:
 *   activeScenarioId  – currently active tab ('s1' or 's2')
 *   onSwitch          – callback fired with the target scenario id on tab click
 *   labels            – optional tuple to override the default ["Current", "Offer"] labels
 *
 * Visible only on small screens (md:hidden applied by the parent ComparisonGrid).
 */

'use client';

interface MobileTabSwitcherProps {
  activeScenarioId: 's1' | 's2';
  onSwitch: (id: 's1' | 's2') => void;
  /** Override default tab labels. Index 0 = s1, index 1 = s2. */
  labels?: [string, string];
}

const SCENARIO_IDS = ['s1', 's2'] as const;
const DEFAULT_LABELS: [string, string] = ['Current', 'Offer'];

export function MobileTabSwitcher({
  activeScenarioId,
  onSwitch,
  labels = DEFAULT_LABELS,
}: MobileTabSwitcherProps) {
  return (
    <div
      data-testid="mobile-tab-switcher"
      role="tablist"
      aria-label="Scenario tabs"
      className="flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800"
    >
      {SCENARIO_IDS.map((id, index) => {
        const isActive = id === activeScenarioId;
        return (
          <button
            key={id}
            data-testid={id === 's1' ? 'tab-s1' : 'tab-s2'}
            data-touch-target="true"
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSwitch(id)}
            className={`
              flex-1 min-h-[44px] rounded-lg px-4 py-2 text-sm font-medium
              transition-all duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
              ${
                isActive
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-zinc-700 dark:text-indigo-300'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }
            `}
          >
            {labels[index]}
          </button>
        );
      })}
    </div>
  );
}
