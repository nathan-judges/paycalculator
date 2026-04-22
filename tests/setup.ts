import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Only run browser-specific setup in jsdom environment
if (typeof window !== 'undefined') {
  // Async IIFE – no top-level await, no require()
  (async () => {
    const matchers = await import('@testing-library/jest-dom/matchers');
    // expect is already globally available (vitest.config.ts: globals: true)
    expect.extend(matchers.default || matchers);
  })();
}

afterEach(() => {
  if (typeof window !== 'undefined') {
    cleanup();
  }
});
