/**
 * ToggleSwitch — component tests.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToggleSwitch } from './ToggleSwitch';

describe('ToggleSwitch', () => {
  it('renders with the label and unchecked state', () => {
    render(
      <ToggleSwitch label="Include super" checked={false} onChange={vi.fn()} />,
    );
    const toggle = screen.getByRole('switch', { name: /include super/i });
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('renders in checked state', () => {
    render(
      <ToggleSwitch label="Include super" checked={true} onChange={vi.fn()} />,
    );
    const toggle = screen.getByRole('switch', { name: /include super/i });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange with toggled value when clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ToggleSwitch label="Has HECS" checked={false} onChange={onChange} />,
    );
    const toggle = screen.getByRole('switch', { name: /has hecs/i });

    await user.click(toggle);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when toggling off', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ToggleSwitch label="Has HECS" checked={true} onChange={onChange} />,
    );
    const toggle = screen.getByRole('switch', { name: /has hecs/i });

    await user.click(toggle);

    expect(onChange).toHaveBeenCalledWith(false);
  });
});
