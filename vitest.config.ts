import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['node_modules', '.next'],
    environmentMatchGlobs: [
      ['**/*.test.tsx', 'jsdom'],
    ],
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
