/**
 * StickyFooter — component tests.
 *
 * Tests rendering of the correct net pay from the store.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useComparisonStore } from '@/store/comparisonStore';
import { getTaxConfig } from '@/lib/tax-config';
import { calculateNetIncome } from '@/lib/engine/taxEngine';
import { StickyFooter } from './StickyFooter';

beforeEach(() => {
  act(() => {
    useComparisonStore.setState({
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
    });
  });
});

describe('StickyFooter', () => {
  it('renders the correct annual net pay', () => {
    // Calculate expected net pay using the engine
    const scenario = useComparisonStore.getState().scenarios[0];
    const config = getTaxConfig('2025-26');
    const result = calculateNetIncome(scenario, config);
    const expectedAnnual = Math.round(result.netPerFrequency.annual);

    render(<StickyFooter />);

    const footerNetPay = screen.getByTestId('footer-net-pay');
    expect(footerNetPay).toBeInTheDocument();
    expect(footerNetPay.textContent).toContain(
      `$${expectedAnnual.toLocaleString('en-AU')}`,
    );
  });

  it('updates when the store changes', () => {
    render(<StickyFooter />);

    const footerNetPay = screen.getByTestId('footer-net-pay');
    const initialText = footerNetPay.textContent;

    // Change salary in the store
    act(() => {
      useComparisonStore.getState().updateScenario('s1', { salary: 150_000 });
    });

    // Net pay should update
    expect(footerNetPay.textContent).not.toBe(initialText);
  });

  it('displays "per year" for annual frequency', () => {
    render(<StickyFooter />);

    expect(screen.getByText(/per year/i)).toBeInTheDocument();
  });

  it('displays "per week" when frequency is weekly', () => {
    act(() => {
      useComparisonStore.getState().setDisplayFrequency('weekly');
    });

    render(<StickyFooter />);

    expect(screen.getByText(/per week/i)).toBeInTheDocument();
  });

  it('shows the Take-home pay label', () => {
    render(<StickyFooter />);
    expect(screen.getByText('Take-home pay')).toBeInTheDocument();
  });
});
