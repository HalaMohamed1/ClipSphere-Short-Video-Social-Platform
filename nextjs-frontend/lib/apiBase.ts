/**
 * Base URL for API calls from the browser.
 * - Empty: same-origin `/api/v1/...` — Next.js rewrites to Express (see next.config.mjs).
 * - Non-empty: direct URL to Express (needs CORS on the API — enabled in src/index.js).
 *
 * Values like `http://localhost:5000` are treated as empty so the Next proxy is used
 * (avoids cross-origin when your .env still points at the backend port).
 */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (raw === undefined || raw === '') return '';
  const base = raw.replace(/\/$/, '');
  const isDefaultBackend =
    base === 'http://localhost:5000' ||
    base === 'http://127.0.0.1:5000';
  if (isDefaultBackend) return '';
  return base;
}

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBaseUrl();
  return base ? `${base}${p}` : p;
}
