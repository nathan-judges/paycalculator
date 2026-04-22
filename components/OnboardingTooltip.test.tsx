/**
 * @vitest-environment jsdom
 */

import { render, screen, act, fireEvent } from '@testing-library/react';
import { OnboardingTooltip, SALARY_TOOLTIP_FLAG } from './OnboardingTooltip';

describe('OnboardingTooltip', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function renderWithTarget() {
    const target = document.createElement('input');
    target.id = 'salary-input';
    document.body.appendChild(target);
    render(<OnboardingTooltip targetId="salary-input" />);
    return target;
  }

  it('does not render when localStorage flag is already set', () => {
    localStorage.setItem(SALARY_TOOLTIP_FLAG, 'true');
    renderWithTarget();

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('renders on first visit and auto-dismisses after five seconds', () => {
    renderWithTarget();
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(localStorage.getItem(SALARY_TOOLTIP_FLAG)).toBe('true');
  });

  it('dismisses when the target input receives first interaction', () => {
    const target = renderWithTarget();
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.click(target);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(localStorage.getItem(SALARY_TOOLTIP_FLAG)).toBe('true');
  });
});
