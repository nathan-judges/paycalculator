// @vitest-environment jsdom
/**
 * ShareButton.test.tsx
 *
 * Tests clipboard copy, success/error toast, and fallback when clipboard is unavailable.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShareButton } from './ShareButton';
import { useComparisonStore } from '@/store/comparisonStore';

let writeTextMock: ReturnType<typeof vi.fn> | null = null;

// ---------------------------------------------------------------------------
// Store setup
// ---------------------------------------------------------------------------
beforeEach(() => {
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

  writeTextMock = null;
});

const mockLocation = { origin: 'https://example.com', pathname: '/' };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ShareButton', () => {
  it('renders with correct aria-label', () => {
    render(<ShareButton />);
    expect(screen.getByRole('button', { name: 'Copy share link' })).toBeDefined();
  });

  describe('when clipboard is available', () => {
    beforeEach(() => {
      writeTextMock = vi.fn().mockResolvedValue(undefined);
    });

    it('writes a URL containing ?state= to the clipboard', async () => {
      const user = userEvent.setup();
      render(
        <ShareButton clipboard={{ writeText: writeTextMock! }} location={mockLocation} />,
      );
      await user.click(screen.getByRole('button', { name: 'Copy share link' }));

      expect(writeTextMock).not.toBeNull();
      expect(writeTextMock!).toHaveBeenCalledOnce();
      const calledWith = writeTextMock!.mock.calls[0][0] as string;
      expect(calledWith).toContain('https://example.com');
      expect(calledWith).toContain('?state=');
    });

    it('shows a success toast after copying', async () => {
      const user = userEvent.setup();
      render(
        <ShareButton clipboard={{ writeText: writeTextMock! }} location={mockLocation} />,
      );
      await user.click(screen.getByRole('button', { name: 'Copy share link' }));

      await waitFor(() => {
        expect(screen.getByText(/Share link copied/i)).toBeDefined();
      });
    });
  });

  describe('when clipboard write is rejected', () => {
    beforeEach(() => {
      writeTextMock = vi.fn().mockRejectedValue(new Error('Permission denied'));
    });

    it('shows an error toast without exposing internal error details', async () => {
      const user = userEvent.setup();
      render(
        <ShareButton clipboard={{ writeText: writeTextMock! }} location={mockLocation} />,
      );
      await user.click(screen.getByRole('button', { name: 'Copy share link' }));

      await waitFor(() => {
        expect(
          screen.getByText(/Could not copy link/i),
        ).toBeDefined();
      });

      // Internal error message must NOT be displayed
      expect(screen.queryByText(/Permission denied/i)).toBeNull();
    });
  });

  describe('when clipboard API is unavailable', () => {
    it('shows an error toast with a user-friendly fallback message', async () => {
      const user = userEvent.setup();
      render(<ShareButton clipboard={null} location={mockLocation} />);
      await user.click(screen.getByRole('button', { name: 'Copy share link' }));

      await waitFor(() => {
        expect(
          screen.getByText(/Could not copy link/i),
        ).toBeDefined();
      });
    });
  });
});
