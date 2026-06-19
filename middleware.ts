import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Runtime'da o'qiladi (NEXT_PUBLIC_ emas, build'ga muzlamasligi uchun).
const API_URL = process.env.API_URL || "http://10.181.1.76:8085";

// Login talab qilinmaydigan yo'llar
const PUBLIC_PATHS = [
  "/login", "/kiosk-config",
  "/display", "/queueDisplay",   // TV monitor ekranlari — login kerak emas
  "/_next", "/favicon", "/images", "/iib.png", "/api",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

function isTokenValid(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    const exp = typeof payload.exp === "number" ? payload.exp : 0;
    return exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function getTokenMaxAge(token: string): number {
  try {
    const parts = token.split(".");
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    const exp = typeof payload.exp === "number" ? payload.exp : 0;
    const remaining = exp - Math.floor(Date.now() / 1000);
    return remaining > 0 ? remaining : 86400;
  } catch {
    return 86400;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) return NextResponse.next();

  const accessToken  = req.cookies.get("kiosk_access_token")?.value  ?? "";
  const displayToken = req.cookies.get("display_token")?.value        ?? "";

  // Display token yoki access token valid bo'lsa — o'tkazib yuborish
  if (isTokenValid(displayToken) || isTokenValid(accessToken)) {
    return NextResponse.next();
  }

  // Access token eskirgan — refresh token bilan yangilashga urinish
  const refreshToken = req.cookies.get("kiosk_refresh_token")?.value ?? "";
  if (refreshToken) {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (res.ok) {
        const data = await res.json();
        const result = data.data ?? data;
        const newAccessToken: string | undefined = result.access_token;

        if (newAccessToken) {
          const response = NextResponse.next();
          response.cookies.set("kiosk_access_token", newAccessToken, {
            path: "/",
            sameSite: "lax",
            maxAge: getTokenMaxAge(newAccessToken),
          });
          const newRefresh: string | undefined = result.refresh_token;
          if (newRefresh) {
            response.cookies.set("kiosk_refresh_token", newRefresh, {
              path: "/",
              sameSite: "lax",
              maxAge: 30 * 24 * 3600,
            });
          }
          return response;
        }
      }
    } catch {
      // Refresh muvaffaqiyatsiz — login ga yo'naltirish
    }
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|iib.png).*)",
  ],
};
