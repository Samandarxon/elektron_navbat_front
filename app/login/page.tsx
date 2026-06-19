"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import {
  loginKiosk,
  saveKioskTokens,
  decodeJwtPayload,
  type KioskUser,
} from "@/app/lib/api/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await loginKiosk(username.trim(), password);

      // Foydalanuvchi roli tekshiruvi
      if (data.user?.role && data.user.role !== "kiosk") {
        setError("Bu tizim faqat kiosk foydalanuvchilari uchun.");
        setLoading(false);
        return;
      }

      // Decode JWT to get polyclinic_id and building_id
      const payload = decodeJwtPayload(data.access_token);
      const polyclinicId =
        (payload.polyclinic_id as string | undefined) ??
        data.user?.polyclinic_id ??
        "";
      const buildingId =
        (payload.building_id as string | undefined) ??
        (data.user as Record<string, unknown>)?.building_id as string | undefined;

      if (!polyclinicId) {
        setError(
          "Bu foydalanuvchi poliklinikaga bog'lanmagan. Iltimos, admin bilan bog'laning.",
        );
        setLoading(false);
        return;
      }

      const kioskUser: KioskUser = {
        id: data.user?.id ?? "",
        username: data.user?.username ?? username.trim(),
        role: data.user?.role ?? "kiosk",
        polyclinic_id: polyclinicId,
        building_id: buildingId,
      };

      saveKioskTokens(data.access_token, data.refresh_token, polyclinicId, buildingId, kioskUser);

      // kioskConfig ni JWT dan olingan ma'lumotlar bilan to'ldirish
      localStorage.setItem(
        "kioskConfig",
        JSON.stringify({
          polyclinicId,
          polyclinicName: "",
          buildingId: buildingId ?? "",
          buildingName: "",
          kioskCode: username.trim(),
        }),
      );

      // To'liq qayta yuklash (router.replace emas): QueueProvider root layout'da
      // bo'lgani uchun client-navigatsiyada qayta mount bo'lmaydi. Full reload bilan
      // provider yangi token + kioskConfig bilan toza mount bo'ladi → data darhol keladi.
      window.location.replace("/");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Noma'lum xatolik yuz berdi",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(15, 46, 92, 0.95), rgba(26, 67, 120, 0.9))",
          backgroundColor: "#0f2e5c",
        }}
      />

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <Image src="/iib.png" alt="IIBB logo" width={100} height={100} className="mb-4" />
            <h1 className="text-2xl font-black text-white text-center leading-tight">
              Kiosk Tizimi
            </h1>
            <p className="text-white/60 text-sm mt-1 text-center">
              Toshkent IIBB Tibbiyot bo'limi
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Foydalanuvchi nomi
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-base"
                placeholder="kiosk_user"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Parol
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-base"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-xl text-red-200 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-200 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Kirish...
                </span>
              ) : (
                "Kirish"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
