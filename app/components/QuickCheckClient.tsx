/**
 * QuickCheckClient — client-side wrapper for the Quick Check / Comparison page.
 *
 * Renders:
 * - UnverifiedFYBanner (if applicable)
 * - Header with branding + export/share toolbar
 * - GlobalControls (frequency + FY selectors)
 * - ComparisonGrid (handles 1 or 2 scenarios)
 * - "Compare with another offer" button (only when 1 scenario exists)
 * - StickyFooter showing net take-home for scenario s1
 */

'use client';

import { useState } from 'react';
import { useComparisonStore } from '@/store/comparisonStore';
import { GlobalControls } from '@/components/GlobalControls';
import { ComparisonGrid } from '@/components/ComparisonGrid';
import { StickyFooter } from '@/components/StickyFooter';
import { ExportButton } from '@/components/ExportButton';
import { ShareButton } from '@/components/ShareButton';
import { UnverifiedFYBanner } from '@/components/UnverifiedFYBanner';
import { UserSurvey } from '@/components/UserSurvey';
import { DevMetricsExportButton } from '@/components/DevMetricsExportButton';
import { SalaryInput } from '@/components/SalaryInput';
import { OnboardingTooltip } from '@/components/OnboardingTooltip';

export function QuickCheckClient() {
  const scenarios = useComparisonStore((s) => s.scenarios);
  const duplicateScenario = useComparisonStore((s) => s.duplicateScenario);
  const financialYear = useComparisonStore((s) => s.financialYear);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const hasTwoScenarios = scenarios.length >= 2;
  const printDate = new Date().toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-zinc-950">
      {/* ── Unverified financial year warning ─────────────────────── */}
      <UnverifiedFYBanner />

      {/* ── Header ───────────────────────────────────────────────── */}
      <header
        data-print-date={printDate}
        data-print-fy={financialYear}
        className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-900/80"
      >
        <div className="mx-auto max-w-5xl px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Salary Calculator
              </h1>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                Australian take-home pay calculator
              </p>
            </div>
            {/* Export / Share toolbar */}
            <div className="flex shrink-0 items-center gap-2">
              <ExportButton />
              <ShareButton />
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-6 pb-24">
        <section
          className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
          aria-labelledby="salary-input-heading"
        >
          <h2
            id="salary-input-heading"
            className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-300"
          >
            Start by entering your annual salary
          </h2>
          <SalaryInput
            scenarioId="s1"
            inputId="salary-input"
            onUserInteracted={() => setHasUserInteracted(true)}
          />
          <OnboardingTooltip targetId="salary-input" />
        </section>

        {/* Global controls */}
        <div className="mb-6">
          <GlobalControls />
        </div>

        {/* Scenario grid (handles 1 or 2 scenarios) */}
        <div className="mb-6">
          <ComparisonGrid />
        </div>

        {/* Compare button — only shown when 1 scenario exists */}
        {!hasTwoScenarios && (
          <button
            type="button"
            id="compare-button"
            data-testid="compare-cta"
            data-touch-target="true"
            onClick={() => duplicateScenario('s1')}
            disabled={!hasUserInteracted}
            aria-disabled={!hasUserInteracted}
            className="
              group flex w-full items-center justify-center gap-2
              rounded-xl border-2 border-dashed border-zinc-300 bg-transparent
              px-6 py-4 text-sm font-medium text-zinc-500
              transition-all duration-200
              hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600
              disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100/60 disabled:text-zinc-400
              dark:border-zinc-700 dark:text-zinc-400
              dark:hover:border-indigo-500 dark:hover:bg-indigo-900/10 dark:hover:text-indigo-400
              dark:disabled:border-zinc-800 dark:disabled:bg-zinc-900/80 dark:disabled:text-zinc-600
            "
          >
            <span>Compare with another offer</span>
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </button>
        )}

        <UserSurvey />
        <DevMetricsExportButton />
      </main>

      {/* Sticky footer: hidden in single-scenario mode to avoid duplicate net-pay displays */}
      {hasTwoScenarios ? <StickyFooter /> : null}
    </div>
  );
}
