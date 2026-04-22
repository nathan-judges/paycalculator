import { z } from 'zod';

/**
 * Financial year identifiers supported by the application.
 * New years should be added here as they become available.
 */
export const FinancialYearSchema = z.enum(['2025-26', '2026-27']);
export type FinancialYear = z.infer<typeof FinancialYearSchema>;

/**
 * A single salary scenario for comparison.
 * IDs are constrained to 's1' or 's2' — short and stable for URL encoding.
 */
export const ScenarioSchema = z.object({
  id: z.string().regex(/^s[12]$/),
  label: z.string().min(1).max(30).default('Job'),
  salary: z.number().min(0).default(90_000),
  superInclusive: z.boolean().default(false),
  hasHecs: z.boolean().default(false),
  hasPrivateHealth: z.boolean().default(false),
});

export type Scenario = z.infer<typeof ScenarioSchema>;

/**
 * Top-level application state.
 * - `version` enables future schema migrations during URL parsing.
 * - `financialYear` is global — applies to all scenarios.
 * - `displayFrequency` controls how results are presented (weekly, fortnightly, monthly, annual).
 */
export const AppStateSchema = z.object({
  version: z.literal(1),
  displayFrequency: z
    .enum(['weekly', 'fortnightly', 'monthly', 'annual'])
    .default('annual'),
  financialYear: FinancialYearSchema.default('2025-26'),
  scenarios: z.array(ScenarioSchema).min(1).max(2),
});

export type AppState = z.infer<typeof AppStateSchema>;

/**
 * Default single-scenario state used when the app loads fresh
 * (no URL state, no localStorage).
 */
export const DEFAULT_APP_STATE: AppState = {
  version: 1,
  displayFrequency: 'annual',
  financialYear: '2025-26',
  scenarios: [
    {
      id: 's1',
      label: 'Current salary',
      salary: 90_000,
      superInclusive: false,
      hasHecs: false,
      hasPrivateHealth: false,
    },
  ],
};
