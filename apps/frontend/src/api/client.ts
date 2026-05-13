const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const TOKEN_KEY = "aicloud.accessToken";
const FIELD_LABELS: Record<string, string> = {
  email: "이메일",
  password: "비밀번호",
  name: "이름",
  nickname: "닉네임",
  phone: "연락처"
};
const API_MESSAGES: Record<string, string> = {
  "Email already exists": "이미 가입된 이메일입니다. 로그인해 주세요.",
  "Invalid email or password": "이메일 또는 비밀번호가 올바르지 않습니다.",
  "Invalid or expired token": "로그인이 만료되었습니다. 다시 로그인해 주세요.",
  "Authorization bearer token is required": "로그인이 필요합니다."
};
const VALIDATION_MESSAGES: Record<string, string> = {
  "Invalid email": "올바른 이메일 형식으로 입력해 주세요."
};

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function toUserMessage(message: string): string {
  return API_MESSAGES[message] ?? VALIDATION_MESSAGES[message] ?? message;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getAccessToken();

  if (!headers.has("content-type") && options.body) {
    headers.set("content-type", "application/json");
  }
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const fieldErrors = payload?.error?.details?.fieldErrors as Record<string, string[]> | undefined;
    const firstFieldError = fieldErrors
      ? Object.entries(fieldErrors).find(([, messages]) => messages.length > 0)
      : undefined;
    const message = firstFieldError
      ? `${FIELD_LABELS[firstFieldError[0]] ?? firstFieldError[0]}: ${toUserMessage(firstFieldError[1][0])}`
      : toUserMessage(payload?.error?.message ?? `Request failed with ${response.status}`);
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
