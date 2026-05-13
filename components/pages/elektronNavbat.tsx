"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, ArrowLeft, Sun, Moon, X, Printer, Loader2 } from "lucide-react";
import Link from "next/link";
import { addToQueue, type Doctor } from "@/app/lib/api/doctors";
import { useQueue } from "@/contexts/queueContext";

export type { Doctor };

const PRINT_URL =
  process.env.NEXT_PUBLIC_PRINTER_URL
    ? `${process.env.NEXT_PUBLIC_PRINTER_URL}/print-ticket`
    : "http://localhost:8080/print-ticket";

const PRINTER_API_KEY =
  process.env.NEXT_PUBLIC_PRINTER_API_KEY ||
  "SECRET-PRINTER-KEY-b21ecca4618d929c6f24e0f7245ca7b50740f6509e455f3b1c165d70";

export default function ElektronNavbat() {
  const { doctors, loadingDoctors } = useQueue();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as "light" | "dark") || "light";
    setTheme(savedTheme);
    document.documentElement.className = savedTheme;
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
      // 1. Backendda haqiqiy ticket yaratish
      const ticket = await addToQueue({ doctor_id: selectedDoctor.id });

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

      // 3. POS80 printerga yuborish
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
        // Printer ulanmagan bo'lsa ham ticket yaratildi — xatoni yutamiz
        console.warn("Printer ulanmagan. Ticket yaratildi:", ticket.queue_display);
      }

      setShowPrintModal(false);
      setSelectedDoctor(null);
      // Doktorlar ro'yxatini yangilash shart emas — backend event jo'natadi
    } catch (error: any) {
      alert(error?.message || "Navbat olishda xatolik. Qayta urinib ko'ring.");
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
            <Link href="/">
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
