import type { NextConfig } from 'next';

// next-pwa is CommonJS; keep this file compatible with Next config loading.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  // next-pwa config plugin adds a webpack config; declaring an empty Turbopack
  // config silences Next's safety check while keeping Turbopack enabled.
  turbopack: {},
};

module.exports = withPWA(nextConfig);
