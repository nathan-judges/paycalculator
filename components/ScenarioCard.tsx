/**
 * ScenarioCard — the core UI component for a single salary scenario.
 *
 * Shows a summary (label, salary, net take-home) in collapsed view.
 * Expands inline to reveal editing controls (salary, toggles, label).
 *
 * All tax calculations go through lib/engine/taxEngine.ts — no direct
 * calculation in this component (per .cursorrules rule 9).
 */

'use client';

import { useMemo, useCallback, useState } from 'react';
import { useComparisonStore } from '@/store/comparisonStore';
import { getTaxConfig } from '@/lib/tax-config';
import { calculateNetIncome } from '@/lib/engine/taxEngine';
import { EditableSalaryInput } from './EditableSalaryInput';
import { ToggleSwitch } from './ToggleSwitch';
import { LabelInput } from './LabelInput';
import { Tooltip } from './Tooltip';

interface ScenarioCardProps {
  /** The scenario ID to display ('s1' or 's2'). */
  scenarioId: 's1' | 's2';
  /** Whether the card is expanded to show editing controls. */
  isExpanded?: boolean;
  /** Callback to toggle expanded state. */
  onToggleExpand?: () => void;
}

/** Format a dollar amount for display. */
function formatCurrency(amount: number): string {
  return `$${Math.round(amount).toLocaleString('en-AU')}`;
}

/** Get the frequency suffix for display. */
function frequencySuffix(freq: string): string {
  switch (freq) {
    case 'weekly':
      return '/week';
    case 'fortnightly':
      return '/fortnight';
    case 'monthly':
      return '/month';
    case 'annual':
      return '/year';
    default:
      return '/year';
  }
}

export function ScenarioCard({
  scenarioId,
  isExpanded: isExpandedProp,
  onToggleExpand,
}: ScenarioCardProps) {
  // Internal expanded state (used when not controlled externally)
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = isExpandedProp ?? internalExpanded;

  const scenario = useComparisonStore((s) =>
    s.scenarios.find((sc) => sc.id === scenarioId),
  );
  const financialYear = useComparisonStore((s) => s.financialYear);
  const displayFrequency = useComparisonStore((s) => s.displayFrequency);
  const updateScenario = useComparisonStore((s) => s.updateScenario);

  // Calculate net income via the tax engine
  const netIncomeResult = useMemo(() => {
    if (!scenario) return null;
    const config = getTaxConfig(financialYear);
    return calculateNetIncome(scenario, config);
  }, [scenario, financialYear]);

  const netPay = useMemo(() => {
    if (!netIncomeResult) return 0;
    return netIncomeResult.netPerFrequency[displayFrequency];
  }, [netIncomeResult, displayFrequency]);

  const handleToggleExpand = useCallback(() => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded((prev) => !prev);
    }
  }, [onToggleExpand]);

  if (!scenario) {
    return null;
  }

  return (
    <div
      data-testid={`scenario-card-${scenarioId}`}
      className="
        rounded-xl border border-zinc-200 bg-white p-6
        shadow-sm transition-shadow duration-200
        hover:shadow-md
        dark:border-zinc-700 dark:bg-zinc-900
      "
    >
      {/* ── Summary row (always visible) ─────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 truncate">
            {scenario.label}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {formatCurrency(scenario.salary)}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Take-home
          </p>
          <p
            data-testid="net-pay"
            aria-live="polite"
            className="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-300"
          >
            {formatCurrency(netPay)}
            <span className="ml-1 text-sm font-normal text-zinc-600 dark:text-zinc-400">
              {frequencySuffix(displayFrequency)}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggleExpand}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Collapse' : 'Edit'}
          className="
            ml-2 min-h-[44px] min-w-[44px] rounded-lg px-4 py-2 text-sm font-medium
            transition-all duration-150
            bg-zinc-100 text-zinc-700
            hover:bg-zinc-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
            dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700
          "
        >
          {isExpanded ? 'Done' : 'Edit'}
        </button>
      </div>

      {/* ── Expanded editing view ────────────────────────────────────── */}
      {isExpanded && (
        <div
          data-testid="expanded-inputs"
          className="
            mt-6 space-y-5 border-t border-zinc-100 pt-6
            transition-all duration-300
            dark:border-zinc-800
          "
        >
          <LabelInput
            id={`${scenarioId}-label`}
            value={scenario.label}
            onChange={(label) => updateScenario(scenarioId, { label })}
          />

          <EditableSalaryInput
            id={`${scenarioId}-salary`}
            value={scenario.salary}
            onChange={(salary) => updateScenario(scenarioId, { salary })}
            label="Annual salary"
          />

          <div className="space-y-3">
            <Tooltip
              triggerTestId="tooltip-trigger-super"
              text="Inclusive means super comes out of this salary. Exclusive means super is on top."
            >
              <ToggleSwitch
                id={`${scenarioId}-super`}
                label="Salary includes super"
                checked={scenario.superInclusive}
                onChange={(superInclusive) =>
                  updateScenario(scenarioId, { superInclusive })
                }
              />
            </Tooltip>

            <Tooltip
              triggerTestId="tooltip-trigger-hecs"
              text="Your student loan repayment. Calculated on repayment income above $67,000."
            >
              <ToggleSwitch
                id={`${scenarioId}-hecs`}
                label="HECS-HELP debt"
                checked={scenario.hasHecs}
                onChange={(hasHecs) =>
                  updateScenario(scenarioId, { hasHecs })
                }
              />
            </Tooltip>

            <Tooltip
              triggerTestId="tooltip-trigger-health"
              text="If you have private hospital cover, you may avoid the Medicare Levy Surcharge."
            >
              <ToggleSwitch
                id={`${scenarioId}-health`}
                label="Private health insurance"
                checked={scenario.hasPrivateHealth}
                onChange={(hasPrivateHealth) =>
                  updateScenario(scenarioId, { hasPrivateHealth })
                }
              />
            </Tooltip>
          </div>

          {/* ── Detailed breakdown (collapsed mini-table) ──────────── */}
          {netIncomeResult && (
            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Breakdown (annual)
              </p>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400">Taxable income</dt>
                  <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(netIncomeResult.taxableIncome)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400">Income tax</dt>
                  <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                    −{formatCurrency(netIncomeResult.taxAfterOffsets)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400">Medicare levy</dt>
                  <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                    −{formatCurrency(netIncomeResult.medicareLevy.levy)}
                  </dd>
                </div>
                {netIncomeResult.mls.surcharge > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-zinc-500 dark:text-zinc-400">MLS</dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                      −{formatCurrency(netIncomeResult.mls.surcharge)}
                    </dd>
                  </div>
                )}
                {netIncomeResult.hecs.repayment > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-zinc-500 dark:text-zinc-400">HECS repayment</dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                      −{formatCurrency(netIncomeResult.hecs.repayment)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-zinc-200 pt-1 dark:border-zinc-700">
                  <dt className="font-semibold text-zinc-700 dark:text-zinc-200">Super contribution</dt>
                  <dd className="font-bold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(netIncomeResult.super.superAmount)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-zinc-200 pt-1 dark:border-zinc-700">
                  <dt className="font-semibold text-emerald-700 dark:text-emerald-300">Net take-home</dt>
                  <dd className="font-bold text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(netIncomeResult.netAnnualIncome)}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
