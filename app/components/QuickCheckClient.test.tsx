/**
 * QuickCheckClient — component tests.
 *
 * Tests the "Compare with another offer" button behaviour and that
 * ComparisonGrid is rendered as the main content area.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useComparisonStore } from '@/store/comparisonStore';
import { QuickCheckClient } from './QuickCheckClient';

const S1 = {
  id: 's1' as const,
  label: 'Current salary',
  salary: 90_000,
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

describe('QuickCheckClient', () => {
  it('renders the "Compare with another offer" button when only one scenario exists', () => {
    render(<QuickCheckClient />);

    expect(
      screen.getByRole('button', { name: /compare with another offer/i }),
    ).toBeInTheDocument();
  });

  it('clicking the compare button adds a second scenario to the store', async () => {
    const user = userEvent.setup();
    render(<QuickCheckClient />);

    await user.click(
      screen.getByRole('button', { name: /compare with another offer/i }),
    );

    const state = useComparisonStore.getState();
    expect(state.scenarios).toHaveLength(2);
    expect(state.scenarios[1].id).toBe('s2');
  });

  it('hides the compare button once two scenarios exist', async () => {
    const user = userEvent.setup();
    render(<QuickCheckClient />);

    await user.click(
      screen.getByRole('button', { name: /compare with another offer/i }),
    );

    expect(
      screen.queryByRole('button', { name: /compare with another offer/i }),
    ).not.toBeInTheDocument();
  });

  it('renders the ComparisonGrid', () => {
    render(<QuickCheckClient />);
    expect(screen.getByTestId('comparison-grid')).toBeInTheDocument();
  });

  it('renders the sticky footer', () => {
    render(<QuickCheckClient />);
    expect(screen.getByTestId('sticky-footer')).toBeInTheDocument();
  });
});
