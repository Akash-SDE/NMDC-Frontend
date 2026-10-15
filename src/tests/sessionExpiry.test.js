import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient, writeTokens } from "../api/axiosClient";
import { getSessionExpiry, isSessionExpired, onSessionExpired } from "../api/session";
import { TOKEN_STORAGE_KEY } from "../constants/storageKeys";

function makeJwt(expSeconds) {
  const encode = (obj) => btoa(JSON.stringify(obj)).replace(/=+$/, "");
  return `${encode({ alg: "HS256" })}.${encode({ exp: expSeconds })}.sig`;
}

const nowSeconds = () => Math.floor(Date.now() / 1000);

function unauthorized(config) {
  const error = new Error("Request failed with status code 401");
  error.config = config;
  error.response = { status: 401, data: { detail: "Given token not valid for any token type" } };
  return Promise.reject(error);
}

const settlesWithin = (promise, ms = 50) =>
  Promise.race([
    promise.then(() => "resolved", () => "rejected"),
    new Promise((resolve) => setTimeout(() => resolve("pending"), ms)),
  ]);

describe("session expiry helpers", () => {
  it("uses the refresh token expiry as the session expiry", () => {
    const refreshExp = nowSeconds() + 3600;
    const tokens = { access: makeJwt(nowSeconds() + 60), refresh: makeJwt(refreshExp) };
    expect(getSessionExpiry(tokens)).toBe(refreshExp * 1000);
    expect(isSessionExpired(tokens)).toBe(false);
  });

  it("reports an expired refresh token as an expired session", () => {
    const tokens = { access: makeJwt(nowSeconds() - 10), refresh: makeJwt(nowSeconds() - 1) };
    expect(isSessionExpired(tokens)).toBe(true);
  });

  it("ignores mock and malformed tokens", () => {
    expect(getSessionExpiry({ access: "mock_access", refresh: "mock_refresh" })).toBeNull();
    expect(isSessionExpired({ access: "not-a-jwt", refresh: null })).toBe(false);
    expect(isSessionExpired(null)).toBe(false);
  });
});

describe("axios 401 handling", () => {
  const originalAdapter = apiClient.defaults.adapter;
  let expired;
  let unsubscribe;

  beforeEach(() => {
    expired = vi.fn();
    unsubscribe = onSessionExpired(expired);
  });

  afterEach(() => {
    unsubscribe();
    apiClient.defaults.adapter = originalAdapter;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    vi.restoreAllMocks();
  });

  it("logs out instead of surfacing the error when the refresh token is rejected", async () => {
    writeTokens({ access: makeJwt(nowSeconds() - 10), refresh: makeJwt(nowSeconds() - 1) });
    apiClient.defaults.adapter = unauthorized;
    vi.spyOn(axios, "post").mockRejectedValue(
      Object.assign(new Error("401"), { response: { status: 401, data: {} } }),
    );

    const outcome = await settlesWithin(apiClient.get("/dashboard/"));

    expect(outcome).toBe("pending");
    expect(expired).toHaveBeenCalledTimes(1);
  });

  it("refreshes the access token and retries when the refresh token is still valid", async () => {
    writeTokens({ access: makeJwt(nowSeconds() - 10), refresh: makeJwt(nowSeconds() + 3600) });
    const fresh = makeJwt(nowSeconds() + 600);
    vi.spyOn(axios, "post").mockResolvedValue({ data: { access: fresh } });
    apiClient.defaults.adapter = (config) =>
      config._retry
        ? Promise.resolve({ data: { ok: true }, status: 200, statusText: "OK", headers: {}, config })
        : unauthorized(config);

    const response = await apiClient.get("/dashboard/");

    expect(response.data).toEqual({ ok: true });
    expect(expired).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem(TOKEN_STORAGE_KEY)).access).toBe(fresh);
  });

  it("leaves 401s from unauthenticated calls (e.g. wrong OTP) to the caller", async () => {
    apiClient.defaults.adapter = unauthorized;

    await expect(apiClient.post("/auth/verify-otp/", {})).rejects.toMatchObject({ status: 401 });
    expect(expired).not.toHaveBeenCalled();
  });
});
