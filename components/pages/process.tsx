"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, Smartphone, Shield, Clock } from "lucide-react"
import Image from "next/image"
import {
  getCommissionStepsByBuilding,
  type CommissionStep,
  type CommissionStepItem,
} from "@/app/lib/api/commission_steps"


function getKioskBuildingId(): string {
  if (typeof window === "undefined") return ""
  try {
    const cfg = localStorage.getItem("kioskConfig")
    if (cfg) return (JSON.parse(cfg) as { buildingId?: string }).buildingId || ""
  } catch { /* ignore */ }
  return ""
}

export function Process() {
  const searchParams = useSearchParams()
  const urlBuildingId = searchParams.get("building_id")
  const [buildingId, setBuildingId] = useState(urlBuildingId || "")

  const [steps, setSteps] = useState<CommissionStep[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!urlBuildingId) {
      const fromStorage = getKioskBuildingId()
      if (fromStorage) setBuildingId(fromStorage)
    }
  }, [urlBuildingId])

  useEffect(() => {
    if (!buildingId) { setLoading(false); return }
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getCommissionStepsByBuilding(buildingId)
        setSteps(data)
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
      {/* Page Header */}
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-blue-900 via-blue-800 to-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl xl:text-5xl font-black mb-4">
            Tibbiy Komissiya Bosqichlari
          </h1>
          <p className="text-xl xl:text-2xl text-blue-100 max-w-2xl mx-auto">
            Harbiy-tibbiy komissiyadan muvaffaqiyatli o&apos;tish uchun quyidagi
            bosqichlarni ketma-ket bajaring
          </p>
        </div>
      </div>

      {/* Steps Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {steps.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 text-lg py-20">
              {buildingId ? "Komissiya bosqichlari hali qo'shilmagan." : "Bino ID ko'rsatilmagan."}
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {steps.map((step) => (
                <StepCard key={step.id} step={step} />
              ))}

              {/* QR Code Section */}
              <div className="lg:col-span-1 xl:col-span-3">
                <div className="h-full bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
                  <div className="flex flex-col xl:flex-row items-center gap-8">
                    <div className="shrink-0">
                      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 border-blue-500 overflow-hidden">
                        <div className="w-48 h-48">
                          <Image
                            src="/images/qrcode/TgQrCode.png"
                            alt="Telegram Bot QR Code"
                            width={192}
                            height={192}
                            className="w-full h-full"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 text-center xl:text-left">
                      <div className="relative flex items-center justify-center md:justify-start gap-3 mb-4">
                        <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400 static lg:absolute top-1 left-0 xl:static" />
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white lg:ml-3">
                          Ma&apos;lumot olish uchun telegram botga o&apos;tish
                        </h3>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg leading-relaxed">
                        QR kodni skanerlang va komissiyaga online ro&apos;yxatdan
                        o&apos;ting. Navbat kutmasdan, tez va qulay!
                      </p>
                      <div className="flex flex-wrap gap-3 justify-center xl:justify-start">
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-blue-500 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                          <Clock className="w-4 h-4" />
                          <span>Vaqtni Tejang</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-blue-500 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                          <Shield className="w-4 h-4" />
                          <span>Xavfsiz</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function StepCard({ step }: { step: CommissionStep }) {
  return (
    <div className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 hover:-translate-y-2">
      <div className="h-1 bg-linear-to-r from-cyan-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

      {step.qr_code_url && (
        <div className="absolute top-4 right-4 z-10">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-xl overflow-hidden border-2 border-blue-200 dark:border-blue-800">
            <Image
              src={step.qr_code_url}
              alt={`QR Code for ${step.title}`}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <div className="p-6 pb-4">
        <div className="w-14 h-14 bg-linear-to-br from-blue-900 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-black mb-4 border-2 border-blue-500 shadow-lg">
          {step.icon || step.step_number}
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          {step.title}
        </h3>
      </div>

      <div className="px-6 pb-6">
        <ul>
          {step.items.map((item, index) => (
            <li
              key={index}
              className={`
                ${typeof item === "string" || (typeof item === "object" && "text" in item)
                  ? "py-4"
                  : "py-[5px] text-sm"}
                flex items-start gap-3 text-slate-700 dark:text-slate-300 text-sm border-b border-slate-100 dark:border-slate-700 last:border-b-0
              `}
            >
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <StepItemContent item={item} />
              </div>
            </li>
          ))}
        </ul>
        {step.extra_info && (
          <div className="flex justify-between pt-10">
            <h2>{step.extra_info.split(":")[0]}:</h2>
            <p>{step.extra_info.split(":")[1]?.trim()}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function StepItemContent({ item }: { item: CommissionStepItem }) {
  if (typeof item === "string") {
    return <span>{item}</span>
  }
  if ("text" in item) {
    return (
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1">
          <span>{item.text}</span>
        </div>
        {item.qr_code && (
          <div className="shrink-0">
            <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-lg overflow-hidden border border-blue-300 dark:border-blue-700">
              <Image
                src={item.qr_code}
                alt="QR Code"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    )
  }
  if ("name" in item) {
    return (
      <div className="flex justify-between items-center w-full">
        <span className="flex-1">{item.name}</span>
        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-xs font-semibold ml-2 whitespace-nowrap">
          {item.price}
        </span>
      </div>
    )
  }
  return null
}
