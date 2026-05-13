"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"

export function Technologies() {
  const techData = [
    {
      image: "/images/technologies-img/Avtokeratorefraktometr.jpg",
      title: "Avtokeratorefraktometr apparat — ko‘z refraksiyasini aniq o‘lchaydi",
    },
    {
      image: "/images/technologies-img/BiokimyoviyAnalizator.jpeg",
      title: "Bioximik analizator — qon tahlili uchun zamonaviy uskuna",
    },
    {
      image: "/images/technologies-img/Centrifuge.jpg",
      title: "Centrifuga — laborator tahlillar uchun ajratish moslamasi",
    },
    {
      image: "/images/technologies-img/EFGDS.jpg",
      title: "EFGDS apparat — oshqozon va ichak tizimi endoskopiyasi",
    },
    {
      image: "/images/technologies-img/EKG.jpg",
      title: "EKG apparat — yurak faoliyatini o‘lchash uskunasi",
    },
    {
      image: "/images/technologies-img/UTTAparat.jpeg",
      title: "UTT apparat — ichki a’zolar ultratovush diagnostikasi",
    },
    {
      image: "/images/technologies-img/linza.jpg",
      title: "Linza apparati — optik ko‘rish tizimlarini tekshirish uchun",
    },
    {
      image: "/images/technologies-img/ottoskop.jpg",
      title: "Ottoskop — quloq parda holatini ko‘rish uchun moslama",
    },
    {
      image: "/images/technologies-img/Reflektor.jpg",
      title: "Reflektor — LOR shifokorlar uchun elektron bosh chiroq",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-blue-900 via-blue-700 to-cyan-600 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          Professional Tibbiy Uskunalar
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto text-blue-100 leading-relaxed">
          Komissiyamizda eng zamonaviy va yuqori sifatli tibbiy asbob-uskunalar
          ishlatiladi. Barcha diagnostika va tekshiruvlar xalqaro standartlarga
          muvofiq amalga oshiriladi.
        </p>
      </section>

      {/* Carousel Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {techData.map((tech, index) => (
                <CarouselItem
                  key={index}
                  className="py-2 pl-2 md:pl-4 md:basis-1/2 xl:basis-1/3"
                >
                  <TechCard tech={tech} />
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation */}
            <div className="flex items-center justify-center mt-8 gap-4">
              <CarouselPrevious className="w-14 h-14 ml-5 cursor-pointer rounded-full bg-blue-900 hover:bg-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all" />
              <CarouselNext className="w-14 h-14 mr-5 cursor-pointer rounded-full bg-blue-900 hover:bg-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* Stats Section */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/20 rounded-3xl p-12 text-center shadow-lg">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8">
            Texnologik Imkoniyatlar
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-12">
            Zamonaviy uskunalar yordamida yuqori sifatli diagnostika
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <StatItem number="7+" label="Zamonaviy Asbob" />
            <StatItem number="100%" label="Aniqlik" />
            <StatItem number="15+" label="Yillik Tajriba" />
            <StatItem number="10+" label="Mutaxassislar" />
          </div>
        </div>
      </section>
    </div>
  )
}

/* --- Components --- */
function TechCard({ tech }: { tech: { image: string; title: string } }) {
  return (
    <Card className="h-full p-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:border-blue-500 dark:hover:border-blue-400">
      <CardContent className="p-0">
        <div className="h-120 relative overflow-hidden">
          <Image
            src={tech.image}
            alt={tech.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-6 bg-linear-to-b from-white/60 to-blue-50/30 dark:from-slate-800/40 dark:to-blue-900/10">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center">
            {tech.title}
          </h3>
        </div>
      </CardContent>
    </Card>
  )
}

function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-black text-blue-600 dark:text-blue-400 mb-2">
        {number}
      </div>
      <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </div>
    </div>
  )
}
