"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  Activity,
  Stethoscope,
  Brain,
  FilePlus,
  Microscope
} from "lucide-react"

export function Services() {
  const services = [
    {
      icon: FilePlus,
      title: "Tibbiy Komissiya",
      desc: "Harbiy maqsadlari uchun to'liq tibbiy ko'rik va komissiya o'tkazish xizmati",
    },
    {
      icon: Microscope,
      title: "Laboratoriya Tekshiruvi",
      desc: "Zamonaviy uskunalar bilan qon, peshob va boshqa biologik materiallar tahlili",
    },
    {
      icon: Activity,
      title: "Diagnostika",
      desc: "Rentgen, UTT, EKG, EFGDS va boshqa diagnostik tekshiruvlar",
    },
    {
      icon: Stethoscope,
      title: "Mutaxassislar ko‘rigi",
      desc: "10 dan ortiq mutaxassis shifokorlar tomonidan to‘liq tibbiy ko‘rik",
    },
    {
      icon: Brain,
      title: "Psixologik baholash",
      desc: "Professional psixolog va psixiatr tomonidan to‘liq psixologik tekshiruv",
    },
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">

      {/* Hero Section */}
      <section className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-blue-900 via-blue-700 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl xl:text-5xl font-black text-white mb-6">
            Bizning Xizmatlarimiz
          </h1>
          <p className="text-xl text-blue-100 opacity-95 max-w-2xl mx-auto leading-relaxed">
            To‘liq kompleks tibbiy tekshiruv va professional maslahat xizmatlari
          </p>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {services.slice(0, 3).map((service, index) => (
              <ServiceCard key={index} service={service} />
            ))}
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {services.slice(3, 5).map((service, index) => (
              <ServiceCard key={index} service={service} />
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}

function ServiceCard({
  service,
}: {
  service: { icon: React.ElementType; title: string; desc: string }
}) {
  const Icon = service.icon
  return (
    <Card className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 rounded-3xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:border-blue-500 dark:hover:border-blue-400">
      <CardContent className="p-0 text-center">
        <div className="w-20 h-20 bg-linear-to-br from-blue-900 to-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
          <Icon size={36} strokeWidth={2.5} />
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          {service.title}
        </h3>

        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          {service.desc}
        </p>
      </CardContent>
    </Card>
  )
}
