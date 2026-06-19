// app/lib/api/auth.ts
import { getRuntimeEnv } from "@/lib/runtime-env";
const API_URL = getRuntimeEnv().API_URL;

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    username: string;
    role: string;
    polyclinic_id?: string;
  };
  expires_in: number;
}

export async function loginKiosk(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Login muvaffaqiyatsiz. Foydalanuvchi nomi yoki parol noto'g'ri.");
  }

  const data = await res.json();
  return data.data ?? data;
}

export interface KioskPageSettings {
  id: string;
  polyclinic_id: string;
  page_key: string;
  title?: string;
  subtitle?: string;
  description?: string;
  bg_images: string[];
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  btn_primary_text?: string;
  btn_secondary_text?: string;
  btn_primary_url?: string;
  btn_secondary_url?: string;
  is_active: boolean;
}

export async function getKioskSettings(polyclinicId: string): Promise<KioskPageSettings[]> {
  const res = await fetch(`${API_URL}/api/v1/public/kiosk-settings?polyclinic_id=${encodeURIComponent(polyclinicId)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
}

// JWT payload decode (no verification needed on client — backend verifies)
export function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return {};
  }
}

const KIOSK_TOKEN_KEY     = "kiosk_access_token";
const KIOSK_REFRESH_KEY   = "kiosk_refresh_token";
const KIOSK_POLYCLINIC_KEY = "kiosk_polyclinic_id";
const KIOSK_BUILDING_KEY  = "kiosk_building_id";
const KIOSK_USER_KEY      = "kiosk_user";

export interface KioskUser {
  id: string;
  username: string;
  full_name?: string;
  role: string;
  polyclinic_id?: string;
  building_id?: string;
}

function setCookie(name: string, value: string, days = 1) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

function removeCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

export function saveKioskTokens(
  accessToken: string,
  refreshToken: string,
  polyclinicId: string,
  buildingId?: string,
  user?: KioskUser,
) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KIOSK_TOKEN_KEY, accessToken);
  localStorage.setItem(KIOSK_REFRESH_KEY, refreshToken);
  localStorage.setItem(KIOSK_POLYCLINIC_KEY, polyclinicId);
  if (buildingId) localStorage.setItem(KIOSK_BUILDING_KEY, buildingId);
  else localStorage.removeItem(KIOSK_BUILDING_KEY);
  if (user) localStorage.setItem(KIOSK_USER_KEY, JSON.stringify(user));
  // Middleware uchun cookie (localStorage ni middleware ko'rmaydi)
  setCookie(KIOSK_TOKEN_KEY, accessToken);
  setCookie(KIOSK_REFRESH_KEY, refreshToken, 30);
}

export function getKioskToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KIOSK_TOKEN_KEY);
}

export function getKioskRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KIOSK_REFRESH_KEY);
}

export function getKioskPolyclinicId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KIOSK_POLYCLINIC_KEY);
}

export function getKioskBuildingId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KIOSK_BUILDING_KEY);
}

export function getKioskUser(): KioskUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KIOSK_USER_KEY);
    return raw ? (JSON.parse(raw) as KioskUser) : null;
  } catch { return null; }
}

export function clearKioskSession() {
  if (typeof window === "undefined") return;
  [KIOSK_TOKEN_KEY, KIOSK_REFRESH_KEY, KIOSK_POLYCLINIC_KEY, KIOSK_BUILDING_KEY, KIOSK_USER_KEY, "kioskConfig"]
    .forEach((k) => localStorage.removeItem(k));
  removeCookie(KIOSK_TOKEN_KEY);
  removeCookie(KIOSK_REFRESH_KEY);
}

export function isKioskLoggedIn(): boolean {
  const token = getKioskToken();
  if (!token) return false;
  try {
    const payload = decodeJwtPayload(token);
    const exp = payload.exp as number;
    return typeof exp === "number" && exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export async function refreshKioskToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const refreshToken = getKioskRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const result = data.data ?? data;
    const accessToken: string | undefined = result.access_token;
    if (!accessToken) return null;
    const newRefresh: string = result.refresh_token ?? refreshToken;
    localStorage.setItem(KIOSK_TOKEN_KEY, accessToken);
    localStorage.setItem(KIOSK_REFRESH_KEY, newRefresh);
    setCookie(KIOSK_TOKEN_KEY, accessToken);
    setCookie(KIOSK_REFRESH_KEY, newRefresh, 30);
    return accessToken;
  } catch {
    return null;
  }
}

// ─── Display token (TV monitor/display ekranlar uchun) ───
const DISPLAY_TOKEN_KEY = "display_token";

export function saveDisplayToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DISPLAY_TOKEN_KEY, token);
  // Middleware uchun cookie ham (localStorage ni middleware ko'rmaydi)
  try {
    const payload = decodeJwtPayload(token);
    const exp = payload.exp as number;
    const days = exp ? Math.ceil((exp * 1000 - Date.now()) / 864e5) : 30;
    setCookie(DISPLAY_TOKEN_KEY, token, days);
  } catch {
    setCookie(DISPLAY_TOKEN_KEY, token, 30);
  }
}

export function getDisplayToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(DISPLAY_TOKEN_KEY);
}

export function clearDisplayToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DISPLAY_TOKEN_KEY);
  removeCookie(DISPLAY_TOKEN_KEY);
}

export function isDisplayTokenValid(): boolean {
  const token = getDisplayToken();
  if (!token) return false;
  try {
    const payload = decodeJwtPayload(token);
    const exp = payload.exp as number;
    return typeof exp === "number" && exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

// Mavjud token (kiosk yoki display) ni qaytaradi
export function getAnyToken(): string | null {
  return getKioskToken() || getDisplayToken();
}

// Istalgan valid token mavjudligini tekshiradi (auth guard uchun)
export function hasValidToken(): boolean {
  if (typeof window === "undefined") return false;
  return isKioskLoggedIn() || isDisplayTokenValid();
}
