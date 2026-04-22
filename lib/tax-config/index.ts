/**
 * Tax configuration type definitions and lookup utility.
 *
 * Each financial year has its own config file (e.g., 2025-26.ts).
 * This module provides the shared types and a centralised lookup function.
 */

import type { FinancialYear } from '@/lib/types';

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

/** A single income tax bracket boundary. */
export interface TaxBracket {
  /** Lower bound of the bracket (inclusive). */
  min: number;
  /** Upper bound of the bracket (inclusive). Use Infinity for the top bracket. */
  max: number;
  /** Marginal tax rate as a decimal (e.g., 0.30 = 30%). */
  rate: number;
}

/** Low Income Tax Offset configuration. */
export interface LITOConfig {
  /** Maximum offset amount in dollars. */
  maxOffset: number;
  /** Income threshold below which the full offset applies. */
  fullOffsetThreshold: number;
  /** Phase-out stages. Each stage reduces the offset from `startIncome` to `endIncome` at `reductionRate` cents per dollar. */
  phaseOut: Array<{
    startIncome: number;
    endIncome: number;
    /** Reduction rate as a decimal (e.g., 0.05 = 5 cents per dollar). */
    reductionRate: number;
    /** Offset value at the start of this phase-out stage. */
    offsetAtStart: number;
  }>;
}

/** Medicare levy configuration. */
export interface MedicareConfig {
  /** Standard Medicare levy rate as a decimal (e.g., 0.02 = 2%). */
  levyRate: number;
  /** Taxable income at or below which no levy is payable (singles). */
  lowIncomeThreshold: number;
  /** Taxable income above which the full levy applies (singles). */
  phaseInCeiling: number;
  /** Phase-in rate as a decimal (e.g., 0.10 = 10 cents per dollar over threshold). */
  phaseInRate: number;
}

/** Medicare Levy Surcharge tier (singles only, no private hospital cover). */
export interface MLSTier {
  /** Lower bound of income for MLS purposes (inclusive). */
  min: number;
  /** Upper bound (inclusive). Use Infinity for the top tier. */
  max: number;
  /** Surcharge rate as a decimal (e.g., 0.01 = 1%). */
  rate: number;
}

/** HECS-HELP repayment threshold (marginal system from 2025-26). */
export interface HECSThreshold {
  /** Lower bound of repayment income (inclusive). */
  min: number;
  /** Upper bound (inclusive). Use Infinity for the top threshold. */
  max: number;
  /**
   * For marginal tiers: rate per dollar over the tier minimum (e.g., 0.15 = 15 cents per dollar).
   * For the cap tier: percentage of total repayment income (e.g., 0.10 = 10%).
   */
  rate: number;
  /** Base amount payable at the start of this tier (cumulative from lower tiers). */
  baseAmount: number;
  /** Whether this tier uses a flat percentage of total income instead of marginal calculation. */
  isFlatPercentage: boolean;
}

/** Complete tax configuration for a financial year. */
export interface TaxConfig {
  /** Financial year identifier (e.g., '2025-26'). */
  financialYear: FinancialYear;
  /** Income tax brackets, ordered from lowest to highest. */
  incomeTaxBrackets: TaxBracket[];
  /** Low Income Tax Offset configuration. */
  lito: LITOConfig;
  /** Medicare levy configuration (singles). */
  medicare: MedicareConfig;
  /** Medicare Levy Surcharge tiers (singles, no private hospital cover). */
  mlsTiers: MLSTier[];
  /** HECS-HELP repayment thresholds (marginal system). */
  hecsThresholds: HECSThreshold[];
  /** Superannuation guarantee rate as a decimal (e.g., 0.12 = 12%). */
  superRate: number;
  /**
   * Date when this config was last verified against official ATO publications.
   * `null` means the rates are legislated but not yet ATO-verified.
   */
  lastVerifiedAgainstATO: string | null;
}

// ---------------------------------------------------------------------------
// Config registry & lookup
// ---------------------------------------------------------------------------

import { taxConfig2025_26 } from './2025-26';
import { taxConfig2026_27 } from './2026-27';

const configs: Record<FinancialYear, TaxConfig> = {
  '2025-26': taxConfig2025_26,
  '2026-27': taxConfig2026_27,
};

/**
 * Returns the tax configuration for the given financial year.
 * Throws if the year is not supported.
 */
export function getTaxConfig(year: FinancialYear): TaxConfig {
  const config = configs[year];
  if (!config) {
    throw new Error(`Tax config not available for financial year: ${year}`);
  }
  return config;
}

/**
 * Returns whether the config for a given year has been ATO-verified.
 */
export function isATOVerified(year: FinancialYear): boolean {
  return getTaxConfig(year).lastVerifiedAgainstATO !== null;
}
