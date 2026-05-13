
export function getAuthCookieOptions() {
  const maxAgeMs = parseJwtExpireToMs(process.env.JWT_EXPIRE || '24h');

  // COOKIE_SECURE can override the default (production=true) —
  // set it to 'false' when running behind an HTTP-only reverse proxy (e.g. Docker without TLS).
  const secure =
    process.env.COOKIE_SECURE !== undefined
      ? process.env.COOKIE_SECURE === 'true'
      : process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeMs,
  };
}

function parseJwtExpireToMs(expire) {
  const match = String(expire).match(/^(\d+)([smhd])$/i);
  if (!match) return 24 * 60 * 60 * 1000;
  const n = parseInt(match[1], 10);
  const u = match[2].toLowerCase();
  const mult = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return n * (mult[u] || 24 * 60 * 60 * 1000);
}
