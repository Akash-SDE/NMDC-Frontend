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

/** Demo OTP accepted when mock auth is used (or API is unreachable in DEV). */
export const DEMO_OTP = "123456";

function isKnownDemoEmail(email) {
  const normalized = email.trim().toLowerCase();
  return Object.values(DEMO_CREDENTIALS).some(
    (account) => account.email === normalized,
  );
}

function mockSendOtp(email) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error("Please enter your email.");
  }
  if (!isKnownDemoEmail(normalizedEmail) && !import.meta.env.DEV) {
    throw new Error("No account found for this email.");
  }
  return {
    message: "OTP sent successfully.",
    email: normalizedEmail,
    expires_in: 300,
    otp: DEMO_OTP,
  };
}

function mockVerifyOtp(email, otp) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedOtp = String(otp).trim();

  if (!normalizedEmail || normalizedOtp.length < 4) {
    throw new Error("Invalid email or OTP.");
  }

  if (isKnownDemoEmail(normalizedEmail) && normalizedOtp !== DEMO_OTP) {
    throw new Error("Invalid or expired OTP.");
  }

  return {
    access: `mock_access_${Date.now()}`,
    refresh: `mock_refresh_${Date.now()}`,
  };
}

export async function sendLoginOtp(email) {
  const preferMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

  if (preferMock) {
    return mockSendOtp(email);
  }

  try {
    return await apiRequest({
      url: "/user/v1/auth/send-otp",
      method: "POST",
      data: { email: email.trim() },
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      return mockSendOtp(email);
    }
    throw parseApiError(error);
  }
}

export async function loginWithOtp(email, otp) {
  const preferMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

  if (preferMock) {
    return mockVerifyOtp(email, otp);
  }

  try {
    return await apiRequest({
      url: "/user/v1/auth/verify-otp",
      method: "POST",
      data: { email: email.trim(), otp: String(otp).trim() },
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      return mockVerifyOtp(email, otp);
    }
    throw parseApiError(error);
  }
}

/** @deprecated Prefer loginWithOtp — kept for any leftover password callers. */
export async function loginWithCredentials(email, password) {
  const preferMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

  if (preferMock) {
    return mockVerifyOtp(email, password);
  }

  try {
    return await apiRequest({
      url: "/token/",
      method: "POST",
      data: { email, password },
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      return mockVerifyOtp(email, password);
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
