'use client';

import { useMemo } from 'react';
import { exportLocalAnalytics } from '@/lib/analytics';

export function DevMetricsExportButton() {
  const isEnabled = useMemo(() => {
    if (process.env.NODE_ENV === 'production') {
      return false;
    }
    if (typeof window === 'undefined') {
      return false;
    }
    return new URLSearchParams(window.location.search).get('dev') === '1';
  }, []);

  if (!isEnabled) {
    return null;
  }

  function handleDownload() {
    const events = exportLocalAnalytics();
    const blob = new Blob([JSON.stringify(events, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'local-analytics-events.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      data-testid="dev-export-metrics"
      onClick={handleDownload}
      className="mt-4 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      Export local metrics
    </button>
  );
}
