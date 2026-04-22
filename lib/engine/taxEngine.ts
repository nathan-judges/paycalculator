/**
 * Australian Tax Engine — Pure calculation functions.
 *
 * RULES (from .cursorrules):
 * - All functions must be pure — no side effects.
 * - No component should calculate tax directly; all calculations go through this module.
 * - All tax rates come from lib/tax-config/ — never hardcoded here.
 */

import type { TaxConfig } from '@/lib/tax-config';
import type { Scenario } from '@/lib/types';

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

/** Breakdown of income tax liability before offsets. */
export interface TaxLiabilityResult {
  /** Total tax before any offsets (LITO, etc.). */
  grossTax: number;
  /** Tax payable per bracket, for display purposes. */
  perBracket: Array<{
    min: number;
    max: number;
    rate: number;
    taxable: number;
    tax: number;
  }>;
}

/** Medicare levy result with phase-in details. */
export interface MedicareLevyResult {
  /** Medicare levy amount payable. */
  levy: number;
  /** Whether the levy was reduced under the low-income phase-in. */
  isReduced: boolean;
  /** Whether the taxpayer is fully exempt (below threshold). */
  isExempt: boolean;
}

/** Medicare Levy Surcharge result. */
export interface MLSResult {
  /** Surcharge amount payable. */
  surcharge: number;
  /** The MLS rate applied (0 if exempt or has private health). */
  rate: number;
  /** The tier name for display (e.g., 'Tier 1', 'Tier 2', 'Tier 3'). */
  tier: string | null;
}

/** HECS-HELP repayment result. */
export interface HECSResult {
  /** Annual repayment amount. */
  repayment: number;
  /** Effective repayment rate as a decimal. */
  effectiveRate: number;
}

/** Superannuation calculation result. */
export interface SuperResult {
  /** Super contribution amount. */
  superAmount: number;
  /** Base salary (before or after super, depending on inclusive flag). */
  baseSalary: number;
  /** The salary used for tax calculations (excludes super). */
  taxableIncome: number;
}

/** Complete net income breakdown for a single scenario. */
export interface NetIncomeResult {
  /** Gross salary (as entered by the user). */
  grossSalary: number;
  /** Taxable income (after super extraction if inclusive). */
  taxableIncome: number;
  /** Superannuation details. */
  super: SuperResult;
  /** Income tax liability (before LITO). */
  taxLiability: TaxLiabilityResult;
  /** Low Income Tax Offset amount. */
  litoOffset: number;
  /** Tax payable after LITO (cannot be negative). */
  taxAfterOffsets: number;
  /** Medicare levy. */
  medicareLevy: MedicareLevyResult;
  /** Medicare Levy Surcharge. */
  mls: MLSResult;
  /** HECS-HELP repayment. */
  hecs: HECSResult;
  /** Total deductions (tax after offsets + Medicare + MLS + HECS). */
  totalDeductions: number;
  /** Net annual income (taxable income − total deductions). */
  netAnnualIncome: number;
  /** Net income per display frequency. */
  netPerFrequency: {
    weekly: number;
    fortnightly: number;
    monthly: number;
    annual: number;
  };
}

// ---------------------------------------------------------------------------
// Calculation functions — signatures only
// ---------------------------------------------------------------------------

/**
 * Calculates gross income tax liability using progressive brackets.
 * Does NOT include offsets (LITO) — those are applied separately.
 */
export function calculateTaxLiability(
  taxableIncome: number,
  config: TaxConfig,
): TaxLiabilityResult {
  throw new Error('Not yet implemented');
}

/**
 * Calculates the Low Income Tax Offset.
 * Returns a non-negative number (the offset reduces tax, never increases it).
 */
export function calculateLITO(
  taxableIncome: number,
  config: TaxConfig,
): number {
  throw new Error('Not yet implemented');
}

/**
 * Calculates the Medicare levy, including low-income phase-in.
 * Assumes single taxpayer with no dependants.
 */
export function calculateMedicareLevy(
  taxableIncome: number,
  config: TaxConfig,
): MedicareLevyResult {
  throw new Error('Not yet implemented');
}

/**
 * Calculates the Medicare Levy Surcharge for singles without private hospital cover.
 * If `hasPrivateHealth` is true, MLS is zero.
 */
export function calculateMLS(
  incomeForMLS: number,
  hasPrivateHealth: boolean,
  config: TaxConfig,
): MLSResult {
  throw new Error('Not yet implemented');
}

/**
 * Calculates HECS-HELP compulsory repayment using marginal rates (2025-26+).
 * If `hasHecs` is false, repayment is zero.
 */
export function calculateHECS(
  repaymentIncome: number,
  hasHecs: boolean,
  config: TaxConfig,
): HECSResult {
  throw new Error('Not yet implemented');
}

/**
 * Calculates superannuation — handles both inclusive and exclusive treatment.
 * - Exclusive: super is on top of salary → taxable income = salary
 * - Inclusive: super is part of salary → taxable income = salary / (1 + superRate)
 */
export function calculateSuper(
  salary: number,
  superRate: number,
  inclusive: boolean,
): SuperResult {
  throw new Error('Not yet implemented');
}

/**
 * Orchestrator: calculates the complete net income breakdown for a single scenario.
 * Calls all other functions and assembles the final result.
 */
export function calculateNetIncome(
  scenario: Scenario,
  config: TaxConfig,
): NetIncomeResult {
  throw new Error('Not yet implemented');
}
