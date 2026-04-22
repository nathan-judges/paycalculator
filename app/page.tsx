/**
 * Quick Check page — single-scenario salary calculator.
 *
 * Renders the main Quick Check UI with:
 * - Global controls (frequency, financial year) at the top
 * - A single ScenarioCard for scenario 's1' (starts expanded)
 * - A placeholder "Compare" button for Week 4
 * - A StickyFooter showing net take-home pay
 *
 * StateSync handles URL ↔ store synchronisation (kept from Week 2).
 */

import { StateSync } from './components/StateSync';
import { QuickCheckClient } from './components/QuickCheckClient';

export default function Home() {
  return (
    <>
      <StateSync />
      <QuickCheckClient />
    </>
  );
}
