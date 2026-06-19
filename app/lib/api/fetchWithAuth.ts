// app/lib/api/fetchWithAuth.ts
// Kiosk yoki display JWT tokenini har bir requestga avtomatik qo'shadigan fetch wrapper

import { getKioskToken, getDisplayToken, clearKioskSession, refreshKioskToken } from "./auth";

// Display sahifalari — 401 da login redirect bo'lmasin
const DISPLAY_PATHS = ["/display", "/queueDisplay"];

function isDisplayPage(): boolean {
  if (typeof window === "undefined") return false;
  return DISPLAY_PATHS.some((p) => window.location.pathname.startsWith(p));
}

// Bir vaqtda bir nechta so'rov 401 olsa, bittasi refresh qiladi, qolganlari kutadi
let pendingRefresh: Promise<string | null> | null = null;

export async function fetchWithAuth(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  // Kiosk token ustuvorlik, bo'lmasa display_token
  const token = getKioskToken() || getDisplayToken();

  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 && typeof window !== "undefined" && !isDisplayPage()) {
    // Refresh token bilan yangi access token olishga urinish
    if (!pendingRefresh) {
      pendingRefresh = refreshKioskToken().finally(() => {
        pendingRefresh = null;
      });
    }
    const newToken = await pendingRefresh;

    if (newToken) {
      // Yangi token bilan so'rovni qayta yuborish
      const retryHeaders: Record<string, string> = {
        ...(options?.headers as Record<string, string>),
        Authorization: `Bearer ${newToken}`,
      };
      return fetch(url, { ...options, headers: retryHeaders });
    }

    // Refresh ham muvaffaqiyatsiz — sessiyani tozalab login sahifasiga yo'naltirish
    clearKioskSession();
    window.location.replace("/login");
  }

  return res;
}
