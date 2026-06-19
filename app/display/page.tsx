"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import QueueDisplay from "@/components/pages/queue-display";
import { Monitor, Building2, AlertCircle, Lock } from "lucide-react";
import { saveDisplayToken, getDisplayToken, getKioskToken } from "@/app/lib/api/auth";

function DisplayContent() {
  const params = useSearchParams();
  const router = useRouter();
  const buildingId   = params.get("building_id") || "";
  const kioskCode    = params.get("kiosk") || "";
  const buildingName = params.get("building_name") || "";
  const urlToken     = params.get("token") || "";

  // Mount holati — token/localStorage o'qish faqat client'da bo'lishi kerak.
  // Aks holda server "token yo'q" deb (Lock ekran), client "token bor" deb
  // (QueueDisplay) renderlaydi va hydration mismatch xatosi chiqadi.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // URL dan display_token kelsa — localStorage ga saqlash
  useEffect(() => {
    if (urlToken) {
      saveDisplayToken(urlToken);
    }
  }, [urlToken]);

  // Token yo'q va login ham yo'q — auth xatosi (faqat mount'dan keyin tekshiramiz)
  const hasToken = urlToken || (mounted && (getDisplayToken() || getKioskToken()));

  // Server va client'ning birinchi render'i bir xil bo'lishi uchun — mount'gacha
  // neytral yuklanish ekrani ko'rsatamiz.
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!buildingId) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Kiosk sozlanmagan</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            URL da <code className="text-yellow-400 bg-gray-800 px-1.5 py-0.5 rounded">building_id</code> parametri
            ko'rsatilmagan. To'g'ri URL formatidan foydalaning:
          </p>
          <div className="bg-gray-800 rounded-xl p-4 text-left space-y-2">
            <p className="text-gray-500 text-xs mb-1">Display token bilan:</p>
            <code className="text-green-400 text-xs break-all block">
              /display?building_id=UUID&amp;token=DISPLAY_TOKEN
            </code>
            <p className="text-gray-500 text-xs mt-2 mb-1">Kiosk login bilan:</p>
            <code className="text-blue-400 text-xs break-all block">
              /display?building_id=UUID&amp;kiosk=KIOSK-01
            </code>
          </div>
          <p className="text-gray-500 text-xs">
            Display token admin paneldan → Display bo'limidan generatsiya qiling
          </p>
          <button
            onClick={() => router.push("/login")}
            className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-xl transition"
          >
            Kiosk sifatida kirish
          </button>
        </div>
      </div>
    );
  }

  if (!hasToken) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <Lock className="w-16 h-16 text-yellow-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Autentifikatsiya talab qilinadi</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Display ekranini ko'rish uchun token kerak.
            URL ga <code className="text-yellow-400 bg-gray-800 px-1.5 py-0.5 rounded">?token=</code> qo'shing
            yoki kiosk sifatida login qiling.
          </p>
          <div className="bg-gray-800 rounded-xl p-4 text-left">
            <code className="text-green-400 text-xs break-all">
              /display?building_id={buildingId}&amp;token=DISPLAY_TOKEN
            </code>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-xl transition"
          >
            Kiosk sifatida kirish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <QueueDisplay />

      {/* Kiosk identifikatsiya banneri — pastda. Yuqorida QueueDisplay'ning
          o'z navbar header'i (fixed top-0) bor, shuning uchun bu strip pastga
          joylashtirilgan: aks holda logo/sarlavhani yarmigacha yopib qo'yardi. */}
      {kioskCode && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between
                        bg-black/80 backdrop-blur-sm px-4 py-1.5 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Building2 className="w-3.5 h-3.5" />
            <span>{buildingName || buildingId.slice(0, 8) + "..."}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <Monitor className="w-3.5 h-3.5" />
            <span>{kioskCode}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DisplayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    }>
      <DisplayContent />
    </Suspense>
  );
}
