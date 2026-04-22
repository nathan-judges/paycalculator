/**
 * ExportButton — downloads the current comparison as a CSV file.
 *
 * Reads the current AppState from the Zustand store, runs all scenarios
 * through the tax engine, and generates a UTF-8 CSV with one row per scenario.
 *
 * Security: scenario labels are sanitised to prevent CSV injection
 * (strips leading formula-injection chars and escapes internal quotes).
 *
 * Memory: URL.revokeObjectURL is always called after the download click
 * to prevent object-URL leaks.
 */

'use client';

import { useComparisonStore } from '@/store/comparisonStore';
import { getTaxConfig } from '@/lib/tax-config';
import { calculateNetIncome } from '@/lib/engine/taxEngine';
import type { AppState } from '@/lib/types';

// ---------------------------------------------------------------------------
// CSV helpers
// ---------------------------------------------------------------------------

/**
 * Sanitise a value for safe inclusion in a CSV cell.
 * - Wraps the value in double-quotes
 * - Escapes internal double-quotes by doubling them
 * - Strips leading formula-injection characters (=, +, -, @, tab, CR)
 */
function csvCell(value: string | number | boolean): string {
  const str = String(value);
  // Strip leading chars that spreadsheet apps treat as formula starters
  const sanitised = str.replace(/^[=+\-@\t\r]+/, '');
  // Escape internal double-quotes and wrap in quotes
  return `"${sanitised.replace(/"/g, '""')}"`;
}

/** Format a dollar amount as an unquoted number (for numeric CSV columns). */
function csvNumber(amount: number): string {
  return String(Math.round(amount));
}

// ---------------------------------------------------------------------------
// CSV generation
// ---------------------------------------------------------------------------

function generateCSV(state: AppState): string {
  const { scenarios, financialYear, displayFrequency } = state;
  const config = getTaxConfig(financialYear);

  const frequencyLabel: Record<AppState['displayFrequency'], string> = {
    weekly: 'Weekly',
    fortnightly: 'Fortnightly',
    monthly: 'Monthly',
    annual: 'Annual',
  };

  const headers = [
    'Scenario Label',
    'Salary',
    'Super Inclusive?',
    'HECS?',
    'Private Health?',
    'Financial Year',
    `Net Take-Home (${frequencyLabel[displayFrequency]})`,
  ];

  const rows = scenarios.map((scenario) => {
    const result = calculateNetIncome(scenario, config);
    return [
      csvCell(scenario.label),
      csvNumber(scenario.salary),
      csvCell(scenario.superInclusive ? 'Yes' : 'No'),
      csvCell(scenario.hasHecs ? 'Yes' : 'No'),
      csvCell(scenario.hasPrivateHealth ? 'Yes' : 'No'),
      csvCell(financialYear),
      csvNumber(result.netPerFrequency[displayFrequency]),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ExportButton() {
  function handleExport() {
    const storeState = useComparisonStore.getState();
    const state: AppState = {
      version: storeState.version,
      displayFrequency: storeState.displayFrequency,
      financialYear: storeState.financialYear,
      scenarios: storeState.scenarios,
    };

    const csv = generateCSV(state);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `salary-comparison-${state.financialYear}.csv`;
    anchor.click();

    // Revoke immediately after click to prevent memory leaks
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      id="export-csv-button"
      aria-label="Export as CSV"
      onClick={handleExport}
      className="
        inline-flex items-center gap-1.5 rounded-lg
        border border-zinc-200 bg-white px-3 py-2
        text-sm font-medium text-zinc-700
        transition-all duration-150
        hover:border-zinc-300 hover:bg-zinc-50
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
        dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300
        dark:hover:border-zinc-600 dark:hover:bg-zinc-700
      "
    >
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Export CSV
    </button>
  );
}
