const SESSION_EXPIRED_EVENT = "nmdc:session-expired";

export function notifySessionExpired() {
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

export function onSessionExpired(handler) {
  window.addEventListener(SESSION_EXPIRED_EVENT, handler);
  return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler);
}

/** Returns the JWT `exp` claim in milliseconds, or null for missing/opaque/mock tokens. */
export function getTokenExpiry(token) {
  if (typeof token !== "string") return null;
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const exp = JSON.parse(json)?.exp;
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

/** Session lifetime is bounded by the refresh token; fall back to the access token when there is none. */
export function getSessionExpiry(tokens) {
  if (!tokens) return null;
  return getTokenExpiry(tokens.refresh) ?? (tokens.refresh ? null : getTokenExpiry(tokens.access));
}

export function isSessionExpired(tokens, now = Date.now()) {
  const expiry = getSessionExpiry(tokens);
  return expiry !== null && expiry <= now;
}
