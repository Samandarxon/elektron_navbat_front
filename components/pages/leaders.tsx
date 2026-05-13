// components/pages/leadership.tsx
"use client"

import { MapPin } from "lucide-react"
import Image from "next/image"

export function Leadership() {
  const leaders = [
    {
      id: 1,
      name: "Podpolkovnik Adilova Gulshod Pulatovna",
      position: "Tibbiy bo'limi Boshlig'i",
      room: "401-xona, Bosh bino",
      image: "/images/leaders-img/leader1.jpg"
    },
    {
      id: 2,
      name: "Kapitan Sharopova Dilafruz Safarovna",
      position: "Xarbiy-tibbiy komissiya raisi",
      room: "203-xona, Bosh bino", 
      image: "/images/leaders-img/leader2.jpg"
    },
    {
      id: 3,
      name: "Podpolkovnik Sherkulov Baxtiyor Panjiyevich",
      position: "Poliklinika boshlig'i",
      room: "201-xona, Bosh bino",
      image: "/images/leaders-img/leader3.jpg"
    },
    {
      id: 4,
      name: "Podpolkovnik Xudaynazarov Sherzod Gopirjonovich",
      position: "Sanitariya epidemiologiya nazorat markazi boshlig'i",
      room: "201-xona, Bosh bino",
      image: "/images/leaders-img/leader4.jpg"
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Page Header */}
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

      {/* Leadership Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1500px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {leaders.map((leader) => (
              <div
                key={leader.id}
                className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 hover:-translate-y-2"
              >
                {/* Top linear border */}
                
                {/* Leader Image */}
                <div className="h-80 md:h-150 xl:h-100 relative overflow-hidden">
                <div className="h-1 absolute top-0 left-0 right-0 z-20 bg-linear-to-r from-blue-900 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  <Image
                    src={leader.image}
                    alt={leader.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                {/* Leader Content */}
                <div className="p-4 xl:p-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                    {leader.name}
                  </h3>
                  
                  <p className="text-blue-600 dark:text-blue-400 font-semibold mb-2 text-md">
                    {leader.position}
                  </p>

                  {/* Contact Info */}
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-0">
                      <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium">{leader.room}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}