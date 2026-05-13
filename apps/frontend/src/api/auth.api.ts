import { apiRequest, clearAccessToken, setAccessToken } from "./client";

export interface PublicUser {
  id: string;
  email: string;
  nickname: string;
  role: string;
  onpremProfileId: string | null;
}

interface AuthPayload {
  user: PublicUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export async function signup(input: {
  email: string;
  password: string;
  name: string;
  nickname: string;
  phone: string;
}): Promise<AuthPayload> {
  const payload = await apiRequest<AuthPayload>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(input)
  });
  clearAccessToken();
  return payload;
}

export async function login(input: { email: string; password: string }): Promise<AuthPayload> {
  const payload = await apiRequest<AuthPayload>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input)
  });
  setAccessToken(payload.tokens.accessToken);
  return payload;
}

export async function getMe(): Promise<PublicUser> {
  const payload = await apiRequest<{ user: PublicUser }>("/api/users/me");
  return payload.user;
}

export async function updateMe(input: { nickname?: string }): Promise<PublicUser> {
  const payload = await apiRequest<{ user: PublicUser }>("/api/users/me", {
    method: "PATCH",
    body: JSON.stringify(input)
  });
  return payload.user;
}

export async function changePassword(input: { currentPassword: string; newPassword: string }): Promise<void> {
  await apiRequest("/api/users/me/password", {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

function ignoreMissingEndpoint(error: unknown): void {
  if (error instanceof Error && error.message.includes("404")) {
    return;
  }
  throw error;
}

export async function requestPasswordReset(email: string): Promise<void> {
  try {
    await apiRequest("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email })
    });
  } catch (error) {
    ignoreMissingEndpoint(error);
  }
}

export async function resetPassword(input: { token: string; password: string }): Promise<void> {
  try {
    await apiRequest("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    ignoreMissingEndpoint(error);
  }
}

export async function verifyEmail(token: string): Promise<void> {
  try {
    await apiRequest("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token })
    });
  } catch (error) {
    ignoreMissingEndpoint(error);
  }
}

export function logout(): void {
  clearAccessToken();
}
