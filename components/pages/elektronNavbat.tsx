"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, ArrowLeft, Sun, Moon, X, Printer, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { addToQueue, type Doctor } from "@/app/lib/api/doctors";
import { useQueue } from "@/contexts/queueContext";
import { getRuntimeEnv } from "@/lib/runtime-env";

export type { Doctor };

const { PRINTER_URL, PRINTER_API_KEY } = getRuntimeEnv();
const PRINT_URL = `${PRINTER_URL}/print-ticket`;

function getUrlParam(key: string): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(key) || "";
}

function getKioskId(): string {
  return getUrlParam("kiosk_id");
}

function getBuildingId(): string {
  const fromUrl = getUrlParam("building_id");
  if (fromUrl) return fromUrl;
  try {
    const cfg = localStorage.getItem("kioskConfig");
    if (cfg) return (JSON.parse(cfg) as { buildingId?: string }).buildingId || "";
  } catch { /* ignore */ }
  return "";
}

export default function ElektronNavbat() {
  const { doctors, loadingDoctors } = useQueue();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [printing, setPrinting] = useState(false);
  // Chek chiqarish natijasi haqida chiroyli bildirishnoma (success/error)
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    queueDisplay?: string;
    room?: string;
    message?: string;
  } | null>(null);
  const kioskId = getKioskId();
  const buildingId = getBuildingId();

  const homeHref = (() => {
    const params = new URLSearchParams();
    if (buildingId) params.set("building_id", buildingId);
    if (kioskId) params.set("kiosk_id", kioskId);
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  })();

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as "light" | "dark") || "light";
    setTheme(savedTheme);
    document.documentElement.className = savedTheme;
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Bildirishnomani avtomatik yopish (success 5s, error 6s)
  useEffect(() => {
    if (!feedback) return;
    const ms = feedback.kind === "success" ? 5000 : 6000;
    const t = setTimeout(() => setFeedback(null), ms);
    return () => clearTimeout(t);
  }, [feedback]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.className = newTheme;
  };

  // Doktor tanlananda faqat tasdiqlash modalini ochadi
  const handlePrintClick = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowPrintModal(true);
  };

  // Tasdiqlash: ticket yaratadi va printga yuboradi
  const handleConfirmPrint = async () => {
    if (!selectedDoctor || printing) return;
    setPrinting(true);

    try {
      // 1. Backendda haqiqiy ticket yaratish (kiosk_id bo'lsa backend print yuboradi)
      const ticket = await addToQueue({
        doctor_id: selectedDoctor.id,
        kiosk_id: kioskId || undefined,
        building_id: buildingId || undefined,
      });

      // 2. Printer uchun ma'lumot
      const printData = {
        ticket_id: ticket.id,
        room_number: selectedDoctor.roomNumber,
        department_name: selectedDoctor.specialization,
        queue_number: ticket.queue_display,  // "A-005" formatida
        doctor_id: ticket.doctor_id,
        created_at: new Date().toLocaleTimeString("uz-UZ"),
        status: "waiting",
      };

      // 3. Print: kiosk_id bo'lsa backend o'zi yuboradi,
      //    bo'lmasa (eski konfiguratsiya) to'g'ridan localhost ga yuboramiz
      if (!kioskId) {
        try {
          const printRes = await fetch(PRINT_URL, {
            method: "POST",
            headers: {
              "X-API-Key": PRINTER_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(printData),
          });
          if (!printRes.ok) {
            console.warn(`Printer xatosi: ${printRes.status} — ticket yaratildi lekin chop etilmadi`);
          }
        } catch {
          console.warn("Printer ulanmagan. Ticket yaratildi:", ticket.queue_display);
        }
      }

      // Muvaffaqiyat: tasdiqlash modalini yopib, chiroyli bildirishnoma ko'rsatamiz
      const room = selectedDoctor.roomNumber;
      setShowPrintModal(false);
      setSelectedDoctor(null);
      setFeedback({
        kind: "success",
        queueDisplay: ticket.queue_display,
        room,
      });
      // Doktorlar ro'yxatini yangilash shart emas — backend event jo'natadi
    } catch (error: any) {
      // Xatolik: tasdiqlash modalini ham yopamiz va xato bildirishnomasini ko'rsatamiz
      setShowPrintModal(false);
      setSelectedDoctor(null);
      setFeedback({
        kind: "error",
        message:
          error?.message || "Navbat olishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
      });
    } finally {
      setPrinting(false);
    }
  };

  const handleCancelPrint = () => {
    if (printing) return;
    setShowPrintModal(false);
    setSelectedDoctor(null);
  };

  if (loadingDoctors) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Natija bildirishnomasi (success / error) */}
      {feedback && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setFeedback(null)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tepa rangli chiziq */}
            <div
              className={`h-2 w-full ${feedback.kind === "success" ? "bg-emerald-500" : "bg-red-500"}`}
            />
            <button
              onClick={() => setFeedback(null)}
              className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="px-8 py-9 text-center">
              {feedback.kind === "success" ? (
                <>
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                    <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Chek chiqarildi
                  </h2>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">
                    Navbatingiz muvaffaqiyatli rasmiylashtirildi
                  </p>

                  <div className="mt-6 rounded-2xl bg-slate-50 dark:bg-slate-700/40 px-6 py-5">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Sizning navbat raqamingiz
                    </p>
                    <p className="mt-1 text-5xl font-black tracking-tight text-blue-600 dark:text-blue-400">
                      {feedback.queueDisplay}
                    </p>
                    {feedback.room && (
                      <p className="mt-3 text-lg font-semibold text-slate-700 dark:text-slate-200">
                        {feedback.room}-xona
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
                    <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Xatolik yuz berdi
                  </h2>
                  <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feedback.message}
                  </p>
                </>
              )}

              <Button
                onClick={() => setFeedback(null)}
                className={`mt-7 w-full py-6 text-base font-semibold rounded-xl ${
                  feedback.kind === "success"
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-slate-700 hover:bg-slate-600"
                } text-white`}
              >
                Yopish
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tasdiqlash Modali */}
      {showPrintModal && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 border-2 border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-600">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Navbat Tasdiqlash
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancelPrint}
                disabled={printing}
                className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Printer className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Navbat Ma'lumotlari
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Tasdiqlasangiz navbat raqami chop etiladi
                </p>
              </div>

              {/* Doktor ma'lumotlari */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6 border border-slate-200 dark:border-slate-600">
                <div className="text-center space-y-3">
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedDoctor.specialization}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    Doktor: {selectedDoctor.name}
                  </div>
                  {selectedDoctor.roomNumber && (
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      Xona: {selectedDoctor.room}
                    </div>
                  )}
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Vaqt: {currentTime.toLocaleTimeString("uz-UZ")}
                  </div>
                </div>
              </div>

              {/* Tugmalar */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancelPrint}
                  disabled={printing}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Bekor Qilish
                </Button>
                <Button
                  onClick={handleConfirmPrint}
                  disabled={printing}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {printing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Yaratilmoqda...
                    </>
                  ) : (
                    <>
                      <Printer className="w-4 h-4 mr-2" />
                      Chop Etish
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-linear-to-r from-blue-900 via-blue-700 to-cyan-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 shadow-lg border-b border-white/10 dark:border-slate-600/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={homeHref}>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/30 text-white transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                Elektron Navbat
              </h1>
              <p className="text-blue-100 dark:text-slate-300 text-sm sm:text-base flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4 text-blue-200 dark:text-slate-400" />
                Joriy vaqt:{" "}
                <span className="font-semibold text-white dark:text-slate-200">
                  {currentTime.toLocaleTimeString("uz-UZ")}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge
              variant="secondary"
              className="bg-white/20 dark:bg-slate-800/80 backdrop-blur-sm border border-white/30 dark:border-slate-600 text-white dark:text-slate-200 text-sm sm:text-base font-medium px-4 py-2 rounded-xl shadow-sm flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              {currentTime.toLocaleDateString("uz-UZ", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Badge>

            <Button
              onClick={toggleTheme}
              className="cursor-pointer relative w-12 h-12 rounded-full border border-white/30 dark:border-slate-600 bg-white/10 dark:bg-slate-800/80 hover:bg-white/20 dark:hover:bg-slate-700/80 transition-all duration-300 flex items-center justify-center group"
              aria-label="Toggle theme"
            >
              <Sun
                className={`w-5 h-5 absolute transition-all duration-300 ${
                  theme === "light"
                    ? "scale-100 rotate-0 text-amber-300"
                    : "scale-0 -rotate-90 text-amber-200"
                }`}
              />
              <Moon
                className={`w-5 h-5 absolute transition-all duration-300 ${
                  theme === "dark"
                    ? "scale-100 rotate-0 text-blue-300"
                    : "scale-0 rotate-90 text-blue-200"
                }`}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-600 rounded-2xl shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {doctors.filter((d) => d.status === "available").length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Bo'sh Doktorlar</div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-600 rounded-2xl shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                  {doctors.filter((d) => d.status === "busy").length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Band Doktorlar</div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-600 rounded-2xl shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {doctors.length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Jami Doktorlar</div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-600 rounded-2xl shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
                  {doctors.filter((d) => d.status === "break").length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Tanaffusda</div>
              </CardContent>
            </Card>
          </div>

          {/* Doktorlar ro'yxati */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="mt-auto pt-4">
                <Button
                  className="w-full bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 dark:from-blue-700 dark:to-cyan-700 dark:hover:from-blue-600 dark:hover:to-cyan-600 text-white font-semibold py-24 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] relative overflow-hidden group"
                  onClick={() => handlePrintClick(doctor)}
                >
                  <span className="text-2xl font-bold text-center leading-tight wrap-break-words whitespace-normal block px-2">
                    {doctor.specialization}
                  </span>
                </Button>
              </div>
            ))}
          </div>

          {/* Ko'rsatma */}
          <Card className="mt-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-600 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Navbat olish bo'yicha ko'rsatma
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-green-500 dark:bg-green-400"></div>
                  <span className="text-slate-600 dark:text-slate-300">
                    Yashil - Doktor bo'sh, navbat olish mumkin
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 dark:bg-yellow-400"></div>
                  <span className="text-slate-600 dark:text-slate-300">
                    Sariq - Doktor band, kutish kerak
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-red-500 dark:bg-red-400"></div>
                  <span className="text-slate-600 dark:text-slate-300">
                    Qizil - Tanaffus, keyinroq urinib ko'ring
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
