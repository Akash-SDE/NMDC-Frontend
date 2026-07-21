import { apiRequest } from "../../api/axiosClient";
import { parseApiError } from "../../api/apiError";

export const DEMO_CREDENTIALS = {
  admin: {
    email: "admin@nmdc.local",
    password: "admin123",
  },
  superadmin: {
    email: "superadmin@nmdc.local",
    password: "admin123",
  },
  operator: {
    email: "operator@nmdc.local",
    password: "admin123",
  },
  station_master: {
    email: "station@nmdc.local",
    password: "admin123",
  },
  commercial: {
    email: "commercial@nmdc.local",
    password: "admin123",
  },
  cw_inspector: {
    email: "cw@nmdc.local",
    password: "admin123",
  },
};

function mockLoginWithCredentials(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  if (!normalizedEmail || normalizedPassword.length < 3) {
    throw new Error("Invalid email or password.");
  }

  const knownAccount = Object.values(DEMO_CREDENTIALS).find(
    (account) => account.email === normalizedEmail,
  );

  if (knownAccount && knownAccount.password !== normalizedPassword) {
    throw new Error("Invalid email or password.");
  }

  return {
    access: `mock_access_${Date.now()}`,
    refresh: `mock_refresh_${Date.now()}`,
  };
}

export async function loginWithCredentials(email, password) {
  const preferMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

  if (preferMock) {
    return mockLoginWithCredentials(email, password);
  }

  try {
    return await apiRequest({
      url: "/token/",
      method: "POST",
      data: { email, password },
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      return mockLoginWithCredentials(email, password);
    }
    throw parseApiError(error);
  }
}

export async function refreshAccessToken(refreshToken) {
  try {
    return await apiRequest({
      url: "/token/refresh/",
      method: "POST",
      data: { refresh: refreshToken },
    });
  } catch (error) {
    throw parseApiError(error);
  }
}
