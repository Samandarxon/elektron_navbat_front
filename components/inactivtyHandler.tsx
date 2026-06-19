"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function InactivityHandler({ timeout = 5 * 60 * 1000 }) {
  const router = useRouter();
  const pathname = usePathname(); // joriy URL pathini olish
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Bu sahifalar passiv/maxsus ekranlar — inactivity bo'yicha bosh sahifaga
  // qaytarilmasin (devorga osilgan display, doktor ekrani va h.k.).
  const callHome = ["/display", "/queueDisplay", "/doctor-management", "/doctor"];

  useEffect(() => {
    // Agar joriy sahifa /queueDisplay bo‘lsa, qaytish funksiyasi ishlamasin
    if (
      callHome.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
      )
    ) {
      return;
    }

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        router.push("/"); // bosh menuga qaytish
      }, timeout);
    };

    const events = ["mousemove", "mousedown", "keypress", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // dastlabki timer

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [pathname, router, timeout]);

  return null;
}
