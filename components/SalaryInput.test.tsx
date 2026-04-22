/**
 * @vitest-environment jsdom
 */

import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useComparisonStore } from '@/store/comparisonStore';
import { SalaryInput } from './SalaryInput';

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

describe('SalaryInput', () => {
  beforeEach(() => {
    act(() => {
      useComparisonStore.setState(BASE_STATE);
    });
  });

  it('renders salary with comma formatting and currency affordance', () => {
    render(<SalaryInput autoFocus={false} />);
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /annual salary/i })).toHaveValue(
      '90,000',
    );
  });

  it('updates store with sanitised numeric value while typing', async () => {
    const user = userEvent.setup();
    render(<SalaryInput autoFocus={false} />);
    const input = screen.getByRole('textbox', { name: /annual salary/i });

    await user.clear(input);
    await user.type(input, '95,000abc');

    expect(useComparisonStore.getState().scenarios[0].salary).toBe(95_000);
    expect(input).toHaveValue('95,000');
  });

  it('uses mobile-friendly numeric keyboard attributes', () => {
    render(<SalaryInput autoFocus={false} />);
    const input = screen.getByRole('textbox', { name: /annual salary/i });

    expect(input).toHaveAttribute('inputmode', 'numeric');
    expect(input).toHaveAttribute('pattern', '[0-9]*');
  });
});
