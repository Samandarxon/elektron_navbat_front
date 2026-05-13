"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  ArrowLeft,
  Sun,
  Moon,
  Monitor,
  RotateCcw,
  MapPin,
  X,
  Bell,
  Wifi,
  WifiOff,
} from "lucide-react";
import Link from "next/link";
import { useQueue } from "@/contexts/queueContext";
import type { DisplayTicket } from "@/app/lib/api/doctors";

export default function QueueDisplay() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Context dan hamma kerakli ma'lumotlar
  const {
    currentCall,
    showModal,
    closeModal,
    tickets,
    isConnected,
    loadingTickets,
  } = useQueue();

  // Navbatni status bo'yicha ajratish
  const inProgressQueues: DisplayTicket[] = tickets.filter(
    (q) => q.status === "in-progress"
  );
  const waitingQueues: DisplayTicket[] = tickets.filter(
    (q) => q.status === "waiting"
  );

  // Yangi ticket kelganda oxirgi yangilanish vaqtini o'rnatish
  useEffect(() => {
    setLastUpdate(new Date());
  }, [tickets.length]);

  useEffect(() => {
    const savedTheme =
      (localStorage.getItem("theme") as "light" | "dark") || "light";
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

  // Kutish vaqtini hisoblash
  const calculateWaitTime = useCallback(
    (queue: DisplayTicket) => {
      const waitingIndex = waitingQueues.findIndex((q) => q.id === queue.id);
      if (waitingIndex === -1) return queue.estimatedWait;
      const estimatedMinutes = (inProgressQueues.length * 5) + (waitingIndex * 5);
      return `${estimatedMinutes || 5} daqiqa`;
    },
    [waitingQueues, inProgressQueues]
  );

  if (loadingTickets && tickets.length === 0) {
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

      {/* Chaqiruv Modali */}
      {showModal && currentCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fadeIn">
          <style jsx>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
            @keyframes ring {
              0% { transform: rotate(0deg); } 10% { transform: rotate(15deg); }
              20% { transform: rotate(-15deg); } 30% { transform: rotate(15deg); }
              40% { transform: rotate(-15deg); } 50% { transform: rotate(0deg); }
            }
            .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
            .animate-scaleIn { animation: scaleIn 0.4s ease-out; }
            .animate-pulse-custom { animation: pulse 1.5s ease-in-out infinite; }
            .animate-ring { animation: ring 0.5s ease-in-out; }
          `}</style>

          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border-4 border-green-500 dark:border-green-400 mx-4 max-w-lg w-full animate-scaleIn relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 opacity-50"></div>

            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-lg"
            >
              <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>

            <div className="p-10 text-center relative z-10">
              <div className="mb-6 flex justify-center animate-ring">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                  <Bell className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-8">
                Navbatingiz Keldi!
              </h2>

              <div className="mb-8 bg-linear-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl p-6 shadow-xl animate-pulse-custom">
                <div className="text-sm text-blue-100 mb-2 font-medium">NAVBAT RAQAMI</div>
                <div className="text-7xl font-black text-white drop-shadow-lg">
                  #{currentCall.ticketNumber}
                </div>
              </div>

              <div className="mb-8 bg-linear-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-2xl p-6 shadow-xl">
                <div className="text-sm text-green-100 mb-2 font-medium">XONA RAQAMI</div>
                <div className="text-6xl font-black text-white drop-shadow-lg">
                  {currentCall.room}
                </div>
              </div>

              <div className="bg-linear-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 border-2 border-green-300 dark:border-green-700 rounded-2xl p-5 shadow-inner">
                <div className="text-xl font-bold text-green-700 dark:text-green-300 mb-1">
                  Iltimos, Qabulga Kiring!
                </div>
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Doktor sizni kutmoqda
                </div>
              </div>

              <div className="mt-6 text-xs text-slate-500 dark:text-slate-400">
                Bu xabar 8 sekunddan keyin avtomatik yopiladi
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-40 p-4 bg-linear-to-r from-blue-900 via-blue-700 to-cyan-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 shadow-lg border-b border-white/10 dark:border-slate-600/30">
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
                Navbat Ekrani
              </h1>
              <p className="text-blue-100 dark:text-slate-300 text-sm sm:text-base flex items-center gap-2 mt-1">
                <Monitor className="w-4 h-4 text-blue-200 dark:text-slate-400" />
                Joriy navbatlar ro'yxati
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* WebSocket holati */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                isConnected
                  ? "bg-green-500/20 text-green-200 border border-green-500/30"
                  : "bg-red-500/20 text-red-200 border border-red-500/30"
              }`}
            >
              {isConnected ? (
                <><Wifi className="w-3 h-3" /> Jonli</>
              ) : (
                <><WifiOff className="w-3 h-3" /> Ulanmoqda...</>
              )}
            </div>

            <Badge
              variant="secondary"
              className="bg-white/20 dark:bg-slate-800/80 backdrop-blur-sm border border-white/30 dark:border-slate-600 text-white dark:text-slate-200 text-sm font-medium px-3 py-2 rounded-xl shadow-sm flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              {currentTime.toLocaleTimeString("uz-UZ")}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-600 rounded-2xl shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {inProgressQueues.length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Jarayonda</div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-600 rounded-2xl shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                  {waitingQueues.length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Kutishda</div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-600 rounded-2xl shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {tickets.length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Jami Navbat</div>
              </CardContent>
            </Card>
          </div>

          {tickets.length === 0 ? (
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-600 rounded-2xl shadow-lg">
              <CardContent className="p-8 text-center">
                <p className="text-slate-600 dark:text-slate-300 text-lg">
                  Hozirda navbatlar mavjud emas
                </p>
                {!isConnected && (
                  <p className="text-red-500 text-sm mt-2">
                    WebSocket ulanishi yo'q — backend ishlayaptimi?
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Kutish */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  Kutish ({waitingQueues.length})
                </h2>
                <div className="space-y-4">
                  {waitingQueues.map((queue) => (
                    <Card
                      key={queue.id}
                      className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-yellow-400"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Badge className="bg-yellow-500 dark:bg-yellow-600 text-white px-3 py-1 font-semibold text-sm">
                            Kutish
                          </Badge>
                          <div className="text-4xl font-black text-blue-600 dark:text-blue-400">
                            {queue.queueDisplay}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                            {queue.doctorName}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                            {queue.specialization}
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                              <MapPin className="w-4 h-4 text-blue-500" />
                              <span className="font-medium">{queue.room}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                              <Clock className="w-4 h-4 text-purple-500" />
                              <span className="font-medium">
                                {calculateWaitTime(queue)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Jarayonda */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  Jarayonda ({inProgressQueues.length})
                </h2>
                <div className="space-y-4">
                  {inProgressQueues.map((queue) => (
                    <Card
                      key={queue.id}
                      className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-green-500 dark:border-green-400 rounded-xl shadow-lg"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Badge className="bg-green-500 dark:bg-green-600 text-white px-3 py-1 font-semibold text-sm">
                            Jarayonda
                          </Badge>
                          <div className="text-4xl font-black text-blue-600 dark:text-blue-400">
                            {queue.queueDisplay}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                            {queue.doctorName}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                            {queue.specialization}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">{queue.room}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Oxirgi yangilanish */}
          <Card className="mt-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-600 rounded-2xl shadow-lg">
            <CardContent className="p-4 text-center">
              <p className="text-slate-600 dark:text-slate-300 text-sm flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Oxirgi yangilanish: {lastUpdate.toLocaleTimeString("uz-UZ")} |{" "}
                {isConnected
                  ? "Real-time WebSocket orqali yangilanmoqda"
                  : "Ulanish yo'q — qayta ulanmoqda..."}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
