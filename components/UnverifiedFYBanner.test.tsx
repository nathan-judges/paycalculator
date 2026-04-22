// @vitest-environment jsdom
/**
 * UnverifiedFYBanner.test.tsx
 *
 * Tests banner visibility, dismissal, and localStorage persistence.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UnverifiedFYBanner } from './UnverifiedFYBanner';
import { useComparisonStore } from '@/store/comparisonStore';

// ---------------------------------------------------------------------------
// Setup: use a mock localStorage
// ---------------------------------------------------------------------------
beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// Helper to set store FY
// ---------------------------------------------------------------------------
function setFinancialYear(fy: '2025-26' | '2026-27') {
  useComparisonStore.setState({ financialYear: fy });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('UnverifiedFYBanner', () => {
  describe('when financial year is 2026-27 (unverified)', () => {
    it('shows the warning banner', async () => {
      setFinancialYear('2026-27');
      render(<UnverifiedFYBanner />);

      // The banner starts hidden due to SSR hydration guard; wait for effect
      await waitFor(() => {
        expect(screen.getByTestId('unverified-fy-banner')).toBeDefined();
      });
    });

    it('contains the correct warning text', async () => {
      setFinancialYear('2026-27');
      render(<UnverifiedFYBanner />);

      await waitFor(() => {
        expect(
          screen.getByText(/not yet ATO-verified/i),
        ).toBeDefined();
      });
    });

    it('hides the banner after clicking dismiss', async () => {
      const user = userEvent.setup();
      setFinancialYear('2026-27');
      render(<UnverifiedFYBanner />);

      await waitFor(() => {
        expect(screen.getByTestId('unverified-fy-banner')).toBeDefined();
      });

      await user.click(
        screen.getByRole('button', { name: /dismiss warning/i }),
      );

      await waitFor(() => {
        expect(screen.queryByTestId('unverified-fy-banner')).toBeNull();
      });
    });

    it('persists dismissal to localStorage', async () => {
      const user = userEvent.setup();
      setFinancialYear('2026-27');
      render(<UnverifiedFYBanner />);

      await waitFor(() => {
        expect(screen.getByTestId('unverified-fy-banner')).toBeDefined();
      });

      await user.click(
        screen.getByRole('button', { name: /dismiss warning/i }),
      );

      expect(localStorage.getItem('dismissedWarning_2026-27')).toBe('true');
    });

    it('does not show the banner if already dismissed in localStorage', async () => {
      localStorage.setItem('dismissedWarning_2026-27', 'true');
      setFinancialYear('2026-27');
      render(<UnverifiedFYBanner />);

      // Wait a tick for useEffect to run
      await waitFor(() => {
        expect(screen.queryByTestId('unverified-fy-banner')).toBeNull();
      });
    });
  });

  describe('when financial year is 2025-26 (ATO-verified)', () => {
    it('does not show the warning banner', async () => {
      setFinancialYear('2025-26');
      render(<UnverifiedFYBanner />);

      // Give useEffect time to run
      await waitFor(() => {
        expect(screen.queryByTestId('unverified-fy-banner')).toBeNull();
      });
    });
  });
});
