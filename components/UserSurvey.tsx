'use client';

import { useEffect, useMemo, useState } from 'react';
import { useComparisonStore } from '@/store/comparisonStore';
import { track } from '@/lib/analytics';

const SURVEY_STORAGE_KEY = 'user-survey-response';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const MIN_ELAPSED_MS = 30_000;

type SurveyResponse = 'yes' | 'no';

interface StoredSurveyResponse {
  response: SurveyResponse;
  expiresAt: number;
}

function readStoredResponse(): StoredSurveyResponse | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  const raw = localStorage.getItem(SURVEY_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'response' in parsed &&
      'expiresAt' in parsed &&
      (parsed.response === 'yes' || parsed.response === 'no') &&
      typeof parsed.expiresAt === 'number'
    ) {
      if (Date.now() <= parsed.expiresAt) {
        return parsed as StoredSurveyResponse;
      }
      localStorage.removeItem(SURVEY_STORAGE_KEY);
    }
  } catch {
    localStorage.removeItem(SURVEY_STORAGE_KEY);
  }
  return null;
}

function storeResponse(response: SurveyResponse): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  const value: StoredSurveyResponse = {
    response,
    expiresAt: Date.now() + THIRTY_DAYS_MS,
  };
  localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(value));
}

export function UserSurvey() {
  const scenarios = useComparisonStore((s) => s.scenarios);
  const [elapsed, setElapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [hasStoredResponse, setHasStoredResponse] = useState(false);

  const hasCompletedCalculation = useMemo(() => {
    return scenarios.some((scenario) => scenario.salary > 0);
  }, [scenarios]);

  useEffect(() => {
    setHasStoredResponse(readStoredResponse() !== null);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setElapsed(true), MIN_ELAPSED_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const shouldShow = elapsed && hasCompletedCalculation && !dismissed && !hasStoredResponse;
  if (!shouldShow) {
    return null;
  }

  function handleResponse(response: SurveyResponse) {
    storeResponse(response);
    setDismissed(true);
    track('survey_response', { response });
  }

  return (
    <section
      data-testid="user-survey"
      className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
      aria-label="User feedback survey"
    >
      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        Was this comparison helpful?
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          data-testid="survey-yes"
          onClick={() => handleResponse('yes')}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Yes
        </button>
        <button
          type="button"
          data-testid="survey-no"
          onClick={() => handleResponse('no')}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          No
        </button>
      </div>
    </section>
  );
}
