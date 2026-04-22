import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    // Default environment for .ts files (tax engine, store, URL utils).
    // Component test files (.test.tsx) override this per-file with the
    // `@vitest-environment jsdom` docblock comment, which is the
    // Vitest 4 idiomatic way to mix environments.
    environment: 'node',
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['node_modules', '.next'],
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts', 'store/**/*.ts', 'components/**/*.tsx'],
      exclude: [
        'lib/**/*.test.ts',
        'store/**/*.test.ts',
        'lib/types.ts',
        'components/**/*.test.tsx',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});