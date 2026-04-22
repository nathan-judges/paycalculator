/**
 * DeltaBadge — component tests.
 *
 * Tests colour coding and formatted text for positive, negative, and zero deltas.
 * Also confirms the display frequency from the store is reflected in the unit label.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useComparisonStore } from '@/store/comparisonStore';
import { DeltaBadge } from './DeltaBadge';

const BASE_STATE = {
  version: 1 as const,
  displayFrequency: 'annual' as const,
  financialYear: '2025-26' as const,
  scenarios: [
    {
      id: 's1' as const,
      label: 'Current salary',
      salary: 90_000,
      superInclusive: false,
      hasHecs: false,
      hasPrivateHealth: false,
    },
  ],
};

beforeEach(() => {
  act(() => {
    useComparisonStore.setState(BASE_STATE);
  });
});

describe('DeltaBadge', () => {
  it('renders positive delta with green styling and correct text', () => {
    render(<DeltaBadge delta={2_400} />);

    const badge = screen.getByTestId('delta-badge');
    expect(badge).toBeInTheDocument();
    // Should have a green colour class
    expect(badge.className).toMatch(/emerald/);
    // Should show the positive sign and formatted amount
    expect(badge.textContent).toMatch(/\+\$2,400/);
    // Annual frequency label
    expect(badge.textContent).toMatch(/year/);
  });

  it('renders negative delta with red styling and correct text', () => {
    render(<DeltaBadge delta={-1_500} />);

    const badge = screen.getByTestId('delta-badge');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toMatch(/red/);
    // Em-dash for negative
    expect(badge.textContent).toMatch(/\$1,500/);
    expect(badge.textContent).toMatch(/year/);
  });

  it('renders zero delta with neutral styling', () => {
    render(<DeltaBadge delta={0} />);

    const badge = screen.getByTestId('delta-badge');
    expect(badge).toBeInTheDocument();
    // Should NOT have green or red
    expect(badge.className).not.toMatch(/emerald/);
    expect(badge.className).not.toMatch(/red/);
    expect(badge.textContent).toMatch(/\$0/);
  });

  it('uses weekly frequency label when store is set to weekly', () => {
    act(() => {
      useComparisonStore.setState({ ...BASE_STATE, displayFrequency: 'weekly' });
    });

    // Delta of 52 * 100 = 5200/year → 100/week
    render(<DeltaBadge delta={5_200} />);

    const badge = screen.getByTestId('delta-badge');
    expect(badge.textContent).toMatch(/week/);
    // Should show 100/week (5200 / 52)
    expect(badge.textContent).toMatch(/\$100/);
  });

  it('uses fortnightly frequency label when store is set to fortnightly', () => {
    act(() => {
      useComparisonStore.setState({
        ...BASE_STATE,
        displayFrequency: 'fortnightly',
      });
    });

    // 2600/year → 100/fortnight (2600 / 26)
    render(<DeltaBadge delta={2_600} />);

    const badge = screen.getByTestId('delta-badge');
    expect(badge.textContent).toMatch(/fortnight/);
    expect(badge.textContent).toMatch(/\$100/);
  });
});
