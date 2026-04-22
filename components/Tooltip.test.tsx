// @vitest-environment jsdom
/**
 * Tooltip.test.tsx
 *
 * Tests hover/focus visibility, ARIA attributes, and keyboard accessibility.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  it('renders children without showing tooltip initially', () => {
    render(
      <Tooltip text="This is a tooltip">
        <button type="button">Hover me</button>
      </Tooltip>,
    );
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeDefined();
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('shows tooltip with correct text on mouse hover', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip text="Super inclusive means super comes out of this salary">
        <button type="button">Toggle</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole('button'));
    expect(screen.getByRole('tooltip')).toBeDefined();
    expect(
      screen.getByText('Super inclusive means super comes out of this salary'),
    ).toBeDefined();
  });

  it('hides tooltip after mouse leaves', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip text="Test tooltip">
        <button type="button">Button</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole('button'));
    expect(screen.getByRole('tooltip')).toBeDefined();

    await user.unhover(screen.getByRole('button'));
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('shows tooltip on keyboard focus', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip text="Keyboard accessible tooltip">
        <button type="button">Focusable button</button>
      </Tooltip>,
    );

    await user.tab(); // Focus the button
    expect(screen.getByRole('tooltip')).toBeDefined();
    expect(screen.getByText('Keyboard accessible tooltip')).toBeDefined();
  });

  it('hides tooltip on blur', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Tooltip text="Test tooltip">
          <button type="button">Button one</button>
        </Tooltip>
        <button type="button">Button two</button>
      </div>,
    );

    await user.tab(); // Focus first button → tooltip shows
    expect(screen.getByRole('tooltip')).toBeDefined();

    await user.tab(); // Focus second button → tooltip hides
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('applies aria-describedby when tooltip is visible', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip text="ARIA tooltip">
        <button type="button">Button</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole('button'));

    const tooltip = screen.getByRole('tooltip');
    const tooltipId = tooltip.id;
    expect(tooltipId).toBeTruthy();

    // The control itself should be described by the tooltip
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-describedby',
      tooltipId,
    );
  });

  it('tooltip has role="tooltip"', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip text="Role check">
        <button type="button">Hover</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole('button'));
    expect(screen.getByRole('tooltip')).toBeDefined();
  });
});
