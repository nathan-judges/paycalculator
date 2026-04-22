/**
 * ComparisonGrid — renders one or two ScenarioCards side-by-side.
 *
 * Single scenario:
 *   Renders only the s1 ScenarioCard. No delta badge or tab switcher.
 *
 * Two scenarios — mobile (below md breakpoint):
 *   Renders a MobileTabSwitcher above the active card.
 *   The inactive card is rendered but hidden via Tailwind's `hidden md:block`.
 *   A DeltaBadge is shown above the switcher.
 *
 * Two scenarios — desktop (md and above):
 *   Renders both ScenarioCards in a two-column grid.
 *   A DeltaBadge is centred between the cards.
 *   The MobileTabSwitcher is hidden via `md:hidden`.
 *
 * All tax delta calculations go through the store's activeComparisonDelta() —
 * no direct engine calls here (per .cursorrules rule 9).
 */

'use client';

import { useState } from 'react';
import { useComparisonStore } from '@/store/comparisonStore';
import { ScenarioCard } from './ScenarioCard';
import { DeltaBadge } from './DeltaBadge';
import { MobileTabSwitcher } from './MobileTabSwitcher';

export function ComparisonGrid() {
  const scenarios = useComparisonStore((s) => s.scenarios);
  const activeComparisonDelta = useComparisonStore((s) => s.activeComparisonDelta);

  const [activeTab, setActiveTab] = useState<'s1' | 's2'>('s1');

  const hasTwoScenarios = scenarios.length >= 2;
  // Call the delta getter — returns null when < 2 scenarios
  const delta = hasTwoScenarios ? activeComparisonDelta() : null;

  // Labels for the tab switcher — use scenario labels if available
  const s1Label = scenarios[0]?.label ?? 'Current';
  const s2Label = scenarios[1]?.label ?? 'Offer';
  const tabLabels: [string, string] = [s1Label, s2Label];

  // ── Single-scenario layout ─────────────────────────────────────────────
  if (!hasTwoScenarios) {
    return (
      <div data-testid="comparison-grid">
        <ScenarioCard scenarioId="s1" />
      </div>
    );
  }

  // ── Two-scenario layout ────────────────────────────────────────────────
  return (
    <div data-testid="comparison-grid">
      {/* Delta badge — shown above tab switcher on mobile, above grid on desktop */}
      <div className="mb-4 flex justify-center">
        {delta !== null && <DeltaBadge delta={delta} />}
      </div>

      {/* Tab switcher — hidden on desktop (md:hidden) */}
      <div className="mb-4 md:hidden">
        <MobileTabSwitcher
          activeScenarioId={activeTab}
          onSwitch={setActiveTab}
          labels={tabLabels}
        />
      </div>

      {/*
       * Card grid.
       *
       * On mobile: each card wrapper is `hidden md:block` unless it matches
       * the active tab. The active card's wrapper removes `hidden`.
       *
       * On desktop (md+): both wrappers are forced visible via `md:block`,
       * and the grid-cols-2 layout applies.
       */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* s1 card */}
        <div
          data-mobile-card
          className={`${activeTab === 's1' ? 'block' : 'hidden'} md:block`}
        >
          <ScenarioCard scenarioId="s1" />
        </div>

        {/* s2 card */}
        <div
          data-mobile-card
          className={`${activeTab === 's2' ? 'block' : 'hidden'} md:block`}
        >
          <ScenarioCard scenarioId="s2" />
        </div>
      </div>
    </div>
  );
}
