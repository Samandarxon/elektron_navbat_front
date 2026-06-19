// lib/runtime-env.ts
// ─────────────────────────────────────────────────────────────────────────────
// Runtime (ishga tushish paytidagi) konfiguratsiya.
//
// MUHIM: bu qiymatlar build paytida emas, server ISHGA TUSHGANDA o'qiladi.
// Shu sabab bitta build'ni har xil serverga/kioskka qo'yib, faqat .env (yoki OS
// muhit o'zgaruvchilari) orqali sozlash mumkin — qayta build qilish SHART EMAS.
//
//   • Server tomonda  -> process.env dan o'qiladi (standalone server runtime'da)
//   • Client tomonda  -> window.__ENV__ dan o'qiladi (app/layout.tsx inject qiladi)
//
// Eslatma: o'zgaruvchilar NEXT_PUBLIC_ prefiksisiz bo'lishi shart. Aks holda
// Next.js ularni build paytida kodga "muzlatib" yozadi va runtime o'zgarmaydi.
// ─────────────────────────────────────────────────────────────────────────────

export interface RuntimeEnv {
  API_URL: string;
  WS_URL: string;
  PRINTER_URL: string;
  PRINTER_API_KEY: string;
}

// .env berilmaganda ishlatiladigan zaxira qiymatlar
const DEFAULTS = {
  API_URL: "http://10.181.1.76:8085",
  PRINTER_URL: "http://localhost:8080",
  PRINTER_API_KEY:
    "SECRET-PRINTER-KEY-b21ecca4618d929c6f24e0f7245ca7b50740f6509e455f3b1c165d70",
} as const;

// http(s):// -> ws(s):// ga aylantirish (WS_URL ko'rsatilmaganda)
function httpToWs(url: string): string {
  return url.replace(/^http/, "ws");
}

declare global {
  interface Window {
    __ENV__?: Partial<RuntimeEnv>;
  }
}

/**
 * Server tomonida runtime muhitni o'qiydi (Node standalone server / middleware).
 * Faqat server kodida chaqirilishi kerak.
 */
export function readServerEnv(): RuntimeEnv {
  const API_URL = process.env.API_URL || DEFAULTS.API_URL;
  return {
    API_URL,
    WS_URL: process.env.WS_URL || httpToWs(API_URL),
    PRINTER_URL: process.env.PRINTER_URL || DEFAULTS.PRINTER_URL,
    PRINTER_API_KEY: process.env.PRINTER_API_KEY || DEFAULTS.PRINTER_API_KEY,
  };
}

/**
 * Ham server, ham client'da ishlaydigan universal o'quvchi.
 *   • Server: process.env (runtime)
 *   • Client: window.__ENV__ (layout inject qilgan qiymatlar)
 */
export function getRuntimeEnv(): RuntimeEnv {
  if (typeof window === "undefined") {
    return readServerEnv();
  }

  const injected = window.__ENV__ ?? {};
  const configuredApi = injected.API_URL || DEFAULTS.API_URL;

  // ─── Multi-homed (bir nechta tarmoqli) server muammosini hal qilish ───
  // Frontend va backend bitta serverda turadi, lekin u bir nechta IP ga ega
  // bo'lishi mumkin (masalan 10.181.1.76 va 192.168.100.125). Display bir
  // tarmoqdan, kiosk boshqasidan ochilishi mumkin. .env dagi qat'iy IP barcha
  // brauzerlar uchun yetib bormaydi. Shuning uchun API/WS hostini brauzer ayni
  // ochib turgan host bilan almashtiramiz (portni .env/default dan saqlaymiz) —
  // shunda har bir klient o'zi ulanган host orqali backendga ham ulanadi.
  let API_URL = configuredApi;
  let WS_URL = injected.WS_URL || httpToWs(configuredApi);
  try {
    const u = new URL(configuredApi);
    const host = window.location.hostname; // masalan "10.181.1.76"
    const portPart = u.port ? `:${u.port}` : "";
    API_URL = `${u.protocol}//${host}${portPart}`;
    const wsProto = u.protocol === "https:" ? "wss:" : "ws:";
    WS_URL = `${wsProto}//${host}${portPart}`;
  } catch {
    /* configuredApi noto'g'ri bo'lsa — yuqoridagi qiymatlar qoladi */
  }

  return {
    API_URL,
    WS_URL,
    PRINTER_URL: injected.PRINTER_URL || DEFAULTS.PRINTER_URL,
    PRINTER_API_KEY: injected.PRINTER_API_KEY || DEFAULTS.PRINTER_API_KEY,
  };
}
