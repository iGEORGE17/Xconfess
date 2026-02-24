import { AUTH_TOKEN_KEY } from "./constants";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export interface AuthTokenPayload {
  sub: string;
  email?: string;
  iat: number;
  exp: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
}

export function saveToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function decodeToken(token: string): AuthTokenPayload | null {
  try {
    const base64Payload = token.split(".")[1];
    if (!base64Payload) return null;

    const base64 = base64Payload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(base64Payload.length / 4) * 4, "=");

    const decoded = atob(base64);
    return JSON.parse(decoded) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;

  const payload = decodeToken(token);
  if (!payload) return false;

  return payload.exp * 1000 > Date.now();
}

export function getCurrentUser(): AuthTokenPayload | null {
  const token = getToken();
  if (!token) return null;
  if (!isAuthenticated()) return null;
  return decodeToken(token);
}

export async function login(
  credentials: LoginCredentials,
): Promise<AuthTokenPayload> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Login failed" }));
    throw new Error(error.message ?? "Login failed");
  }

  const data: AuthResponse = await response.json();
  saveToken(data.access_token);

  const payload = decodeToken(data.access_token);
  if (!payload) throw new Error("Invalid token received from server");

  return payload;
}

export function logout(): void {
  removeToken();
}

export async function authFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getToken();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${API_URL}${path}`, { ...options, headers });
}
