/**
 * EditableSalaryInput — component tests.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableSalaryInput } from './EditableSalaryInput';

describe('EditableSalaryInput', () => {
  it('renders with the formatted initial value', () => {
    render(<EditableSalaryInput value={90000} onChange={vi.fn()} />);
    const input = screen.getByRole('textbox', { name: /salary/i });
    expect(input).toBeInTheDocument();
    // Should display formatted value (without leading $, which is in the span)
    expect(input).toHaveValue('90,000');
  });

  it('renders with a custom label', () => {
    render(
      <EditableSalaryInput
        value={120000}
        onChange={vi.fn()}
        label="Annual salary"
      />,
    );
    expect(screen.getByText('Annual salary')).toBeInTheDocument();
  });

  it('shows raw number on focus for editing', async () => {
    render(<EditableSalaryInput value={90000} onChange={vi.fn()} />);
    const input = screen.getByRole('textbox', { name: /salary/i });

    fireEvent.focus(input);

    // After focus, the input switches to type="number" with raw value
    const numInput = screen.getByRole('spinbutton', { name: /salary/i });
    expect(numInput).toHaveValue(90000);
  });

  it('calls onChange with the parsed numeric value on blur', async () => {
    const onChange = vi.fn();
    render(<EditableSalaryInput value={90000} onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: /salary/i });

    // Focus
    fireEvent.focus(input);

    // Now it's a number input
    const numInput = screen.getByRole('spinbutton', { name: /salary/i });

    // Clear and type new value
    await userEvent.clear(numInput);
    await userEvent.type(numInput, '105000');

    // Blur
    fireEvent.blur(numInput);

    expect(onChange).toHaveBeenCalledWith(105000);
  });

  it('handles invalid input gracefully on blur', () => {
    const onChange = vi.fn();
    render(<EditableSalaryInput value={90000} onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: /salary/i });

    fireEvent.focus(input);
    const numInput = screen.getByRole('spinbutton', { name: /salary/i });

    fireEvent.change(numInput, { target: { value: 'abc' } });
    fireEvent.blur(numInput);

    // Invalid input should default to 0
    expect(onChange).toHaveBeenCalledWith(0);
  });
});
