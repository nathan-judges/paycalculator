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
  localStorage.clear();
  act(() => {
    useComparisonStore.setState(BASE_STATE);
  });
});

describe('QuickCheckClient', () => {
  it('renders the "Compare with another offer" button disabled when only one scenario exists', () => {
    render(<QuickCheckClient />);

    const compareButton = screen.getByRole('button', {
      name: /compare with another offer/i,
    });
    expect(compareButton).toBeInTheDocument();
    expect(compareButton).toBeDisabled();
  });

  it('enables compare after salary interaction, then adds a second scenario', async () => {
    const user = userEvent.setup();
    render(<QuickCheckClient />);

    const salaryInput = screen.getByRole('textbox', { name: /annual salary/i });
    await user.clear(salaryInput);
    await user.type(salaryInput, '95000');

    const compareButton = screen.getByRole('button', {
      name: /compare with another offer/i,
    });
    expect(compareButton).toBeEnabled();
    await user.click(compareButton);

    const state = useComparisonStore.getState();
    expect(state.scenarios).toHaveLength(2);
    expect(state.scenarios[1].id).toBe('s2');
  });

  it('hides the compare button once two scenarios exist', async () => {
    const user = userEvent.setup();
    render(<QuickCheckClient />);

    const salaryInput = screen.getByRole('textbox', { name: /annual salary/i });
    await user.clear(salaryInput);
    await user.type(salaryInput, '91000');

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

  it('does not render the sticky footer in single-scenario mode', () => {
    render(<QuickCheckClient />);
    expect(screen.queryByTestId('sticky-footer')).not.toBeInTheDocument();
  });

  it('shows onboarding tooltip on first visit', () => {
    render(<QuickCheckClient />);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });
});
