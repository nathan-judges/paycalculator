// @vitest-environment jsdom
/**
 * ExportButton.test.tsx
 *
 * Tests CSV export: correct headers/data, URL revocation, and injection safety.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportButton } from './ExportButton';
import { useComparisonStore } from '@/store/comparisonStore';

// ---------------------------------------------------------------------------
// Mock URL object-URL methods
// ---------------------------------------------------------------------------
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = vi.fn();

// Track the anchor elements that get created for download
let capturedAnchors: HTMLAnchorElement[] = [];

beforeEach(() => {
  vi.stubGlobal('URL', {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  });

  // Reset store to default single-scenario state
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

  mockCreateObjectURL.mockClear();
  mockRevokeObjectURL.mockClear();
  capturedAnchors = [];

  // Intercept anchor element clicks via prototype spy
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    capturedAnchors.push(this);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Capture the CSV string from the Blob passed to createObjectURL. */
async function getCapturedCSV(): Promise<string> {
  const blobArg: Blob = mockCreateObjectURL.mock.calls[0][0] as Blob;
  return blobArg.text();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ExportButton', () => {
  it('renders with correct aria-label', () => {
    render(<ExportButton />);
    expect(screen.getByRole('button', { name: 'Export as CSV' })).toBeDefined();
  });

  it('creates a CSV blob and triggers download on click', async () => {
    const user = userEvent.setup();
    render(<ExportButton />);
    await user.click(screen.getByRole('button', { name: 'Export as CSV' }));

    expect(mockCreateObjectURL).toHaveBeenCalledOnce();
    expect(capturedAnchors).toHaveLength(1);
    expect(capturedAnchors[0].download).toContain('salary-comparison');
  });

  it('revokes the object URL after download to prevent memory leaks', async () => {
    const user = userEvent.setup();
    render(<ExportButton />);
    await user.click(screen.getByRole('button', { name: 'Export as CSV' }));

    expect(mockRevokeObjectURL).toHaveBeenCalledOnce();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('generates CSV with correct headers', async () => {
    const user = userEvent.setup();
    render(<ExportButton />);
    await user.click(screen.getByRole('button', { name: 'Export as CSV' }));

    const csv = await getCapturedCSV();
    const headerRow = csv.split('\r\n')[0];
    expect(headerRow).toContain('Scenario Label');
    expect(headerRow).toContain('Salary');
    expect(headerRow).toContain('Net Take-Home');
    expect(headerRow).toContain('Financial Year');
  });

  it('includes scenario data in the CSV body', async () => {
    const user = userEvent.setup();
    render(<ExportButton />);
    await user.click(screen.getByRole('button', { name: 'Export as CSV' }));

    const csv = await getCapturedCSV();
    expect(csv).toContain('Current salary');
    expect(csv).toContain('2025-26');
  });

  it('sanitises labels to prevent CSV injection', async () => {
    useComparisonStore.setState({
      version: 1,
      displayFrequency: 'annual',
      financialYear: '2025-26',
      scenarios: [
        {
          id: 's1',
          label: '=HYPERLINK("http://evil.com","Click")',
          salary: 90_000,
          superInclusive: false,
          hasHecs: false,
          hasPrivateHealth: false,
        },
      ],
    });

    const user = userEvent.setup();
    render(<ExportButton />);
    await user.click(screen.getByRole('button', { name: 'Export as CSV' }));

    const csv = await getCapturedCSV();
    // The leading = should be stripped by the sanitiser
    expect(csv).not.toContain('=HYPERLINK');
  });
});
