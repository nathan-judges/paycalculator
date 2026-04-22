// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { act } from 'react';
import { useComparisonStore } from '@/store/comparisonStore';
import { UserSurvey } from './UserSurvey';

const trackMock = vi.fn();
vi.mock('@/lib/analytics', () => ({
  track: (...args: unknown[]) => trackMock(...args),
}));

describe('UserSurvey', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    trackMock.mockReset();
    useComparisonStore.setState({
      version: 1,
      displayFrequency: 'annual',
      financialYear: '2025-26',
      scenarios: [
        {
          id: 's1',
          label: 'Current salary',
          salary: 90_000,
          superInclusive: false,
          hasHecs: false,
          hasPrivateHealth: false,
        },
      ],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('appears after 30 seconds and records a response', async () => {
    render(<UserSurvey />);

    expect(screen.queryByTestId('user-survey')).toBeNull();
    act(() => vi.advanceTimersByTime(30_000));
    expect(screen.getByTestId('user-survey')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('survey-yes'));
    expect(trackMock).toHaveBeenCalledWith('survey_response', { response: 'yes' });
    expect(screen.queryByTestId('user-survey')).toBeNull();
  });
});
