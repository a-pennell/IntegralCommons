import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  // The contracts package lives at .sdd/specs/001-commonground/contracts/ and ships
  // TypeScript source directly — Next must transpile it rather than resolving to dist.
  transpilePackages: ['@commonground/contracts'],
  // Pin the workspace root so Next.js doesn't pick up an unrelated lockfile higher up.
  outputFileTracingRoot: path.join(import.meta.dirname, '..'),
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;
