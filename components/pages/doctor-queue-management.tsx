// doctor-queue-management.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Clock,
  Calendar,
  ArrowLeft,
  Sun,
  Moon,
  Phone,
  MapPin,
  RotateCcw,
  Search,
  Play,
  Pause,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { usePolling } from "@/hooks/usePolling";
import {
  getDoctorsWithPolling,
  getQueueWithPolling,
  updateDoctorStatus,
  updateQueueStatus,
  deleteQueueItem,
  type Doctor,
  type DisplayTicket,
} from "@/app/lib/api/doctors";
import { isKioskLoggedIn } from "@/app/lib/api/auth";

export default function DoctorQueueManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [queue, setQueue] = useState<DisplayTicket[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const authed = isKioskLoggedIn();
  const { data: doctorsPoll = [], loading: doctorsLoading } = usePolling(getDoctorsWithPolling, 30000, { enabled: authed });
  const { data: queuePoll = [], loading: queueLoading } = usePolling(getQueueWithPolling, 30000, { enabled: authed });
  
  // Move setLoading inside useEffect to prevent re-render loop
  useEffect(() => {
    setLoading(doctorsLoading || queueLoading);
  }, [doctorsLoading, queueLoading]);
  
  useEffect(() => {
    if (doctorsPoll && doctorsPoll.length > 0) {
      setDoctors(doctorsPoll);
    }
    if (queuePoll && queuePoll.length > 0) {
      setQueue(queuePoll);
    }
  }, [doctorsPoll, queuePoll]); // Add dependencies

  useEffect(() => {
    const savedTheme =
      (localStorage.getItem("theme") as "light" | "dark") || "light";
    setTheme(savedTheme);
    document.documentElement.className = savedTheme;
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.className = newTheme;
  };

  const updateDoctorStatusHandler = async (doctorId: string, status: Doctor["status"]) => {
    try {
      await updateDoctorStatus(doctorId, status);
      // Polling avtomatik yangilaydi
    } catch (error) {
      console.error("Xatolik:", error);
      alert("Statusni yangilashda xatolik yuz berdi");
    }
  };

  const callNextPatient = async (doctor: Doctor) => {
    try {
      // Ushbu doktor uchun navbatlarni topish
      const doctorQueue = queue
        .filter((q) => q.doctorName === doctor.name && q.status === "waiting")
        .sort((a, b) => a.ticketNumber - b.ticketNumber);

      if (doctorQueue.length === 0) {
        alert("Ushbu doktor uchun navbatlar mavjud emas");
        return;
      }

      const nextPatient = doctorQueue[0];

      // Navbat statusini yangilash
      await updateQueueStatus(nextPatient.id, "in-progress");

      // Doktor statusini busy qilish
      await updateDoctorStatusHandler(doctor.id, "busy");

      alert(`Navbat #${nextPatient.ticketNumber} chaqirildi!`);
    } catch (error) {
      console.error("Xatolik:", error);
      alert("Navbatni chaqirishda xatolik yuz berdi");
    }
  };

  const completeCurrentQueue = async (doctor: Doctor) => {
    try {
      // Doktorning joriy navbatini topish
      const currentQueueItem = queue.find(
        (q) => q.doctorName === doctor.name && q.status === "in-progress"
      );

      if (currentQueueItem) {
        // Navbatni completed qilish yoki o'chirish
        await deleteQueueItem(currentQueueItem.id);
      }

      // Doktor statusini available qilish
      await updateDoctorStatusHandler(doctor.id, "available");
      
      alert("Navbat muvaffaqiyatli tugatildi!");
    } catch (error) {
      console.error("Xatolik:", error);
      alert("Navbatni tugatishda xatolik yuz berdi");
    }
  };

  const forceRefresh = () => {
    // Polling avtomatik yangilaydi, bu faqat UX uchun
    window.dispatchEvent(new Event('focus'));
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || doctor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getDoctorQueue = (doctorName: string): DisplayTicket[] => {
    return queue.filter((q) => q.doctorName === doctorName);
  };

  const getCurrentPatient = (doctorName: string): DisplayTicket | undefined => {
    return queue.find(
      (q) => q.doctorName === doctorName && q.status === "in-progress"
    );
  };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
  //         <p className="mt-4 text-slate-600">Ma'lumotlar yuklanmoqda...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
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
                Doktor Navbat Boshqaruvi
              </h1>
              <p className="text-blue-100 dark:text-slate-300 text-sm sm:text-base flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4 text-blue-200 dark:text-slate-400" />
                Joriy vaqt:{" "}
                <span className="font-semibold text-white dark:text-slate-200">
                  {currentTime?.toLocaleTimeString("uz-UZ")}
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
          {/* Filters */}
          <Card className="mb-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-600 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Doktor yoki mutaxassislik qidirish..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="all">Barcha holatlar</option>
                  <option value="available">Bo'sh</option>
                  <option value="busy">Band</option>
                  <option value="break">Tanaffus</option>
                </select>

                <div className="flex gap-2">
                  <Button
                    onClick={forceRefresh}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Yangilash
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-rows-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-600 rounded-2xl shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {doctors.filter((d) => d.status === "available").length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Bo'sh Doktorlar
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-600 rounded-2xl shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                  {doctors.filter((d) => d.status === "busy").length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Band Doktorlar
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-600 rounded-2xl shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {queue.filter((q) => q.status === "waiting").length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Kutayotganlar
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-600 rounded-2xl shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
                  {doctors.filter((d) => d.status === "break").length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Tanaffusda
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => {
              const doctorQueue = getDoctorQueue(doctor.name);
              const waitingCount = doctorQueue.filter(
                (q) => q.status === "waiting"
              ).length;
              const currentPatient = getCurrentPatient(doctor.name);

              return (
                <Card
                  key={doctor.id}
                  className={`bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 rounded-2xl shadow-lg transition-all duration-300 ${
                    doctor.status === "available"
                      ? "border-green-500 dark:border-green-400"
                      : doctor.status === "busy"
                      ? "border-yellow-500 dark:border-yellow-400"
                      : "border-red-500 dark:border-red-400"
                  }`}
                >
                  <CardContent className="p-6">
                    {/* Doctor Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Link
                          href={`/doctor/${doctor.id}`}
                          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {doctor.name}
                        </Link>
                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">
                          {doctor.specialization}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <MapPin className="w-4 h-4" />
                            <span>Xona: {doctor.room}</span>
                          </div>
                          {doctor.phone && (
                            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                              <Phone className="w-4 h-4" />
                              <span>{doctor.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Badge
                        className={`${
                          doctor.status === "available"
                            ? "bg-green-500 text-white"
                            : doctor.status === "busy"
                            ? "bg-yellow-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {doctor.status === "available" && "Bo'sh"}
                        {doctor.status === "busy" && "Band"}
                        {doctor.status === "break" && "Tanaffus"}
                      </Badge>
                    </div>

                    {/* Queue Info */}
                    <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {doctor.currentQueue}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          Jami Navbat
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {waitingCount}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          Kutayotgan
                        </div>
                      </div>
                    </div>

                    {/* Current Patient */}
                    {currentPatient && (
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                              Joriy bemor
                            </div>
                            <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                              Navbat #{currentPatient.ticketNumber}
                            </div>
                          </div>
                          <Badge className="bg-blue-500 text-white">
                            Jarayonda
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Queue Instructions */}
          <Card className="mt-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-600 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Boshqaruv Ko'rsatmasi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Play className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-slate-600 dark:text-slate-300">
                    Keyingi navbatni chaqirish
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-slate-600 dark:text-slate-300">
                    Joriy navbatni tugatish
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <Pause className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-slate-600 dark:text-slate-300">
                    Tanaffusga chiqish
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <Play className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-slate-600 dark:text-slate-300">
                    Tanaffusdan qaytish
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