// @vitest-environment jsdom
/**
 * ErrorBoundary.test.tsx
 *
 * Tests the app/error.tsx UI component directly by rendering it with
 * a mock error prop and verifying the correct text and button behaviour.
 *
 * Note: Next.js route-level error boundaries cannot be tested through
 * the full Next.js runtime in Vitest. We test the Error UI component
 * directly with mocked props.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorPage from '@/app/error';
import { useComparisonStore } from '@/store/comparisonStore';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockUnstableRetry = vi.fn();

const mockError = new Error('Test render error') as Error & { digest?: string };
mockError.digest = 'abc123';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('app/error.tsx (Error UI)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockUnstableRetry.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the error heading', () => {
    render(<ErrorPage error={mockError} unstable_retry={mockUnstableRetry} />);
    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeDefined();
  });

  it('renders the user-friendly message', () => {
    render(<ErrorPage error={mockError} unstable_retry={mockUnstableRetry} />);
    expect(
      screen.getByText(/Please refresh or start a new comparison/i),
    ).toBeDefined();
  });

  it('does not render the raw error message (security)', () => {
    render(<ErrorPage error={mockError} unstable_retry={mockUnstableRetry} />);
    expect(screen.queryByText('Test render error')).toBeNull();
  });

  it('renders a "Try again" button that calls unstable_retry', async () => {
    const user = userEvent.setup();
    render(<ErrorPage error={mockError} unstable_retry={mockUnstableRetry} />);

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(mockUnstableRetry).toHaveBeenCalledOnce();
  });

  it('renders a "Clear data" button', () => {
    render(<ErrorPage error={mockError} unstable_retry={mockUnstableRetry} />);
    expect(
      screen.getByRole('button', { name: /clear data/i }),
    ).toBeDefined();
  });

  it('logs the error to console in development', () => {
    render(<ErrorPage error={mockError} unstable_retry={mockUnstableRetry} />);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[PayCalculator]'),
      mockError,
    );
  });

  it('calls clearStorage and reloads on "Clear data" click', async () => {
    const clearStorageSpy = vi
      .spyOn(useComparisonStore.persist, 'clearStorage')
      .mockImplementation(() => {});
    const reloadSpy = vi.fn();
    // Replace window.location with a minimal mock object (jsdom location.reload is non-configurable)
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true,
      configurable: true,
    });

    const user = userEvent.setup();
    render(<ErrorPage error={mockError} unstable_retry={mockUnstableRetry} />);

    await user.click(screen.getByRole('button', { name: /clear data/i }));

    expect(clearStorageSpy).toHaveBeenCalledOnce();
    expect(reloadSpy).toHaveBeenCalledOnce();
  });
});
