"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Phone, Globe, Shield } from "lucide-react"

export function Contact() {
  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Manzil",
      content: [
        "Poliklinika IIBB",
        "Toshkent, Abdulla Qahhor ko'chasi, 40"
      ],
      link: "https://www.google.com/maps/place/%D0%9F%D0%BE%D0%BB%D0%B8%D0%BA%D0%BB%D0%B8%D0%BD%D0%B8%D0%BA%D0%B0+%D0%93%D0%9E%D0%92%D0%94/@41.2804261,69.2603267,20z/data=!4m6!3m5!1s0x38ae8a94380cb339:0xbe84d17a5f2fe66!8m2!3d41.2803809!4d69.2600793!16s%2Fg%2F11bz0lqzty?entry=ttu&g_ep=EgoyMDI1MTEwNC4xIKXMDSoASAFQAw%3D%3D",
      isLink: true
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Ish Vaqti",
      content: [
        "Dushanba - Juma: 8:00 - 17:00",
        "Tushlik: 13:00 - 14:00",
        "Shanba - Yakshanba: Dam olish kuni"
      ]
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Telefon",
      content: [
        "Qo'ng'iroq markazi:",
        "+998 (71) 254-37-62"
      ]
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Toshkent shahar IIBB",
      content: [
        "Rasmiy veb-sayt",
        "Barcha yangiliklar, xizmatlar va ma'lumotlar"
      ],
      link: "https://iibb.uz/oz",
      isLink: true,
      buttonText: "iibb.uz saytiga o'tish"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Ichki ishlar xodimlar uchun Tibbiy xizmatga tezkor bog'lanish",
      content: [
        "24/7 yordam xizmati:",
        "+998 (71) 254-37-62"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      
      {/* Hero Section */}
      <section className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-blue-900 via-blue-700 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
            Biz Bilan Bog'laning
          </h1>
          <p className="text-xl text-blue-100 opacity-95 max-w-2xl mx-auto leading-relaxed">
            Savol va takliflaringiz bo'lsa, biz bilan bog'laning. Har doim yordam berishga tayyormiz
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Contact Cards Grid - First Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {contactInfo.slice(0, 3).map((item, index) => (
              <ContactCard key={index} item={item} />
            ))}
          </div>

          {/* Contact Cards Grid - Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            {contactInfo.slice(3).map((item, index) => (
              <ContactCard key={index + 3} item={item} />
            ))}
          </div>

          {/* Map Section */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d944.4118337713785!2d69.26140732305178!3d41.280132007717214!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8a94380cb339%3A0xbe84d17a5f2fe66!2z0J_QvtC70LjQutC70LjQvdC40LrQsCDQk9Ce0JLQlA!5e0!3m2!1sru!2s!4v1762524110904!5m2!1sru!2s"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-[450px]"
            />
          </div>

        </div>
      </section>

    </div>
  )
}

// Alohida ContactCard komponenti
function ContactCard({ item }: { item: any }) {
  const cardContent = (
    <Card className={`
      group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 rounded-2xl p-8 
      transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full
      ${item.isLink 
        ? 'cursor-pointer border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400' 
        : 'border-slate-200 dark:border-slate-700'
      }
    `}>
      <CardContent className="p-0 text-center flex flex-col h-full">
        {/* Icon - HTML'dagi contact-icon ni moslashtirish */}
        <div className="w-16 h-16 bg-linear-to-br from-blue-900 to-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
          {item.icon}
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
          {item.title}
        </h3>
        
        <div className="space-y-2 mb-4 grow">
          {item.content.map((text: string, index: number) => (
            <p 
              key={index}
              className="text-slate-600 dark:text-slate-300 leading-relaxed"
            >
              {text.startsWith('+998') || text.includes('Qo\'ng\'iroq') ? (
                <strong className="text-slate-900 dark:text-white">{text}</strong>
              ) : (
                text
              )}
            </p>
          ))}
        </div>

        {/* Button for website link */}
        {item.buttonText && (
          <div className="w-full text-white font-semibold transition-all duration-300 group-hover:shadow-lg">
            <span className="flex items-center gap-2 justify-center">
              {item.buttonText}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (item.isLink && item.link) {
    return (
      <a 
        href={item.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block h-full"
      >
        {cardContent}
      </a>
    )
  }

  return cardContent
}