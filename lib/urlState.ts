/**
 * URL state compression utilities.
 *
 * Uses lz-string to compress/decompress AppState for shareable URLs.
 * All decompressed state is validated through AppStateSchema.safeParse
 * before being accepted — invalid or tampered data returns null.
 */

import LZString from 'lz-string';
import { AppStateSchema, type AppState } from '@/lib/types';

/**
 * Compress an AppState object into a URL-safe string.
 * Uses lz-string's `compressToEncodedURIComponent` which produces
 * a string safe for use in URL query parameters without further encoding.
 */
export function compressState(state: AppState): string {
  const json = JSON.stringify(state);
  return LZString.compressToEncodedURIComponent(json);
}

/**
 * Decompress and validate a URL-encoded state string.
 * Returns the parsed AppState if valid, or null if:
 * - The string cannot be decompressed
 * - The decompressed JSON is malformed
 * - The data fails AppStateSchema validation
 */
export function decompressState(compressed: string): AppState | null {
  if (!compressed) return null;

  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;

    const parsed: unknown = JSON.parse(json);
    const result = AppStateSchema.safeParse(parsed);

    if (result.success) {
      return result.data;
    }
    return null;
  } catch {
    return null;
  }
}

/** URL query parameter name used for state sharing. */
export const STATE_PARAM = 'state';

/**
 * Read the `?state=` parameter from a URL search string.
 * Returns the raw compressed string, or null if not present.
 */
export function readStateParam(search: string): string | null {
  const params = new URLSearchParams(search);
  return params.get(STATE_PARAM);
}

/**
 * Build a URL search string containing the compressed state.
 */
export function buildStateSearch(state: AppState): string {
  const compressed = compressState(state);
  const params = new URLSearchParams();
  params.set(STATE_PARAM, compressed);
  return `?${params.toString()}`;
}
