"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { getEquipmentByBuilding, type Equipment } from "@/app/lib/api/equipment"


function getKioskBuildingId(): string {
  if (typeof window === "undefined") return ""
  try {
    const cfg = localStorage.getItem("kioskConfig")
    if (cfg) return (JSON.parse(cfg) as { buildingId?: string }).buildingId || ""
  } catch { /* ignore */ }
  return ""
}

export function Technologies() {
  const searchParams = useSearchParams()
  const urlBuildingId = searchParams.get("building_id")
  const [buildingId, setBuildingId] = useState(urlBuildingId || "")

  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!urlBuildingId) {
      const fromStorage = getKioskBuildingId()
      if (fromStorage) setBuildingId(fromStorage)
      else setLoading(false)
    }
  }, [urlBuildingId])

  useEffect(() => {
    if (!buildingId) { setLoading(false); return }
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getEquipmentByBuilding(buildingId)
        setEquipment(data)
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-900 via-blue-700 to-cyan-600 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          Professional Tibbiy Uskunalar
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto text-blue-100 leading-relaxed">
          Komissiyamizda eng zamonaviy va yuqori sifatli tibbiy asbob-uskunalar ishlatiladi.
          Barcha diagnostika va tekshiruvlar xalqaro standartlarga muvofiq amalga oshiriladi.
        </p>
      </section>

      {/* Carousel */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {equipment.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 text-lg py-20">
              {buildingId
                ? "Bu bino uchun uskunalar hali qo'shilmagan."
                : "Bino ID ko'rsatilmagan. URL ga ?building_id=... qo'shing."}
            </p>
          ) : (
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {equipment.map((item) => (
                  <CarouselItem
                    key={item.id}
                    className="py-2 pl-2 md:pl-4 md:basis-1/2 xl:basis-1/3"
                  >
                    <TechCard item={item} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex items-center justify-center mt-8 gap-4">
                <CarouselPrevious className="w-14 h-14 ml-5 cursor-pointer rounded-full bg-blue-900 hover:bg-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all" />
                <CarouselNext className="w-14 h-14 mr-5 cursor-pointer rounded-full bg-blue-900 hover:bg-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all" />
              </div>
            </Carousel>
          )}
        </div>
      </section>

      {/* Stats */}
      {equipment.length > 0 && (
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/20 rounded-3xl p-12 text-center shadow-lg">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8">
              Texnologik Imkoniyatlar
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-12">
              Zamonaviy uskunalar yordamida yuqori sifatli diagnostika
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <StatItem number={`${equipment.length}+`} label="Zamonaviy Asbob" />
              <StatItem number="100%" label="Aniqlik" />
              <StatItem number="15+" label="Yillik Tajriba" />
              <StatItem number="10+" label="Mutaxassislar" />
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function TechCard({ item }: { item: Equipment }) {
  return (
    <Card className="h-full p-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:border-blue-500 dark:hover:border-blue-400">
      <CardContent className="p-0">
        <div className="h-60 relative overflow-hidden bg-slate-100 dark:bg-slate-700">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-5xl">🔬</div>
          )}
        </div>
        <div className="p-6 bg-gradient-to-b from-white/60 to-blue-50/30 dark:from-slate-800/40 dark:to-blue-900/10">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center">
            {item.title}
          </h3>
          {item.description && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 text-center line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-black text-blue-600 dark:text-blue-400 mb-2">{number}</div>
      <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">{label}</div>
    </div>
  )
}
