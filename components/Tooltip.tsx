/**
 * Tooltip — accessible custom tooltip component.
 *
 * Shows a floating tooltip on hover and keyboard focus.
 * Implements role="tooltip" and aria-describedby for screen readers.
 * Uses native title attribute as a fallback for no-JS environments.
 *
 * No external library — implemented with React state and CSS.
 */

'use client';

import { useState, useId, isValidElement, cloneElement } from 'react';

interface TooltipProps {
  /** The element to attach the tooltip to. */
  children: React.ReactElement;
  /** The tooltip text to display. */
  text: string;
}

type TooltipChildProps = {
  'aria-describedby'?: string;
  title?: string;
};

export function Tooltip({ children, text }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const tooltipId = useId();

  if (!isValidElement(children)) {
    throw new Error('Tooltip expects a single React element child.');
  }

  const describedBy = visible ? tooltipId : undefined;
  const child = children as React.ReactElement<TooltipChildProps>;

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {cloneElement(child, {
        'aria-describedby': describedBy,
        title: text,
      })}

      {/* Tooltip bubble */}
      {visible && (
        <span
          id={tooltipId}
          role="tooltip"
          className="
            pointer-events-none absolute bottom-full left-1/2 z-50
            mb-2 -translate-x-1/2
            max-w-xs rounded-lg
            bg-zinc-900 px-3 py-2
            text-xs text-white
            shadow-lg
            dark:bg-zinc-700
          "
          style={{ whiteSpace: 'normal', minWidth: '12rem' }}
        >
          {text}
          {/* Arrow */}
          <span
            aria-hidden="true"
            className="
              absolute top-full left-1/2 -translate-x-1/2
              border-4 border-transparent border-t-zinc-900
              dark:border-t-zinc-700
            "
          />
        </span>
      )}
    </span>
  );
}
