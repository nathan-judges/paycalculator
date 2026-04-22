/**
 * Tax configuration for the 2026-27 financial year.
 *
 * LEGISLATED BUT NOT YET ATO-VERIFIED.
 *
 * Only change from 2025-26: the $18,201–$45,000 bracket drops from 16% to 15%.
 * All other rates, thresholds, and offsets are assumed unchanged pending ATO confirmation.
 *
 * Source: Treasury Laws Amendment (Tax Cuts for Every Worker No. 2) Act 2025
 * https://budget.gov.au
 */

import type { TaxConfig } from './index';

export const taxConfig2026_27: TaxConfig = {
  financialYear: '2026-27',

  incomeTaxBrackets: [
    { min: 0, max: 18_200, rate: 0 },
    { min: 18_201, max: 45_000, rate: 0.15 }, // Changed: 16% → 15%
    { min: 45_001, max: 135_000, rate: 0.30 },
    { min: 135_001, max: 190_000, rate: 0.37 },
    { min: 190_001, max: Infinity, rate: 0.45 },
  ],

  // LITO: assumed unchanged pending ATO confirmation
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

  // Medicare: assumed unchanged pending ATO confirmation
  medicare: {
    levyRate: 0.02,
    lowIncomeThreshold: 27_222,
    phaseInCeiling: 34_027,
    phaseInRate: 0.10,
  },

  // MLS: assumed unchanged pending ATO confirmation
  mlsTiers: [
    { min: 0, max: 101_000, rate: 0 },
    { min: 101_001, max: 118_000, rate: 0.01 },
    { min: 118_001, max: 158_000, rate: 0.0125 },
    { min: 158_001, max: Infinity, rate: 0.015 },
  ],

  // HECS: assumed unchanged pending ATO confirmation
  hecsThresholds: [
    { min: 0, max: 67_000, rate: 0, baseAmount: 0, isFlatPercentage: false },
    { min: 67_001, max: 125_000, rate: 0.15, baseAmount: 0, isFlatPercentage: false },
    { min: 125_001, max: 179_285, rate: 0.17, baseAmount: 8_700, isFlatPercentage: false },
    { min: 179_286, max: Infinity, rate: 0.10, baseAmount: 0, isFlatPercentage: true },
  ],

  superRate: 0.12,

  // NOT YET ATO-VERIFIED — rates are legislated only
  lastVerifiedAgainstATO: null,
};
