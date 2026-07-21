import { TOKEN_STORAGE_KEY } from "../constants/storageKeys";

export function isMockToken(token) {
  return typeof token === "string" && token.startsWith("mock_");
}

export function readStoredTokens() {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isMockSession() {
  const tokens = readStoredTokens();
  if (!tokens) return import.meta.env.VITE_USE_MOCK_AUTH === "true";
  return isMockToken(tokens.access) || isMockToken(tokens.refresh);
}
