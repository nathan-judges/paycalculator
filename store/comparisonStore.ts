/**
 * Zustand store for managing salary comparison scenarios.
 *
 * Uses `persist` middleware for localStorage persistence.
 * Validates rehydrated state with `AppStateSchema.safeParse` —
 * invalid or stale data is discarded in favour of defaults.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AppStateSchema,
  DEFAULT_APP_STATE,
  type AppState,
  type Scenario,
  type FinancialYear,
} from '@/lib/types';
import { getTaxConfig } from '@/lib/tax-config';
import { calculateNetIncome } from '@/lib/engine/taxEngine';

// ---------------------------------------------------------------------------
// Store state & action types
// ---------------------------------------------------------------------------

type DisplayFrequency = AppState['displayFrequency'];

interface ComparisonActions {
  /** Add a new scenario with default values. No-op if 2 scenarios already exist. */
  addScenario: () => void;
  /** Update fields on a specific scenario by ID. */
  updateScenario: (id: string, updates: Partial<Omit<Scenario, 'id'>>) => void;
  /** Remove a scenario by ID. No-op if only one scenario remains. */
  deleteScenario: (id: string) => void;
  /** Duplicate an existing scenario to the 's2' slot. No-op if 2 scenarios exist. */
  duplicateScenario: (id: string) => void;
  /** Set the global display frequency. */
  setDisplayFrequency: (freq: DisplayFrequency) => void;
  /** Set the global financial year. */
  setFinancialYear: (year: FinancialYear) => void;
  /** Replace entire state (used when loading from URL). */
  loadFromURL: (state: AppState) => void;
  /**
   * Compute the net annual income delta between scenarios.
   * Returns `s1.net - s2.net` (positive means s1 earns more).
   * Returns `null` if fewer than 2 scenarios exist.
   */
  activeComparisonDelta: () => number | null;
}

export type ComparisonStore = AppState & ComparisonActions;

// ---------------------------------------------------------------------------
// Default scenario for newly added slots
// ---------------------------------------------------------------------------

const DEFAULT_S2: Scenario = {
  id: 's2',
  label: 'New offer',
  salary: 90_000,
  superInclusive: false,
  hasHecs: false,
  hasPrivateHealth: false,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

/** localStorage key used by the persist middleware. */
export const STORAGE_KEY = 'pay-calculator-state';

export const useComparisonStore = create<ComparisonStore>()(
  persist(
    (set, get) => ({
      // --- Initial state (mirrors DEFAULT_APP_STATE) ---
      ...DEFAULT_APP_STATE,

      // --- Actions ---

      addScenario: () => {
        set((state) => {
          if (state.scenarios.length >= 2) return state;
          return { scenarios: [...state.scenarios, { ...DEFAULT_S2 }] };
        });
      },

      updateScenario: (id, updates) => {
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === id ? { ...s, ...updates, id } : s,
          ),
        }));
      },

      deleteScenario: (id) => {
        set((state) => {
          if (state.scenarios.length <= 1) return state;
          return { scenarios: state.scenarios.filter((s) => s.id !== id) };
        });
      },

      duplicateScenario: (id) => {
        set((state) => {
          if (state.scenarios.length >= 2) return state;
          const source = state.scenarios.find((s) => s.id === id);
          if (!source) return state;
          const newId = source.id === 's1' ? 's2' : 's1';
          return {
            scenarios: [
              ...state.scenarios,
              { ...source, id: newId, label: `${source.label} (copy)` },
            ],
          };
        });
      },

      setDisplayFrequency: (freq) => {
        set({ displayFrequency: freq });
      },

      setFinancialYear: (year) => {
        set({ financialYear: year });
      },

      loadFromURL: (appState) => {
        set({
          version: appState.version,
          displayFrequency: appState.displayFrequency,
          financialYear: appState.financialYear,
          scenarios: appState.scenarios,
        });
      },

      activeComparisonDelta: () => {
        const state = get();
        if (state.scenarios.length < 2) return null;

        const config = getTaxConfig(state.financialYear);
        const net1 = calculateNetIncome(state.scenarios[0], config).netAnnualIncome;
        const net2 = calculateNetIncome(state.scenarios[1], config).netAnnualIncome;
        return net1 - net2;
      },
    }),
    {
      name: STORAGE_KEY,

      /**
       * Validate persisted state on rehydration.
       * If the data doesn't match AppStateSchema, discard and use defaults.
       */
      merge: (persistedState, currentState) => {
        const result = AppStateSchema.safeParse(persistedState);
        if (result.success) {
          return { ...currentState, ...result.data };
        }
        // Invalid persisted data — discard silently
        return currentState;
      },

      /**
       * Only persist the data fields, not the action methods.
       */
      partialize: (state) => ({
        version: state.version,
        displayFrequency: state.displayFrequency,
        financialYear: state.financialYear,
        scenarios: state.scenarios,
      }),
    },
  ),
);
