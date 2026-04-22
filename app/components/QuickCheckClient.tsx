/**
 * QuickCheckClient — client-side wrapper for the Quick Check page.
 *
 * This component is a client component that renders the main UI:
 * - GlobalControls at the top
 * - ScenarioCard for 's1' (starts expanded)
 * - Placeholder compare button (Week 4)
 * - StickyFooter
 */

'use client';

import { useState } from 'react';
import { GlobalControls } from '@/components/GlobalControls';
import { ScenarioCard } from '@/components/ScenarioCard';
import { StickyFooter } from '@/components/StickyFooter';

export function QuickCheckClient() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-zinc-950">
      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-900/80">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Salary Calculator
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            Australian take-home pay calculator
          </p>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-6 pb-24">
        {/* Global controls */}
        <div className="mb-6">
          <GlobalControls />
        </div>

        {/* Scenario card */}
        <div className="mb-6">
          <ScenarioCard
            scenarioId="s1"
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded((prev) => !prev)}
          />
        </div>

        {/* Compare placeholder (Week 4) */}
        <button
          type="button"
          onClick={() => {
            // eslint-disable-next-line no-console
            console.log('Compare with another offer — coming in Week 4');
          }}
          className="
            group flex w-full items-center justify-center gap-2
            rounded-xl border-2 border-dashed border-zinc-300 bg-transparent
            px-6 py-4 text-sm font-medium text-zinc-500
            transition-all duration-200
            hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600
            dark:border-zinc-700 dark:text-zinc-400
            dark:hover:border-indigo-500 dark:hover:bg-indigo-900/10 dark:hover:text-indigo-400
          "
        >
          <span>Compare with another offer</span>
          <span
            className="
              transition-transform duration-200
              group-hover:translate-x-0.5
            "
          >
            →
          </span>
        </button>
      </main>

      {/* Sticky footer */}
      <StickyFooter />
    </div>
  );
}
