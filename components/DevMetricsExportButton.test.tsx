// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DevMetricsExportButton } from './DevMetricsExportButton';

vi.mock('@/lib/analytics', () => ({
  exportLocalAnalytics: () => [{ event: 'x', timestamp: '2025-01-01T00:00:00.000Z' }],
}));

describe('DevMetricsExportButton', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/?dev=1');
  });

  it('renders in dev mode and can be clicked', async () => {
    const user = userEvent.setup();
    render(<DevMetricsExportButton />);
    const button = screen.getByTestId('dev-export-metrics');
    expect(button).toBeInTheDocument();
    await user.click(button);
  });
});
