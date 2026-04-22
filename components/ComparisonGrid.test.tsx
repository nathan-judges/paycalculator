/**
 * ComparisonGrid — component tests.
 *
 * Tests single-scenario rendering, two-scenario layout, delta badge presence,
 * and tab switching behaviour.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useComparisonStore } from '@/store/comparisonStore';
import { ComparisonGrid } from './ComparisonGrid';

const S1 = {
  id: 's1' as const,
  label: 'Current salary',
  salary: 90_000,
  superInclusive: false,
  hasHecs: false,
  hasPrivateHealth: false,
};

const S2 = {
  id: 's2' as const,
  label: 'New offer',
  salary: 110_000,
  superInclusive: false,
  hasHecs: false,
  hasPrivateHealth: false,
};

const BASE_STATE = {
  version: 1 as const,
  displayFrequency: 'annual' as const,
  financialYear: '2025-26' as const,
  scenarios: [S1],
};

beforeEach(() => {
  act(() => {
    useComparisonStore.setState(BASE_STATE);
  });
});

describe('ComparisonGrid', () => {
  it('renders a single ScenarioCard when only one scenario exists', () => {
    render(<ComparisonGrid />);

    expect(screen.getByTestId('scenario-card-s1')).toBeInTheDocument();
    expect(screen.queryByTestId('scenario-card-s2')).not.toBeInTheDocument();
  });

  it('does not render a DeltaBadge or MobileTabSwitcher with one scenario', () => {
    render(<ComparisonGrid />);

    expect(screen.queryByTestId('delta-badge')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mobile-tab-switcher')).not.toBeInTheDocument();
  });

  it('renders both ScenarioCards in the DOM when two scenarios exist', () => {
    act(() => {
      useComparisonStore.setState({ ...BASE_STATE, scenarios: [S1, S2] });
    });

    render(<ComparisonGrid />);

    // Both cards should be in the DOM (CSS hides/shows on mobile)
    expect(screen.getByTestId('scenario-card-s1')).toBeInTheDocument();
    expect(screen.getByTestId('scenario-card-s2')).toBeInTheDocument();
  });

  it('renders a DeltaBadge when two scenarios exist', () => {
    act(() => {
      useComparisonStore.setState({ ...BASE_STATE, scenarios: [S1, S2] });
    });

    render(<ComparisonGrid />);

    expect(screen.getByTestId('delta-badge')).toBeInTheDocument();
  });

  it('renders the MobileTabSwitcher when two scenarios exist', () => {
    act(() => {
      useComparisonStore.setState({ ...BASE_STATE, scenarios: [S1, S2] });
    });

    render(<ComparisonGrid />);

    expect(screen.getByTestId('mobile-tab-switcher')).toBeInTheDocument();
  });

  it('switches the active tab when MobileTabSwitcher is clicked', async () => {
    const user = userEvent.setup();
    act(() => {
      useComparisonStore.setState({ ...BASE_STATE, scenarios: [S1, S2] });
    });

    render(<ComparisonGrid />);

    // Initially s1 is active — s2 card wrapper should be hidden (md:block class)
    const s2Wrapper = screen
      .getByTestId('scenario-card-s2')
      .closest('[data-mobile-card]');
    expect(s2Wrapper).toHaveClass('hidden');

    // Click "Offer" tab
    await user.click(screen.getByRole('tab', { name: /offer/i }));

    // Now s2 wrapper should be visible, s1 should be hidden
    const s1Wrapper = screen
      .getByTestId('scenario-card-s1')
      .closest('[data-mobile-card]');
    expect(s1Wrapper).toHaveClass('hidden');
    expect(s2Wrapper).not.toHaveClass('hidden');
  });
});
