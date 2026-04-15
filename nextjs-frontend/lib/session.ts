/** Persist JWT for both `useAuth` (localStorage) and `proxy.ts` (cookie). */
export function setSessionToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
  const maxAge = 60 * 60 * 24; // 24h — align with typical JWT expiry
  document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearSessionToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  document.cookie = "token=; path=/; max-age=0";
}
