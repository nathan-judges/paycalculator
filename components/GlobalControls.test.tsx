/**
 * GlobalControls — component tests.
 *
 * Tests rendering and store interaction for frequency and FY selectors.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useComparisonStore } from '@/store/comparisonStore';
import { GlobalControls } from './GlobalControls';

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

describe('GlobalControls', () => {
  it('renders both selectors with current values', () => {
    render(<GlobalControls />);

    const freqSelect = screen.getByLabelText(/display as/i);
    expect(freqSelect).toBeInTheDocument();
    expect(freqSelect).toHaveValue('annual');

    const fySelect = screen.getByLabelText(/financial year/i);
    expect(fySelect).toBeInTheDocument();
    expect(fySelect).toHaveValue('2025-26');
  });

  it('updates store when frequency is changed', async () => {
    const user = userEvent.setup();
    render(<GlobalControls />);

    const freqSelect = screen.getByLabelText(/display as/i);
    await user.selectOptions(freqSelect, 'weekly');

    expect(useComparisonStore.getState().displayFrequency).toBe('weekly');
  });

  it('updates store when financial year is changed', async () => {
    const user = userEvent.setup();
    render(<GlobalControls />);

    const fySelect = screen.getByLabelText(/financial year/i);
    await user.selectOptions(fySelect, '2026-27');

    expect(useComparisonStore.getState().financialYear).toBe('2026-27');
  });

  it('renders all frequency options', () => {
    render(<GlobalControls />);

    const freqSelect = screen.getByLabelText(/display as/i);
    const options = freqSelect.querySelectorAll('option');
    expect(options).toHaveLength(4);

    const optionValues = Array.from(options).map((o) => o.value);
    expect(optionValues).toEqual(['weekly', 'fortnightly', 'monthly', 'annual']);
  });

  it('renders all financial year options', () => {
    render(<GlobalControls />);

    const fySelect = screen.getByLabelText(/financial year/i);
    const options = fySelect.querySelectorAll('option');
    expect(options).toHaveLength(2);

    const optionValues = Array.from(options).map((o) => o.value);
    expect(optionValues).toEqual(['2025-26', '2026-27']);
  });
});
