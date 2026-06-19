"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { MapPin } from "lucide-react"
import { getLeadershipByPolyclinic, type Leadership } from "@/app/lib/api/leadership"
import { getRuntimeEnv } from "@/lib/runtime-env"

const API_URL = getRuntimeEnv().API_URL

async function getPolyclinicIdByBuilding(buildingId: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/buildings/${buildingId}/info`)
    if (!res.ok) return null
    const json = await res.json()
    return json?.data?.building?.polyclinic_id ?? null
  } catch {
    return null
  }
}

function getKioskConfig(): { buildingId: string; polyclinicId: string } {
  if (typeof window === "undefined") return { buildingId: "", polyclinicId: "" }
  try {
    const cfg = localStorage.getItem("kioskConfig")
    if (cfg) {
      const parsed = JSON.parse(cfg) as { buildingId?: string; polyclinicId?: string }
      return { buildingId: parsed.buildingId || "", polyclinicId: parsed.polyclinicId || "" }
    }
  } catch { /* ignore */ }
  return { buildingId: "", polyclinicId: "" }
}

export function Leadership() {
  const searchParams = useSearchParams()
  const urlBuildingId = searchParams.get("building_id")
  const urlPolyclinicId = searchParams.get("polyclinic_id") ?? ""
  const polyclinicIdParam = urlPolyclinicId
  const [buildingId, setBuildingId] = useState(urlBuildingId || "")

  const [leaders, setLeaders] = useState<Leadership[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!urlBuildingId) {
      const { buildingId: storedBuildingId } = getKioskConfig()
      if (storedBuildingId) setBuildingId(storedBuildingId)
    }
  }, [urlBuildingId])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        let polyclinicId: string | null = polyclinicIdParam || null

        // localStorage dan polyclinicId olishga harakat
        if (!polyclinicId) {
          polyclinicId = getKioskConfig().polyclinicId || null
        }

        // Agar hali ham yo'q bo'lsa, buildingdan lookup
        if (!polyclinicId && buildingId) {
          polyclinicId = await getPolyclinicIdByBuilding(buildingId)
        }

        if (!polyclinicId) {
          setLeaders([])
          setLoading(false)
          return
        }

        const data = await getLeadershipByPolyclinic(polyclinicId)
        setLeaders(data)
      } catch (e: any) {
        setError(e.message || "Xatolik yuz berdi")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [buildingId, polyclinicIdParam])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero */}
      <div className="pt-25 pb-10 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-[#092249] to-[#0d5fe2]">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Bo&apos;lim Rahbariyati
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto">
            Tajribali va malakali rahbariyat jamoamiz bilan tanishing
          </p>
        </div>
      </div>

      {/* Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1500px] mx-auto">
          {leaders.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 text-lg py-20">
              {buildingId || polyclinicIdParam
                ? "Rahbariyat ma'lumotlari hali qo'shilmagan."
                : "Bino yoki poliklinika ID ko'rsatilmagan."}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {leaders.map((leader) => (
                <LeaderCard key={leader.id} leader={leader} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function LeaderCard({ leader }: { leader: Leadership }) {
  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 hover:-translate-y-2">
      {/* Photo */}
      <div className="h-80 md:h-150 xl:h-100 relative overflow-hidden bg-slate-100 dark:bg-slate-700">
        <div className="h-1 absolute top-0 left-0 right-0 z-20 bg-linear-to-r from-blue-900 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        {leader.photo_url ? (
          <Image
            src={leader.photo_url}
            alt={leader.full_name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-6xl">👤</div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 xl:p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
          {leader.rank ? `${leader.rank} ${leader.full_name}` : leader.full_name}
        </h3>
        <p className="text-blue-600 dark:text-blue-400 font-semibold mb-2 text-md">
          {leader.position}
        </p>
        {leader.description && (
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 mt-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium">{leader.description}</span>
          </div>
        )}
      </div>
    </div>
  )
}
