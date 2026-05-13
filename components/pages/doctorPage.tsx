// doctor-page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  ArrowLeft,
  Play,
  CheckCircle,
  User,
  Phone,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getDoctors,
  updateDoctorStatus,
  getQueue,
  updateQueueStatus,
  deleteQueueItem,
  getDoctorsWithPolling,
  getQueueWithPolling,
  type Doctor,
  type DisplayTicket,
} from "@/app/lib/api/doctors";
import { usePolling } from "@/hooks/usePolling";
import { useQueue } from "@/contexts/queueContext";

export default function DoctorPage() {
  const params = useParams();
  const doctorId = params.id;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [queue, setQueue] = useState<DisplayTicket[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
const [lastCalledPatient, setLastCalledPatient] = useState<DisplayTicket | null>(null);


  const { data: doctors = [], loading: doctorsLoading } = usePolling(
    getDoctorsWithPolling,
    3000
  );
  const { data: allQueue = [], loading: queueLoading } = usePolling(
    getQueueWithPolling,
    3000
  );

  // Move all state updates to useEffect
  useEffect(() => {
    setLoading(doctorsLoading || queueLoading);
  }, [doctorsLoading, queueLoading]);

  useEffect(() => {
    if (doctors && doctors.length > 0) {
      const foundDoctor = doctors.find((d) => d.id === doctorId) ?? null;
      setDoctor(foundDoctor);

      if (foundDoctor && allQueue) {
        const doctorQueue = allQueue.filter(
          (q) => q.doctorName === foundDoctor.name
        );
        setQueue(doctorQueue);
      }
    }
  }, [doctors, allQueue, doctorId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadDoctorData = async () => {
    try {
      setLoading(true);
      const [doctorsData, queueData] = await Promise.all([
        getDoctors(),
        getQueue(),
      ]);

      // ID bo'yicha doktorni topish
      const foundDoctor = doctorsData?.find((d) => d.id === doctorId);

      if (!foundDoctor) {
        throw new Error("Doktor topilmadi");
      }

      setDoctor(foundDoctor);

      // Faqat shu doktorga tegishli navbatlarni filtrlash
      const doctorQueue = queueData?.filter(
        (q) => q.doctorName === foundDoctor.name
      ) ?? [];
      setQueue(doctorQueue);
    } catch (error) {
      console.error("Ma'lumotlarni yuklashda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDoctorStatus = async (status: Doctor["status"]) => {
    if (!doctor) return;

    try {
      await updateDoctorStatus(doctor.id, status);
      setDoctor((prev) => (prev ? { ...prev, status } : null));
    } catch (error) {
      console.error("Xatolik:", error);
    }
  };

 // State qo'shamiz

// callNextPatient funksiyasini yangilaymiz
const callNextPatient = async () => {
  if (!doctor) return;

  try {
    // Kutayotgan navbatlarni topish
    const waitingQueue = queue
      ?.filter((q) => q.status === "waiting")
      .sort((a, b) => a.ticketNumber - b.ticketNumber);

    if (waitingQueue.length === 0) {
      alert("Kutayotgan navbatlar mavjud emas");
      return;
    }

    const nextPatient = waitingQueue[0];

    console.log("🎯 Doktor chaqirish tugmasi bosildi:", {
      ticketNumber: nextPatient.ticketNumber,
      room: doctor.room,
      doctor: doctor.name,
    });

    // 1. Navbat statusini yangilash (in-progress)
    await updateQueueStatus(nextPatient.id, "in-progress");

    // 2. Doktor statusini busy qilish
    await handleUpdateDoctorStatus("busy");

    // 3. Audio: backend CallNext orqali kiosk notified (WebSocket + pos80_driver)
    // 4. Last called patient ni saqlaymiz
    setLastCalledPatient(nextPatient);

    // 6. Ma'lumotlarni yangilash
    await loadDoctorData();
  } catch (error) {
    console.error("❌ Navbatni chaqirishda xatolik:", error);
    alert(
      "Navbatni chaqirishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
    );
  }
};

// Yangi funksiya: qayta chaqirish
const recallPatient = async () => {
  if (!doctor) return;

  // Faqat joriy bemorni qayta chaqirish
  const current = queue?.find((q) => q.status === "in-progress");
  if (!current) {
    alert("Hozirda qayta chaqiriladigan bemor yo'q");
    return;
  }

  try {
    // Backend CallNext orqali kiosk audio notified
    await updateQueueStatus(current.id, "called");
    console.log("✅ Qayta chaqirish (status updated):", current.queueDisplay);
  } catch (error) {
    console.error("❌ Qayta chaqirishda xatolik:", error);
    alert("Qayta chaqirishda xatolik yuz berdi.");
  }
};

// completeCurrentQueue funksiyasini yangilaymiz
const completeCurrentQueue = async () => {
  if (!doctor) return;

  try {
    // Joriy navbatni topish
    const currentQueueItem = queue?.find((q) => q.status === "in-progress");

  

    if (currentQueueItem) {
      // 1. Local state ni darhol yangilash
      setQueue((prevQueue) =>
        prevQueue?.filter((q) => q.id !== currentQueueItem.id)
      );
      
      // Last called patient ni tozalaymiz
      setLastCalledPatient(null);
      
      // Navbatni o'chirish
      await deleteQueueItem(currentQueueItem.id);
    }

    // Doktor statusini available qilish
    await handleUpdateDoctorStatus("available");

  } catch (error) {
    console.error("Xatolik:", error);
    await loadDoctorData();
  }
};

  const getCurrentPatient = () => {
    return queue?.find((q) => q.status === "in-progress");
  };

  const getWaitingPatients = () => {
    return queue
      ?.filter((q) => q.status === "waiting")
      .sort((a, b) => a.ticketNumber - b.ticketNumber);
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

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Doktor topilmadi</p>
          <Link href="/doctor-queue-management">
            <Button className="mt-4">Boshqaruv sahifasiga qaytish</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentPatient = getCurrentPatient();
  const waitingPatients = getWaitingPatients();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/doctor-queue-management">
                <Button variant="outline" size="icon" className="rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>

              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Doktor Profili
                </h1>
                <p className="text-slate-600 dark:text-slate-300 text-sm flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4" />
                  {currentTime.toLocaleTimeString("uz-UZ")}
                </p>
              </div>
            </div>

            <Button
              onClick={loadDoctorData}
              variant="outline"
              className="flex items-center gap-2"
            >
              Yangilash
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Doctor Info Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  {doctor.icon && (
                    <span className="text-2xl">{doctor.icon}</span>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {doctor.name}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 text-lg">
                      {doctor.specialization}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-4 h-4" />
                    <span>Xona: {doctor.room}</span>
                  </div>
                  {doctor.phone && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Phone className="w-4 h-4" />
                      <span>{doctor.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
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
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Queue Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Patient */}
           {currentPatient ? (
  <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
          Joriy Bemor
        </h3>
        <Badge className="bg-blue-500 text-white">Jarayonda</Badge>
      </div>

      <div className="text-center py-4">
        <div className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-2">
          #{currentPatient.ticketNumber}
        </div>
        <p className="text-blue-700 dark:text-blue-300">
          Xizmat ko'rsatilmoqda
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={completeCurrentQueue}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Navbatni Tugatish
        </Button>
        
        {/* Qayta chaqirish tugmasi */}
        <Button
          onClick={recallPatient}
          variant="outline"
          className="w-full border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
          size="lg"
        >
          <Play className="w-5 h-5 mr-2" />
          Qayta Chaqirish
        </Button>
      </div>
    </CardContent>
  </Card>
) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-slate-400 dark:text-slate-500 mb-4">
                    <User className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    Joriy bemor yo'q
                  </h3>
                  <p className="text-slate-500 dark:text-slate-500 text-sm">
                    Hozirda hech qanday bemor xizmat ko'rsatilmayapti
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Call Next Button */}
            {waitingPatients?.length > 0 && (
              <Button
                onClick={callNextPatient}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
                size="lg"
              >
                <Play className="w-6 h-6 mr-2" />
                Keyingi Navbatni Chaqirish (#{waitingPatients[0].ticketNumber})
              </Button>
            )}

            {/* Status Management */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Holatni Boshqarish
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleUpdateDoctorStatus("available")}
                    variant={
                      doctor.status === "available" ? "default" : "outline"
                    }
                    className={
                      doctor.status === "available"
                        ? "bg-green-600 hover:bg-green-700"
                        : ""
                    }
                  >
                    Bo'sh
                  </Button>
                  <Button
                    onClick={() => handleUpdateDoctorStatus("busy")}
                    variant={doctor.status === "busy" ? "default" : "outline"}
                    className={
                      doctor.status === "busy"
                        ? "bg-yellow-600 hover:bg-yellow-700"
                        : ""
                    }
                  >
                    Band
                  </Button>
                  <Button
                    onClick={() => handleUpdateDoctorStatus("break")}
                    variant={doctor.status === "break" ? "default" : "outline"}
                    className={
                      doctor.status === "break"
                        ? "bg-red-600 hover:bg-red-700"
                        : ""
                    }
                  >
                    Tanaffus
                  </Button>
                  <Button onClick={loadDoctorData} variant="outline">
                    Yangilash
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Waiting Queue */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Kutayotgan Navbatlar
                  </h3>
                  <Badge variant="secondary">
                    {waitingPatients?.length} ta
                  </Badge>
                </div>

                {waitingPatients?.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {waitingPatients?.map((patient) => (
                      <div
                        key={patient.id}
                        className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-300 font-bold text-sm">
                                #{patient.ticketNumber}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                Navbat #{patient.ticketNumber}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {patient.timestamp}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-slate-400 dark:text-slate-500 mb-2">
                      <Clock className="w-8 h-8 mx-auto" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      Kutayotgan navbatlar yo'q
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
