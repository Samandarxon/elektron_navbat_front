"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { getDoctors, getDoctorsByBuilding, type Doctor } from "@/app/lib/api/doctors"
import { hasValidToken } from "@/app/lib/api/auth"


function getKioskBuildingId(): string {
  if (typeof window === "undefined") return ""
  try {
    const cfg = localStorage.getItem("kioskConfig")
    if (cfg) return (JSON.parse(cfg) as { buildingId?: string }).buildingId || ""
  } catch { /* ignore */ }
  return ""
}

export function Doctors() {
  const searchParams = useSearchParams()
  const urlBuildingId = searchParams.get("building_id")
  const [buildingId, setBuildingId] = useState(urlBuildingId || "")

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!urlBuildingId) {
      const fromStorage = getKioskBuildingId()
      if (fromStorage) setBuildingId(fromStorage)
    }
  }, [urlBuildingId])

  useEffect(() => {
    const load = async () => {
      if (!hasValidToken()) {
        console.log("[Doctors] token yo'q — fetch o'tkazib yuborildi");
        setLoading(false);
        return;
      }
      try {
        setLoading(true)
        setError(null)
        const data = buildingId
          ? await getDoctorsByBuilding(buildingId)
          : await getDoctors()
        setDoctors(data)
      } catch (e: any) {
        setError(e.message || "Xatolik yuz berdi")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [buildingId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center text-red-500">
          <p className="text-xl font-bold mb-2">Xatolik</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-900 via-blue-700 to-cyan-600 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          Professional Jamoa
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto text-blue-100 leading-relaxed">
          Malakali shifokorlar va tibbiyot xodimlari jamoasi — sog'ligingiz uchun eng yaxshi mutaxassislar.
        </p>
      </section>

      {/* Doctors Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {doctors.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 text-lg py-20">
              Hozircha shifokorlar mavjud emas.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function DoctorCard({ doctor }: { doctor: Doctor }) {
  const statusColor =
    doctor.status === "available"
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"

  const statusLabel = doctor.status === "available" ? "Band emas" : "Band"

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl border-2 border-slate-200 dark:border-slate-700 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 hover:border-blue-500 dark:hover:border-blue-400">
      {/* Avatar */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-3xl flex-shrink-0">
          {doctor.icon || "👨‍⚕️"}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight line-clamp-2">
            {doctor.name}
          </h3>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 truncate">
            {doctor.specialization}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center justify-between mt-3">
        {doctor.room && doctor.room !== "—" && (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            🚪 {doctor.room}
          </span>
        )}
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor}`}>
          {statusLabel}
        </span>
      </div>
    </div>
  )
}
