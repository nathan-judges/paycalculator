/**
 * Tax engine test suites — 2025-26.
 *
 * All expected values are sourced from the ATO fixture file.
 * See tests/boundary-verification.md for manual calculation workings.
 *
 * Rule: Do not generate expected test values from AI knowledge.
 * Only use the fixture or the boundary-verification file.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateTaxLiability,
  calculateLITO,
  calculateMedicareLevy,
  calculateMLS,
  calculateHECS,
  calculateSuper,
  calculateNetIncome,
} from '@/lib/engine/taxEngine';
import { getTaxConfig } from '@/lib/tax-config';
import fixture from '../../tests/fixtures/ato-2025-26.json';

const config = getTaxConfig('2025-26');

// ---------------------------------------------------------------------------
// calculateTaxLiability
// ---------------------------------------------------------------------------

describe('calculateTaxLiability', () => {
  const cases = fixture.taxLiability;

  describe('tax-free threshold', () => {
    it('returns $0 tax for income of $0', () => {
      const c = cases.find((c) => c.income === 0)!;
      const result = calculateTaxLiability(c.income, config);
      expect(result.grossTax).toBeCloseTo(c.expectedTax, 2);
    });

    it('returns $0 tax for income at tax-free threshold ($18,200)', () => {
      const c = cases.find((c) => c.income === 18200)!;
      const result = calculateTaxLiability(c.income, config);
      expect(result.grossTax).toBeCloseTo(c.expectedTax, 2);
    });

    it('returns tax for $1 above tax-free threshold ($18,201)', () => {
      const c = cases.find((c) => c.income === 18201)!;
      const result = calculateTaxLiability(c.income, config);
      expect(result.grossTax).toBeCloseTo(c.expectedTax, 2);
    });
  });

  describe('16% bracket ($18,201 – $45,000)', () => {
    it('calculates correctly at bracket midpoint ($30,000)', () => {
      const c = cases.find((c) => c.income === 30000)!;
      const result = calculateTaxLiability(c.income, config);
      expect(result.grossTax).toBeCloseTo(c.expectedTax, 2);
    });

    it('calculates correctly at bracket ceiling ($45,000)', () => {
      const c = cases.find((c) => c.income === 45000)!;
      const result = calculateTaxLiability(c.income, config);
      expect(result.grossTax).toBeCloseTo(c.expectedTax, 2);
    });
  });

  describe('30% bracket ($45,001 – $135,000)', () => {
    it('calculates correctly at $1 above bracket floor ($45,001)', () => {
      const c = cases.find((c) => c.income === 45001)!;
      const result = calculateTaxLiability(c.income, config);
      expect(result.grossTax).toBeCloseTo(c.expectedTax, 2);
    });

    it('calculates correctly at median salary ($90,000)', () => {
      const c = cases.find((c) => c.income === 90000)!;
      const result = calculateTaxLiability(c.income, config);
      expect(result.grossTax).toBeCloseTo(c.expectedTax, 2);
    });

    it('calculates correctly at bracket ceiling ($135,000)', () => {
      const c = cases.find((c) => c.income === 135000)!;
      const result = calculateTaxLiability(c.income, config);
      expect(result.grossTax).toBeCloseTo(c.expectedTax, 2);
    });
  });

  describe('37% bracket ($135,001 – $190,000)', () => {
    it('calculates correctly at $1 above bracket floor ($135,001)', () => {
      const c = cases.find((c) => c.income === 135001)!;
      const result = calculateTaxLiability(c.income, config);
      expect(result.grossTax).toBeCloseTo(c.expectedTax, 2);
    });

    it('calculates correctly at bracket ceiling ($190,000)', () => {
      const c = cases.find((c) => c.income === 190000)!;
      const result = calculateTaxLiability(c.income, config);
      expect(result.grossTax).toBeCloseTo(c.expectedTax, 2);
    });
  });

  describe('45% bracket ($190,001+)', () => {
    it('calculates correctly at $1 above bracket floor ($190,001)', () => {
      const c = cases.find((c) => c.income === 190001)!;
      const result = calculateTaxLiability(c.income, config);
      expect(result.grossTax).toBeCloseTo(c.expectedTax, 2);
    });

    it('calculates correctly at high income ($300,000)', () => {
      const c = cases.find((c) => c.income === 300000)!;
      const result = calculateTaxLiability(c.income, config);
      expect(result.grossTax).toBeCloseTo(c.expectedTax, 2);
    });
  });

  describe('structural', () => {
    it('returns a perBracket breakdown array', () => {
      const result = calculateTaxLiability(90000, config);
      expect(result.perBracket).toBeInstanceOf(Array);
      expect(result.perBracket.length).toBeGreaterThan(0);
    });

    it('perBracket taxes sum to grossTax', () => {
      const result = calculateTaxLiability(90000, config);
      const sum = result.perBracket.reduce((acc, b) => acc + b.tax, 0);
      expect(sum).toBeCloseTo(result.grossTax, 2);
    });

    it('handles negative income by treating as $0', () => {
      const result = calculateTaxLiability(-5000, config);
      expect(result.grossTax).toBe(0);
    });
  });
});

// ---------------------------------------------------------------------------
// calculateLITO
// ---------------------------------------------------------------------------

describe('calculateLITO', () => {
  const cases = fixture.lito;

  describe('full offset', () => {
    it('returns maximum $700 for income at $0', () => {
      const c = cases.find((c) => c.income === 0)!;
      expect(calculateLITO(c.income, config)).toBeCloseTo(c.expectedOffset, 2);
    });

    it('returns maximum $700 for income at $37,500', () => {
      const c = cases.find((c) => c.income === 37500)!;
      expect(calculateLITO(c.income, config)).toBeCloseTo(c.expectedOffset, 2);
    });
  });

  describe('first phase-out ($37,501 – $45,000 at 5c/$1)', () => {
    it('reduces correctly at $37,501', () => {
      const c = cases.find((c) => c.income === 37501)!;
      expect(calculateLITO(c.income, config)).toBeCloseTo(c.expectedOffset, 2);
    });

    it('reduces correctly at $40,000', () => {
      const c = cases.find((c) => c.income === 40000)!;
      expect(calculateLITO(c.income, config)).toBeCloseTo(c.expectedOffset, 2);
    });

    it('reaches $325 at exactly $45,000', () => {
      const c = cases.find((c) => c.income === 45000)!;
      expect(calculateLITO(c.income, config)).toBeCloseTo(c.expectedOffset, 2);
    });
  });

  describe('second phase-out ($45,001 – $66,667 at 1.5c/$1)', () => {
    it('reduces correctly at $45,001', () => {
      const c = cases.find((c) => c.income === 45001)!;
      expect(calculateLITO(c.income, config)).toBeCloseTo(c.expectedOffset, 3);
    });

    it('reduces correctly at $55,000', () => {
      const c = cases.find((c) => c.income === 55000)!;
      expect(calculateLITO(c.income, config)).toBeCloseTo(c.expectedOffset, 2);
    });

    it('reaches $0 at exactly $66,667', () => {
      const c = cases.find((c) => c.income === 66667)!;
      expect(calculateLITO(c.income, config)).toBeCloseTo(c.expectedOffset, 2);
    });
  });

  describe('above phase-out', () => {
    it('returns $0 for income at $100,000', () => {
      const c = cases.find((c) => c.income === 100000)!;
      expect(calculateLITO(c.income, config)).toBeCloseTo(c.expectedOffset, 2);
    });
  });
});

// ---------------------------------------------------------------------------
// calculateMedicareLevy
// ---------------------------------------------------------------------------

describe('calculateMedicareLevy', () => {
  const cases = fixture.medicareLevy;

  describe('exempt (below low-income threshold)', () => {
    it('returns $0 levy for income at $0', () => {
      const c = cases.find((c) => c.income === 0)!;
      const result = calculateMedicareLevy(c.income, config);
      expect(result.levy).toBeCloseTo(c.expectedLevy, 2);
      expect(result.isExempt).toBe(c.isExempt);
    });

    it('returns $0 levy for income at $27,222', () => {
      const c = cases.find((c) => c.income === 27222)!;
      const result = calculateMedicareLevy(c.income, config);
      expect(result.levy).toBeCloseTo(c.expectedLevy, 2);
      expect(result.isExempt).toBe(c.isExempt);
    });
  });

  describe('phase-in ($27,223 – $34,027 at 10c/$1)', () => {
    it('calculates phase-in at $27,223', () => {
      const c = cases.find((c) => c.income === 27223)!;
      const result = calculateMedicareLevy(c.income, config);
      expect(result.levy).toBeCloseTo(c.expectedLevy, 2);
      expect(result.isReduced).toBe(c.isReduced);
    });

    it('calculates phase-in at $30,000', () => {
      const c = cases.find((c) => c.income === 30000)!;
      const result = calculateMedicareLevy(c.income, config);
      expect(result.levy).toBeCloseTo(c.expectedLevy, 2);
      expect(result.isReduced).toBe(c.isReduced);
    });

    it('phase-in equals full levy at ceiling ($34,027)', () => {
      const c = cases.find((c) => c.income === 34027)!;
      const result = calculateMedicareLevy(c.income, config);
      expect(result.levy).toBeCloseTo(c.expectedLevy, 2);
      expect(result.isReduced).toBe(c.isReduced);
    });
  });

  describe('full levy (above $34,027)', () => {
    it('calculates full 2% levy at $50,000', () => {
      const c = cases.find((c) => c.income === 50000)!;
      const result = calculateMedicareLevy(c.income, config);
      expect(result.levy).toBeCloseTo(c.expectedLevy, 2);
      expect(result.isReduced).toBe(c.isReduced);
    });

    it('calculates full 2% levy at $90,000', () => {
      const c = cases.find((c) => c.income === 90000)!;
      const result = calculateMedicareLevy(c.income, config);
      expect(result.levy).toBeCloseTo(c.expectedLevy, 2);
      expect(result.isReduced).toBe(c.isReduced);
    });
  });
});

// ---------------------------------------------------------------------------
// calculateMLS
// ---------------------------------------------------------------------------

describe('calculateMLS', () => {
  const cases = fixture.mls;

  describe('with private health insurance', () => {
    it('returns $0 surcharge regardless of income', () => {
      const c = cases.find((c) => c.income === 200000 && c.hasPrivateHealth)!;
      const result = calculateMLS(c.income, c.hasPrivateHealth, config);
      expect(result.surcharge).toBeCloseTo(c.expectedSurcharge, 2);
      expect(result.rate).toBe(c.expectedRate);
    });
  });

  describe('without private health insurance (singles)', () => {
    it('returns $0 for income at or below $101,000', () => {
      const c = cases.find((c) => c.income === 101000 && !c.hasPrivateHealth)!;
      const result = calculateMLS(c.income, c.hasPrivateHealth, config);
      expect(result.surcharge).toBeCloseTo(c.expectedSurcharge, 2);
    });

    it('returns 1.0% for income at $101,001', () => {
      const c = cases.find((c) => c.income === 101001 && !c.hasPrivateHealth)!;
      const result = calculateMLS(c.income, c.hasPrivateHealth, config);
      expect(result.surcharge).toBeCloseTo(c.expectedSurcharge, 2);
      expect(result.rate).toBe(c.expectedRate);
    });

    it('returns 1.0% for income at $118,000', () => {
      const c = cases.find((c) => c.income === 118000 && !c.hasPrivateHealth)!;
      const result = calculateMLS(c.income, c.hasPrivateHealth, config);
      expect(result.surcharge).toBeCloseTo(c.expectedSurcharge, 2);
      expect(result.rate).toBe(c.expectedRate);
    });

    it('returns 1.25% for income at $118,001', () => {
      const c = cases.find((c) => c.income === 118001 && !c.hasPrivateHealth)!;
      const result = calculateMLS(c.income, c.hasPrivateHealth, config);
      expect(result.surcharge).toBeCloseTo(c.expectedSurcharge, 2);
      expect(result.rate).toBe(c.expectedRate);
    });

    it('returns 1.25% for income at $158,000', () => {
      const c = cases.find((c) => c.income === 158000 && !c.hasPrivateHealth)!;
      const result = calculateMLS(c.income, c.hasPrivateHealth, config);
      expect(result.surcharge).toBeCloseTo(c.expectedSurcharge, 2);
      expect(result.rate).toBe(c.expectedRate);
    });

    it('returns 1.5% for income at $158,001', () => {
      const c = cases.find((c) => c.income === 158001 && !c.hasPrivateHealth)!;
      const result = calculateMLS(c.income, c.hasPrivateHealth, config);
      expect(result.surcharge).toBeCloseTo(c.expectedSurcharge, 2);
      expect(result.rate).toBe(c.expectedRate);
    });

    it('returns 1.5% for income at $200,000', () => {
      const c = cases.find((c) => c.income === 200000 && !c.hasPrivateHealth)!;
      const result = calculateMLS(c.income, c.hasPrivateHealth, config);
      expect(result.surcharge).toBeCloseTo(c.expectedSurcharge, 2);
      expect(result.rate).toBe(c.expectedRate);
    });
  });
});

// ---------------------------------------------------------------------------
// calculateHECS
// ---------------------------------------------------------------------------

describe('calculateHECS', () => {
  const cases = fixture.hecs;

  describe('no HECS debt', () => {
    it('returns $0 when hasHecs is false', () => {
      const result = calculateHECS(90000, false, config);
      expect(result.repayment).toBe(0);
    });
  });

  describe('below minimum threshold', () => {
    it('returns $0 for repayment income at $0', () => {
      const c = cases.find((c) => c.income === 0)!;
      const result = calculateHECS(c.income, true, config);
      expect(result.repayment).toBeCloseTo(c.expectedRepayment, 2);
    });

    it('returns $0 for repayment income at $67,000', () => {
      const c = cases.find((c) => c.income === 67000)!;
      const result = calculateHECS(c.income, true, config);
      expect(result.repayment).toBeCloseTo(c.expectedRepayment, 2);
    });
  });

  describe('marginal tier 1 ($67,001 – $125,000 at 15c/$1)', () => {
    it('calculates repayment at $67,001', () => {
      const c = cases.find((c) => c.income === 67001)!;
      const result = calculateHECS(c.income, true, config);
      expect(result.repayment).toBeCloseTo(c.expectedRepayment, 2);
    });

    it('calculates repayment at $90,000', () => {
      const c = cases.find((c) => c.income === 90000)!;
      const result = calculateHECS(c.income, true, config);
      expect(result.repayment).toBeCloseTo(c.expectedRepayment, 2);
    });

    it('calculates repayment at $125,000', () => {
      const c = cases.find((c) => c.income === 125000)!;
      const result = calculateHECS(c.income, true, config);
      expect(result.repayment).toBeCloseTo(c.expectedRepayment, 2);
    });
  });

  describe('marginal tier 2 ($125,001 – $179,285 at 17c/$1 + $8,700)', () => {
    it('calculates repayment at $125,001', () => {
      const c = cases.find((c) => c.income === 125001)!;
      const result = calculateHECS(c.income, true, config);
      expect(result.repayment).toBeCloseTo(c.expectedRepayment, 2);
    });

    it('calculates repayment at $150,000', () => {
      const c = cases.find((c) => c.income === 150000)!;
      const result = calculateHECS(c.income, true, config);
      expect(result.repayment).toBeCloseTo(c.expectedRepayment, 2);
    });

    it('calculates repayment at $179,285', () => {
      const c = cases.find((c) => c.income === 179285)!;
      const result = calculateHECS(c.income, true, config);
      expect(result.repayment).toBeCloseTo(c.expectedRepayment, 2);
    });
  });

  describe('flat cap tier ($179,286+ at 10% of total)', () => {
    it('calculates repayment at $179,286', () => {
      const c = cases.find((c) => c.income === 179286)!;
      const result = calculateHECS(c.income, true, config);
      expect(result.repayment).toBeCloseTo(c.expectedRepayment, 2);
    });

    it('calculates repayment at $200,000', () => {
      const c = cases.find((c) => c.income === 200000)!;
      const result = calculateHECS(c.income, true, config);
      expect(result.repayment).toBeCloseTo(c.expectedRepayment, 2);
    });

    it('calculates repayment at $300,000', () => {
      const c = cases.find((c) => c.income === 300000)!;
      const result = calculateHECS(c.income, true, config);
      expect(result.repayment).toBeCloseTo(c.expectedRepayment, 2);
    });
  });
});

// ---------------------------------------------------------------------------
// calculateSuper
// ---------------------------------------------------------------------------

describe('calculateSuper', () => {
  const cases = fixture.super;

  describe('exclusive (super on top of salary)', () => {
    it('calculates super at 12% on $90,000 salary', () => {
      const c = cases.find((c) => c.salary === 90000 && !c.inclusive)!;
      const result = calculateSuper(c.salary, config.superRate, c.inclusive);
      expect(result.superAmount).toBeCloseTo(c.expectedSuper, 2);
      expect(result.taxableIncome).toBeCloseTo(c.expectedTaxableIncome, 2);
    });
  });

  describe('inclusive (super part of salary package)', () => {
    it('extracts super from $100,000 inclusive package', () => {
      const c = cases.find((c) => c.salary === 100000 && c.inclusive)!;
      const result = calculateSuper(c.salary, config.superRate, c.inclusive);
      expect(result.superAmount).toBeCloseTo(c.expectedSuper, 2);
      expect(result.taxableIncome).toBeCloseTo(c.expectedTaxableIncome, 2);
    });
  });

  describe('edge cases', () => {
    it('handles $0 salary', () => {
      const c = cases.find((c) => c.salary === 0)!;
      const result = calculateSuper(c.salary, config.superRate, c.inclusive);
      expect(result.superAmount).toBeCloseTo(c.expectedSuper, 2);
      expect(result.taxableIncome).toBeCloseTo(c.expectedTaxableIncome, 2);
    });
  });
});

// ---------------------------------------------------------------------------
// calculateNetIncome (integration / orchestrator)
// ---------------------------------------------------------------------------

describe('calculateNetIncome', () => {
  describe('default scenario ($90,000, no HECS, no private health, super exclusive)', () => {
    it('produces a complete breakdown with all fields', () => {
      const scenario = {
        id: 's1' as const,
        label: 'Test',
        salary: 90_000,
        superInclusive: false,
        hasHecs: false,
        hasPrivateHealth: false,
      };
      const result = calculateNetIncome(scenario, config);
      expect(result.grossSalary).toBe(90_000);
      expect(result.taxableIncome).toBe(90_000);
      expect(result.netAnnualIncome).toBeGreaterThan(0);
    });

    it('total deductions equal tax + Medicare + MLS + HECS', () => {
      const scenario = {
        id: 's1' as const,
        label: 'Test',
        salary: 90_000,
        superInclusive: false,
        hasHecs: false,
        hasPrivateHealth: false,
      };
      const result = calculateNetIncome(scenario, config);
      const expectedDeductions =
        result.taxAfterOffsets +
        result.medicareLevy.levy +
        result.mls.surcharge +
        result.hecs.repayment;
      expect(result.totalDeductions).toBeCloseTo(expectedDeductions, 2);
    });

    it('frequency calculations are mathematically consistent', () => {
      const scenario = {
        id: 's1' as const,
        label: 'Test',
        salary: 90_000,
        superInclusive: false,
        hasHecs: false,
        hasPrivateHealth: false,
      };
      const result = calculateNetIncome(scenario, config);
      expect(result.netPerFrequency.annual).toBeCloseTo(result.netAnnualIncome, 2);
      expect(result.netPerFrequency.weekly).toBeCloseTo(result.netAnnualIncome / 52, 2);
      expect(result.netPerFrequency.fortnightly).toBeCloseTo(result.netAnnualIncome / 26, 2);
      expect(result.netPerFrequency.monthly).toBeCloseTo(result.netAnnualIncome / 12, 2);
    });
  });

  describe('scenario with HECS', () => {
    it('HECS repayment reduces net income', () => {
      const withHecs = {
        id: 's1' as const,
        label: 'With HECS',
        salary: 90_000,
        superInclusive: false,
        hasHecs: true,
        hasPrivateHealth: false,
      };
      const withoutHecs = {
        id: 's2' as const,
        label: 'Without HECS',
        salary: 90_000,
        superInclusive: false,
        hasHecs: false,
        hasPrivateHealth: false,
      };
      const resultWithHecs = calculateNetIncome(withHecs, config);
      const resultWithoutHecs = calculateNetIncome(withoutHecs, config);
      expect(resultWithHecs.netAnnualIncome).toBeLessThan(resultWithoutHecs.netAnnualIncome);
      expect(resultWithHecs.hecs.repayment).toBeGreaterThan(0);
    });
  });

  describe('scenario with super inclusive', () => {
    it('super inclusive reduces taxable income', () => {
      const inclusive = {
        id: 's1' as const,
        label: 'Inclusive',
        salary: 100_000,
        superInclusive: true,
        hasHecs: false,
        hasPrivateHealth: false,
      };
      const exclusive = {
        id: 's2' as const,
        label: 'Exclusive',
        salary: 100_000,
        superInclusive: false,
        hasHecs: false,
        hasPrivateHealth: false,
      };
      const inclusiveResult = calculateNetIncome(inclusive, config);
      const exclusiveResult = calculateNetIncome(exclusive, config);
      expect(inclusiveResult.taxableIncome).toBeLessThan(exclusiveResult.taxableIncome);
    });
  });
});
