'use client';

import { useEffect, useState } from 'react';

export const SALARY_TOOLTIP_FLAG = 'hasSeenSalaryTooltip';

interface OnboardingTooltipProps {
  targetId: string;
}

export function OnboardingTooltip({ targetId }: OnboardingTooltipProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(SALARY_TOOLTIP_FLAG) === 'true') return;

    setVisible(true);

    const dismiss = () => {
      setVisible(false);
      window.localStorage.setItem(SALARY_TOOLTIP_FLAG, 'true');
    };

    const timeoutId = window.setTimeout(dismiss, 5000);
    const target = document.getElementById(targetId);
    target?.setAttribute('aria-describedby', 'salary-onboarding-tooltip');
    window.addEventListener('click', dismiss, true);
    window.addEventListener('keydown', dismiss, true);
    window.addEventListener('blur', dismiss, true);

    return () => {
      window.clearTimeout(timeoutId);
      target?.removeAttribute('aria-describedby');
      window.removeEventListener('click', dismiss, true);
      window.removeEventListener('keydown', dismiss, true);
      window.removeEventListener('blur', dismiss, true);
    };
  }, [targetId]);

  if (!visible) return null;

  return (
    <div
      id="salary-onboarding-tooltip"
      role="tooltip"
      data-testid="salary-onboarding-tooltip"
      className="relative mt-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-900 shadow-sm dark:border-indigo-800/60 dark:bg-indigo-950/30 dark:text-indigo-200 motion-reduce:transition-none"
    >
      Change your salary here to see your take-home pay update instantly.
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          window.localStorage.setItem(SALARY_TOOLTIP_FLAG, 'true');
        }}
        aria-label="Dismiss salary tip"
        className="ml-2 inline-flex rounded px-1 text-indigo-800 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-200"
      >
        Dismiss
      </button>
    </div>
  );
}
