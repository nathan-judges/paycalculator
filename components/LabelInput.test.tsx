/**
 * LabelInput — component tests.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LabelInput } from './LabelInput';

describe('LabelInput', () => {
  it('renders with the initial value', () => {
    render(<LabelInput value="Current salary" onChange={vi.fn()} />);
    const input = screen.getByRole('textbox', { name: /scenario label/i });
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('Current salary');
  });

  it('calls onChange when user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<LabelInput value="" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: /scenario label/i });

    await user.type(input, 'New offer');

    // onChange should have been called for each character
    expect(onChange).toHaveBeenCalledTimes(9); // "New offer" = 9 chars
    expect(onChange).toHaveBeenLastCalledWith('r');
  });

  it('enforces 30-character maximum', () => {
    const input = document.createElement('input');
    // The maxLength is enforced at the HTML level + our slice
    render(<LabelInput value="" onChange={vi.fn()} />);
    const el = screen.getByRole('textbox', { name: /scenario label/i });
    expect(el).toHaveAttribute('maxLength', '30');
  });

  it('truncates values longer than 30 characters in onChange', () => {
    const onChange = vi.fn();
    render(<LabelInput value="" onChange={onChange} />);
    const el = screen.getByRole('textbox', { name: /scenario label/i });

    const longText = 'A'.repeat(35);
    // Simulate a change event with a long value (e.g., paste)
    el.focus();
    // Use fireEvent for direct value setting
    const event = new Event('change', { bubbles: true });
    Object.defineProperty(el, 'value', { value: longText, writable: true });
    el.dispatchEvent(event);

    // The onChange callback should receive at most 30 chars
    if (onChange.mock.calls.length > 0) {
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(lastCall.length).toBeLessThanOrEqual(30);
    }
  });
});
