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
// Calculation functions
// ---------------------------------------------------------------------------

/**
 * Calculates gross income tax liability using progressive brackets.
 * Does NOT include offsets (LITO) — those are applied separately.
 */
export function calculateTaxLiability(
  taxableIncome: number,
  config: TaxConfig,
): TaxLiabilityResult {
  const income = Math.max(0, taxableIncome);
  const perBracket: TaxLiabilityResult['perBracket'] = [];
  let grossTax = 0;

  for (const bracket of config.incomeTaxBrackets) {
    if (income < bracket.min) {
      // Income doesn't reach this bracket
      perBracket.push({
        min: bracket.min,
        max: bracket.max,
        rate: bracket.rate,
        taxable: 0,
        tax: 0,
      });
      continue;
    }

    // How much of the income falls within this bracket
    const bracketMax = Math.min(income, bracket.max);
    const taxable = bracketMax - bracket.min + 1;
    const tax = taxable * bracket.rate;

    perBracket.push({
      min: bracket.min,
      max: bracket.max,
      rate: bracket.rate,
      taxable,
      tax,
    });

    grossTax += tax;
  }

  return { grossTax, perBracket };
}

/**
 * Calculates the Low Income Tax Offset.
 * Returns a non-negative number (the offset reduces tax, never increases it).
 */
export function calculateLITO(
  taxableIncome: number,
  config: TaxConfig,
): number {
  const { lito } = config;

  // Below or at the full offset threshold — return maximum
  if (taxableIncome <= lito.fullOffsetThreshold) {
    return lito.maxOffset;
  }

  // Walk through the phase-out stages
  for (const stage of lito.phaseOut) {
    if (taxableIncome >= stage.startIncome && taxableIncome <= stage.endIncome) {
      const excess = taxableIncome - stage.startIncome + 1;
      const reduction = excess * stage.reductionRate;
      return Math.max(0, stage.offsetAtStart - reduction);
    }
  }

  // Above all phase-out stages — offset is nil
  return 0;
}

/**
 * Calculates the Medicare levy, including low-income phase-in.
 * Assumes single taxpayer with no dependants.
 */
export function calculateMedicareLevy(
  taxableIncome: number,
  config: TaxConfig,
): MedicareLevyResult {
  const { medicare } = config;

  // Below or at the low-income threshold — fully exempt
  if (taxableIncome <= medicare.lowIncomeThreshold) {
    return { levy: 0, isExempt: true, isReduced: false };
  }

  // Phase-in range: levy = (income - threshold) × phaseInRate
  // But capped at the full levy amount
  const fullLevy = taxableIncome * medicare.levyRate;
  const phaseInLevy =
    (taxableIncome - medicare.lowIncomeThreshold) * medicare.phaseInRate;

  if (phaseInLevy < fullLevy) {
    return { levy: phaseInLevy, isExempt: false, isReduced: true };
  }

  // Full levy applies
  return { levy: fullLevy, isExempt: false, isReduced: false };
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
  if (hasPrivateHealth) {
    return { surcharge: 0, rate: 0, tier: null };
  }

  const tierNames = [null, 'Tier 1', 'Tier 2', 'Tier 3'];

  for (let i = 0; i < config.mlsTiers.length; i++) {
    const tier = config.mlsTiers[i];
    if (incomeForMLS >= tier.min && incomeForMLS <= tier.max) {
      const surcharge = incomeForMLS * tier.rate;
      return {
        surcharge,
        rate: tier.rate,
        tier: tier.rate === 0 ? null : tierNames[i] ?? `Tier ${i}`,
      };
    }
  }

  return { surcharge: 0, rate: 0, tier: null };
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
  if (!hasHecs) {
    return { repayment: 0, effectiveRate: 0 };
  }

  for (const threshold of config.hecsThresholds) {
    if (repaymentIncome >= threshold.min && repaymentIncome <= threshold.max) {
      if (threshold.rate === 0) {
        return { repayment: 0, effectiveRate: 0 };
      }

      let repayment: number;

      if (threshold.isFlatPercentage) {
        // Flat percentage of total repayment income
        repayment = repaymentIncome * threshold.rate;
      } else {
        // Marginal: base amount + rate × (income − tier minimum + 1)
        const excess = repaymentIncome - threshold.min + 1;
        repayment = threshold.baseAmount + excess * threshold.rate;
      }

      const effectiveRate = repaymentIncome > 0 ? repayment / repaymentIncome : 0;
      return { repayment, effectiveRate };
    }
  }

  return { repayment: 0, effectiveRate: 0 };
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
  if (inclusive) {
    // Super is part of the package — extract it
    const baseSalary = salary;
    const taxableIncome = Math.round((salary / (1 + superRate)) * 100) / 100;
    const superAmount = Math.round((salary - taxableIncome) * 100) / 100;
    return { superAmount, baseSalary, taxableIncome };
  }

  // Super is on top — salary is the taxable income
  const superAmount = Math.round(salary * superRate * 100) / 100;
  return { superAmount, baseSalary: salary, taxableIncome: salary };
}

/**
 * Orchestrator: calculates the complete net income breakdown for a single scenario.
 * Calls all other functions and assembles the final result.
 */
export function calculateNetIncome(
  scenario: Scenario,
  config: TaxConfig,
): NetIncomeResult {
  // 1. Calculate super and determine taxable income
  const superResult = calculateSuper(
    scenario.salary,
    config.superRate,
    scenario.superInclusive,
  );

  const taxableIncome = superResult.taxableIncome;

  // 2. Calculate income tax liability (before offsets)
  const taxLiability = calculateTaxLiability(taxableIncome, config);

  // 3. Calculate LITO
  const litoOffset = calculateLITO(taxableIncome, config);

  // 4. Tax after offsets (cannot be negative)
  const taxAfterOffsets = Math.max(0, taxLiability.grossTax - litoOffset);

  // 5. Medicare levy
  const medicareLevy = calculateMedicareLevy(taxableIncome, config);

  // 6. Medicare Levy Surcharge
  const mls = calculateMLS(taxableIncome, scenario.hasPrivateHealth, config);

  // 7. HECS-HELP repayment
  const hecs = calculateHECS(taxableIncome, scenario.hasHecs, config);

  // 8. Total deductions
  const totalDeductions =
    taxAfterOffsets +
    medicareLevy.levy +
    mls.surcharge +
    hecs.repayment;

  // 9. Net annual income
  const netAnnualIncome = taxableIncome - totalDeductions;

  // 10. Frequency breakdowns
  const netPerFrequency = {
    weekly: Math.round((netAnnualIncome / 52) * 100) / 100,
    fortnightly: Math.round((netAnnualIncome / 26) * 100) / 100,
    monthly: Math.round((netAnnualIncome / 12) * 100) / 100,
    annual: Math.round(netAnnualIncome * 100) / 100,
  };

  return {
    grossSalary: scenario.salary,
    taxableIncome,
    super: superResult,
    taxLiability,
    litoOffset,
    taxAfterOffsets,
    medicareLevy,
    mls,
    hecs,
    totalDeductions,
    netAnnualIncome,
    netPerFrequency,
  };
}
