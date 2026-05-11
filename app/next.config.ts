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
  // pg-boss spawns Node.js worker threads via a relative `lib/worker.js` path.
  // When webpack bundles it, that path breaks at runtime. Mark it external so
  // Next.js loads it directly from node_modules instead.
  // These packages use Node.js worker_threads with relative paths that break
  // when webpack bundles them into vendor-chunks. Keep them in node_modules.
  serverExternalPackages: ['pg-boss', 'pino', 'pino-pretty', 'thread-stream'],
};

export default nextConfig;
