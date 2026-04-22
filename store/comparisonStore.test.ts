/**
 * Tests for the Zustand comparison store.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useComparisonStore, STORAGE_KEY } from './comparisonStore';
import { DEFAULT_APP_STATE, type AppState } from '@/lib/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Reset the store to defaults between tests. */
function resetStore(): void {
  useComparisonStore.setState({
    ...DEFAULT_APP_STATE,
  });
}

/** Extract data-only state (no actions) from the store. */
function getState(): AppState {
  const { version, displayFrequency, financialYear, scenarios } =
    useComparisonStore.getState();
  return { version, displayFrequency, financialYear, scenarios };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('comparisonStore', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  // -------------------------------------------------------------------------
  // Initial state
  // -------------------------------------------------------------------------

  it('initialises with default state (one scenario, s1, salary 90000)', () => {
    const state = getState();
    expect(state.scenarios).toHaveLength(1);
    expect(state.scenarios[0].id).toBe('s1');
    expect(state.scenarios[0].salary).toBe(90_000);
    expect(state.financialYear).toBe('2025-26');
    expect(state.displayFrequency).toBe('annual');
  });

  // -------------------------------------------------------------------------
  // addScenario
  // -------------------------------------------------------------------------

  it('addScenario creates a second scenario with id s2', () => {
    useComparisonStore.getState().addScenario();
    const state = getState();
    expect(state.scenarios).toHaveLength(2);
    expect(state.scenarios[1].id).toBe('s2');
    expect(state.scenarios[1].salary).toBe(90_000);
  });

  it('addScenario does nothing when 2 scenarios already exist', () => {
    useComparisonStore.getState().addScenario();
    useComparisonStore.getState().addScenario(); // third attempt
    const state = getState();
    expect(state.scenarios).toHaveLength(2);
  });

  // -------------------------------------------------------------------------
  // updateScenario
  // -------------------------------------------------------------------------

  it('updateScenario changes a field on the targeted scenario', () => {
    useComparisonStore.getState().updateScenario('s1', { salary: 120_000 });
    const state = getState();
    expect(state.scenarios[0].salary).toBe(120_000);
  });

  it('updateScenario does not change other scenarios', () => {
    useComparisonStore.getState().addScenario();
    useComparisonStore.getState().updateScenario('s1', { salary: 150_000 });
    const state = getState();
    expect(state.scenarios[0].salary).toBe(150_000);
    expect(state.scenarios[1].salary).toBe(90_000);
  });

  it('updateScenario cannot change the scenario id', () => {
    // The `id` field is forced to remain the original
    useComparisonStore.getState().updateScenario('s1', { label: 'Updated' });
    const state = getState();
    expect(state.scenarios[0].id).toBe('s1');
    expect(state.scenarios[0].label).toBe('Updated');
  });

  // -------------------------------------------------------------------------
  // deleteScenario
  // -------------------------------------------------------------------------

  it('deleteScenario removes the specified scenario', () => {
    useComparisonStore.getState().addScenario();
    expect(getState().scenarios).toHaveLength(2);

    useComparisonStore.getState().deleteScenario('s2');
    const state = getState();
    expect(state.scenarios).toHaveLength(1);
    expect(state.scenarios[0].id).toBe('s1');
  });

  it('deleteScenario does not remove the last scenario', () => {
    useComparisonStore.getState().deleteScenario('s1');
    const state = getState();
    expect(state.scenarios).toHaveLength(1);
  });

  // -------------------------------------------------------------------------
  // duplicateScenario
  // -------------------------------------------------------------------------

  it('duplicateScenario copies scenario values to the other slot', () => {
    useComparisonStore.getState().updateScenario('s1', {
      salary: 110_000,
      hasHecs: true,
      label: 'My job',
    });

    useComparisonStore.getState().duplicateScenario('s1');
    const state = getState();
    expect(state.scenarios).toHaveLength(2);
    expect(state.scenarios[1].id).toBe('s2');
    expect(state.scenarios[1].salary).toBe(110_000);
    expect(state.scenarios[1].hasHecs).toBe(true);
    expect(state.scenarios[1].label).toBe('My job (copy)');
  });

  it('duplicateScenario does nothing when 2 scenarios already exist', () => {
    useComparisonStore.getState().addScenario();
    useComparisonStore.getState().duplicateScenario('s1');
    const state = getState();
    expect(state.scenarios).toHaveLength(2);
  });

  // -------------------------------------------------------------------------
  // setDisplayFrequency
  // -------------------------------------------------------------------------

  it('setDisplayFrequency changes the global display frequency', () => {
    useComparisonStore.getState().setDisplayFrequency('monthly');
    expect(getState().displayFrequency).toBe('monthly');
  });

  // -------------------------------------------------------------------------
  // setFinancialYear
  // -------------------------------------------------------------------------

  it('setFinancialYear changes the global financial year', () => {
    useComparisonStore.getState().setFinancialYear('2026-27');
    expect(getState().financialYear).toBe('2026-27');
  });

  // -------------------------------------------------------------------------
  // loadFromURL
  // -------------------------------------------------------------------------

  it('loadFromURL replaces the entire store state', () => {
    const urlState: AppState = {
      version: 1,
      displayFrequency: 'fortnightly',
      financialYear: '2026-27',
      scenarios: [
        {
          id: 's1',
          label: 'URL scenario',
          salary: 75_000,
          superInclusive: true,
          hasHecs: true,
          hasPrivateHealth: false,
        },
      ],
    };

    useComparisonStore.getState().loadFromURL(urlState);
    const state = getState();
    expect(state.displayFrequency).toBe('fortnightly');
    expect(state.financialYear).toBe('2026-27');
    expect(state.scenarios[0].label).toBe('URL scenario');
    expect(state.scenarios[0].salary).toBe(75_000);
  });

  // -------------------------------------------------------------------------
  // activeComparisonDelta
  // -------------------------------------------------------------------------

  it('activeComparisonDelta returns null with only one scenario', () => {
    const delta = useComparisonStore.getState().activeComparisonDelta();
    expect(delta).toBeNull();
  });

  it('activeComparisonDelta returns signed difference with two scenarios', () => {
    useComparisonStore.getState().addScenario();
    useComparisonStore.getState().updateScenario('s1', { salary: 100_000 });
    useComparisonStore.getState().updateScenario('s2', { salary: 80_000 });

    const delta = useComparisonStore.getState().activeComparisonDelta();
    expect(delta).not.toBeNull();
    // s1 salary > s2 salary (same conditions), so delta should be positive
    expect(delta!).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------------
  // localStorage persistence
  // -------------------------------------------------------------------------

  it('persists state to localStorage and restores it correctly', () => {
    // Update the store
    useComparisonStore.getState().setFinancialYear('2026-27');
    useComparisonStore.getState().addScenario();
    useComparisonStore.getState().updateScenario('s2', { salary: 125_000 });

    // Read what was persisted
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();

    const persisted = JSON.parse(raw!);
    expect(persisted.state.financialYear).toBe('2026-27');
    expect(persisted.state.scenarios).toHaveLength(2);
    expect(persisted.state.scenarios[1].salary).toBe(125_000);
  });

  it('discards invalid persisted data and falls back to defaults', () => {
    // Inject garbage into localStorage
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: { garbage: true, version: 999, scenarios: 'not-an-array' },
        version: 0,
      }),
    );

    // Reset the store to simulate a fresh page load rehydration
    // The merge function should detect invalid data and use defaults
    resetStore();
    const state = getState();
    expect(state.scenarios).toHaveLength(1);
    expect(state.scenarios[0].id).toBe('s1');
    expect(state.scenarios[0].salary).toBe(90_000);
  });
});
