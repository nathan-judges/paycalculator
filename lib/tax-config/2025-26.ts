/**
 * ATO-verified tax configuration for the 2025-26 financial year.
 *
 * Sources:
 * - Income tax brackets: https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents
 * - LITO: https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/tax-offsets/low-income-tax-offset
 * - Medicare levy: https://www.ato.gov.au/individuals-and-families/medicare-and-private-health-insurance/medicare-levy
 * - MLS: https://www.ato.gov.au/individuals-and-families/medicare-and-private-health-insurance/medicare-levy-surcharge
 * - HECS-HELP: https://www.ato.gov.au/tax-rates-and-codes/study-and-training-support-loans-rates-and-thresholds
 * - Super guarantee: https://www.ato.gov.au/tax-rates-and-codes/key-superannuation-rates-and-thresholds/super-guarantee
 */

import type { TaxConfig } from './index';

export const taxConfig2025_26: TaxConfig = {
  financialYear: '2025-26',

  incomeTaxBrackets: [
    { min: 0, max: 18_200, rate: 0 },
    { min: 18_201, max: 45_000, rate: 0.16 },
    { min: 45_001, max: 135_000, rate: 0.30 },
    { min: 135_001, max: 190_000, rate: 0.37 },
    { min: 190_001, max: Infinity, rate: 0.45 },
  ],

  lito: {
    maxOffset: 700,
    fullOffsetThreshold: 37_500,
    phaseOut: [
      {
        startIncome: 37_501,
        endIncome: 45_000,
        reductionRate: 0.05,
        offsetAtStart: 700,
      },
      {
        startIncome: 45_001,
        endIncome: 66_667,
        reductionRate: 0.015,
        offsetAtStart: 325,
      },
    ],
  },

  medicare: {
    levyRate: 0.02,
    lowIncomeThreshold: 27_222,
    phaseInCeiling: 34_027,
    phaseInRate: 0.10,
  },

  mlsTiers: [
    { min: 0, max: 101_000, rate: 0 },
    { min: 101_001, max: 118_000, rate: 0.01 },
    { min: 118_001, max: 158_000, rate: 0.0125 },
    { min: 158_001, max: Infinity, rate: 0.015 },
  ],

  hecsThresholds: [
    { min: 0, max: 67_000, rate: 0, baseAmount: 0, isFlatPercentage: false },
    { min: 67_001, max: 125_000, rate: 0.15, baseAmount: 0, isFlatPercentage: false },
    { min: 125_001, max: 179_285, rate: 0.17, baseAmount: 8_700, isFlatPercentage: false },
    { min: 179_286, max: Infinity, rate: 0.10, baseAmount: 0, isFlatPercentage: true },
  ],

  superRate: 0.12,

  lastVerifiedAgainstATO: '2026-04-22',
};
