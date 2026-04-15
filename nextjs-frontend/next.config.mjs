import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Parent folder has package-lock.json; Next requires tracing + Turbopack roots to match.
const repoRoot = path.join(__dirname, '..');

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: repoRoot,
  turbopack: {
    root: repoRoot,
  },

  async rewrites() {
    // Do NOT use NEXT_PUBLIC_API_URL here — that env is for the browser bundle and often set to
    // http://localhost:5000, which overrides this and breaks proxying (wrong host / IPv6).
    // Server-side proxy target only:
    const backend =
      process.env.NEXT_INTERNAL_API_URL || 'http://127.0.0.1:5000';
    const base = String(backend).replace(/\/$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${base}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
