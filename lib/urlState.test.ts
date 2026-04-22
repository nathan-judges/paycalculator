/**
 * Tests for URL state compression/decompression utilities.
 */

import { describe, it, expect } from 'vitest';
import { compressState, decompressState, readStateParam, buildStateSearch } from './urlState';
import { DEFAULT_APP_STATE, type AppState } from '@/lib/types';
import LZString from 'lz-string';

// ---------------------------------------------------------------------------
// Sample states
// ---------------------------------------------------------------------------

const TWO_SCENARIO_STATE: AppState = {
  version: 1,
  displayFrequency: 'monthly',
  financialYear: '2026-27',
  scenarios: [
    {
      id: 's1',
      label: 'Current role',
      salary: 95_000,
      superInclusive: false,
      hasHecs: true,
      hasPrivateHealth: false,
    },
    {
      id: 's2',
      label: 'New offer',
      salary: 120_000,
      superInclusive: true,
      hasHecs: false,
      hasPrivateHealth: true,
    },
  ],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('URL state compression', () => {
  // -------------------------------------------------------------------------
  // Round-trip tests
  // -------------------------------------------------------------------------

  it('round-trips DEFAULT_APP_STATE through compress/decompress', () => {
    const compressed = compressState(DEFAULT_APP_STATE);
    const decompressed = decompressState(compressed);
    expect(decompressed).toEqual(DEFAULT_APP_STATE);
  });

  it('round-trips a two-scenario state through compress/decompress', () => {
    const compressed = compressState(TWO_SCENARIO_STATE);
    const decompressed = decompressState(compressed);
    expect(decompressed).toEqual(TWO_SCENARIO_STATE);
  });

  it('produces a shorter string than raw JSON for larger payloads', () => {
    // Small payloads may expand due to base64 URI-encoding overhead.
    // A realistic multi-scenario state should compress well.
    const largeState: AppState = {
      version: 1,
      displayFrequency: 'annual',
      financialYear: '2025-26',
      scenarios: Array.from({ length: 2 }, (_, i) => ({
        id: `s${i + 1}` as 's1' | 's2',
        label: `Scenario ${i + 1} with a reasonably long label for testing compression`,
        salary: 90_000 + i * 10_000,
        superInclusive: false,
        hasHecs: true,
        hasPrivateHealth: false,
      })),
    };
    const compressed = compressState(largeState);
    const rawJson = JSON.stringify(largeState);
    // Verify the compressed output is at least a valid string
    expect(compressed.length).toBeGreaterThan(0);
    expect(compressed.length).toBeLessThan(rawJson.length);
  });

  // -------------------------------------------------------------------------
  // Error handling
  // -------------------------------------------------------------------------

  it('returns null for an invalid compressed string', () => {
    const result = decompressState('this-is-garbage-data-!@#$%');
    expect(result).toBeNull();
  });

  it('returns null for an empty string', () => {
    const result = decompressState('');
    expect(result).toBeNull();
  });

  it('returns null for tampered JSON (valid LZ, invalid schema)', () => {
    // Compress valid JSON that doesn't match AppStateSchema
    const tampered = LZString.compressToEncodedURIComponent(
      JSON.stringify({ version: 999, invalid: true }),
    );
    const result = decompressState(tampered);
    expect(result).toBeNull();
  });

  it('returns null for valid LZ containing non-JSON', () => {
    const notJson = LZString.compressToEncodedURIComponent('not valid json {{{');
    const result = decompressState(notJson);
    expect(result).toBeNull();
  });

  // -------------------------------------------------------------------------
  // URL parameter utilities
  // -------------------------------------------------------------------------

  it('readStateParam extracts the state parameter from a search string', () => {
    // Use buildStateSearch to construct the URL — it correctly encodes
    // characters (like +) that URLSearchParams would otherwise decode as spaces.
    const search = buildStateSearch(DEFAULT_APP_STATE);
    const result = readStateParam(search);
    expect(result).not.toBeNull();
    // The extracted value should decompress back to the original state
    const restored = decompressState(result!);
    expect(restored).toEqual(DEFAULT_APP_STATE);
  });

  it('readStateParam returns null when parameter is missing', () => {
    const result = readStateParam('?other=value');
    expect(result).toBeNull();
  });

  it('readStateParam returns null for empty search string', () => {
    const result = readStateParam('');
    expect(result).toBeNull();
  });

  it('buildStateSearch creates a valid search string', () => {
    const search = buildStateSearch(DEFAULT_APP_STATE);
    expect(search).toMatch(/^\?state=.+$/);

    // Should be decompressible
    const param = readStateParam(search);
    expect(param).not.toBeNull();
    const result = decompressState(param!);
    expect(result).toEqual(DEFAULT_APP_STATE);
  });
});
