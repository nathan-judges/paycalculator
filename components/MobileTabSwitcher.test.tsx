/**
 * MobileTabSwitcher — component tests.
 *
 * Tests that clicking each tab fires onSwitch with the correct id,
 * and that the active tab is visually distinguished.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileTabSwitcher } from './MobileTabSwitcher';

describe('MobileTabSwitcher', () => {
  it('calls onSwitch with "s1" when the Current tab is clicked', async () => {
    const user = userEvent.setup();
    const onSwitch = vi.fn();

    render(<MobileTabSwitcher activeScenarioId="s2" onSwitch={onSwitch} />);

    await user.click(screen.getByRole('tab', { name: /current/i }));
    expect(onSwitch).toHaveBeenCalledOnce();
    expect(onSwitch).toHaveBeenCalledWith('s1');
  });

  it('calls onSwitch with "s2" when the Offer tab is clicked', async () => {
    const user = userEvent.setup();
    const onSwitch = vi.fn();

    render(<MobileTabSwitcher activeScenarioId="s1" onSwitch={onSwitch} />);

    await user.click(screen.getByRole('tab', { name: /offer/i }));
    expect(onSwitch).toHaveBeenCalledOnce();
    expect(onSwitch).toHaveBeenCalledWith('s2');
  });

  it('marks the active tab with aria-selected="true"', () => {
    render(
      <MobileTabSwitcher activeScenarioId="s1" onSwitch={vi.fn()} />,
    );

    const currentTab = screen.getByRole('tab', { name: /current/i });
    const offerTab = screen.getByRole('tab', { name: /offer/i });

    expect(currentTab).toHaveAttribute('aria-selected', 'true');
    expect(offerTab).toHaveAttribute('aria-selected', 'false');
  });

  it('accepts custom labels via the labels prop', () => {
    render(
      <MobileTabSwitcher
        activeScenarioId="s1"
        onSwitch={vi.fn()}
        labels={['My Job', 'New Role']}
      />,
    );

    expect(screen.getByRole('tab', { name: /my job/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /new role/i })).toBeInTheDocument();
  });
});
