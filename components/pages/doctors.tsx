"use client"

import { DoorOpen } from "lucide-react"
import { FaUserMd } from "react-icons/fa";

export function Doctors() {
  const doctors = [
    {
      id: 1,
      name: "Muolaja xona",
      specialty: "Tibbiy muolajalar o'tkaziladigan xona.",
      room: "101-xona",
      icon: "🏥"
    },
    {
      id: 2,
      name: "Safdor Jamalova Maftuna Mirsaatovna",
      specialty: "Tibbiyot bo'limi kanselyariya boshlig'i. Hujjat aylanishi va rasmiy yozishmalarni yuritadi.",
      room: "102-xona",
      icon: "📋"
    },
    {
      id: 3,
      name: "Kapitan Azimova Gulchexra Abduvaxidovna",
      specialty: "Ekspert-shifokor-oftalmolog. Ko'z kasalliklarini aniqlash va baholash bo'yicha mutaxassis.",
      room: "103-xona",
      icon: "👁️"
    },
    {
      id: 4,
      name: "Podpolkovnik Jaxangirov Jasur Izzatullayevich",
      specialty: "Katta mutaxassis shifokor. Tibbiyot jarayonlarini tahlil qilish va nazorat qilish.",
      room: "104-xona",
      icon: "🔬"
    },
    {
      id: 5,
      name: "Podpolkovnik Xudoynazarov Sherzod Gopirjonovich",
      specialty: "SENM boshlig'i. Tibbiyot bo'limining umumiy faoliyatini boshqaradi.",
      room: "105-xona",
      icon: "👨‍💼"
    },
    {
      id: 6,
      name: "Zufarova Shaxnoza Mirdjamalovna",
      specialty: "Sanitariya shifokori. Gigiyena va sanitariya talablariga rioya etilishini nazorat qiladi.",
      room: "106-xona",
      icon: "🧼"
    },
    {
      id: 7,
      name: "Axmedova Nodirabegim Xasanovna",
      specialty: "Shifokor-epidemiolog. Yuqumli kasalliklar profilaktikasi va epidemiologik nazorat.",
      room: "107-xona",
      icon: "🦠"
    },
    {
      id: 8,
      name: "Safdor Meliyeva Feruza Mexriddinovna",
      specialty: "Tibbiy ro'yxatchi. Bemorlar haqidagi ma'lumotlarni qayd etadi.",
      room: "201-xona",
      icon: "📝"
    },
    {
      id: 9,
      name: "Arxiv xonasi",
      specialty: "Tibbiyot hujjatlari va hisobotlarni saqlash xonasi.",
      room: "202-xona",
      icon: "🗄️"
    },
    {
      id: 10,
      name: "Kapitan Sharapova Dilafruz Safarovna",
      specialty: "XTK raisi. Ichki tibbiy komissiya faoliyatini boshqaradi.",
      room: "203-xona",
      icon: "👩‍⚖️"
    },
    {
      id: 11,
      name: "Mayor Abdukarimov Abdushukur Abdurayimovich",
      specialty: "Ekspert shifokor-jarroh. Jarrohlik amaliyotlarini o'tkazish va ekspertiza.",
      room: "204-xona",
      icon: "🔪"
    },
    {
      id: 12,
      name: "Mayor Mironova Tatyana Yur'evna",
      specialty: "Psixofiziologik laboratoriya psixologi. Ruhiy va fiziologik testlarni o'tkazadi.",
      room: "205-xona",
      icon: "🧠"
    },
    {
      id: 13,
      name: "Safdor Tursunov Faxriddin Baxriddinovich",
      specialty: "Xisobchi. Tibbiyot bo'limining moliyaviy hisobotlarini yuritadi.",
      room: "206-xona",
      icon: "💰"
    },
    {
      id: 14,
      name: "Kapitan Sultonov Eldor Ibragimovich",
      specialty: "Shifokor-dermatovenerolog. Teri va jinsiy yo'l bilan yuqadigan kasalliklar bo'yicha ekspert.",
      room: "301-xona",
      icon: "🔍"
    },
    {
      id: 15,
      name: "Mayor Tursunova Muzayyam Olimovna",
      specialty: "Ekspert shifokor-nevrolog. Asab tizimi kasalliklarini tahlil qiladi.",
      room: "302-xona",
      icon: "⚡"
    },
    {
      id: 16,
      name: "Kapitan Qodirov Po'latjon Babajanovich",
      specialty: "Ekspert shifokor-otolaringolog. Quloq, burun va tomoq kasalliklarini baholaydi.",
      room: "303-xona",
      icon: "👂"
    },
    {
      id: 17,
      name: "Ekspert-terapevt",
      specialty: "Ichki kasalliklar bo'yicha umumiy diagnostika va ekspertiza.",
      room: "304-xona",
      icon: "❤️"
    },
    {
      id: 18,
      name: "Katta leytenant Tuxtayeva Nargiza Erkin qizi",
      specialty: "Ekspert-psixolog. Ruhiy salomatlikni baholash va maslahat berish.",
      room: "305-xona",
      icon: "💭"
    },
    {
      id: 19,
      name: "Kunishev Ruzibay Norbekovich",
      specialty: "Shifokor-epidemiolog. Epidemiologik xavfsizlik va nazorat bo'yicha mutaxassis.",
      room: "306-xona",
      icon: "🩺"
    },
    {
      id: 20,
      name: "UTT xonasi",
      specialty: "Ultratovush diagnostika (UZI) o'tkaziladigan xona.",
      room: "307-xona",
      icon: "📊"
    },
    {
      id: 21,
      name: "EKG xonasi",
      specialty: "Yurak faoliyatini EKG apparati yordamida tekshirish joyi.",
      room: "308-xona",
      icon: "📈"
    },
    {
      id: 22,
      name: "Podpolkovnik Sultanov Ruzimbay Djumaniyazovich",
      specialty: "Kadrlar guruhi MTB inspektori. Kadrlar ishini yuritish va nazorat.",
      room: "309-xona",
      icon: "👥"
    },
    {
      id: 23,
      name: "Podpolkovnik Adilova Gulshod Pulatovna",
      specialty: "Tibbiyot bo'limi boshlig'i. Umumiy rahbarlik va tibbiy xizmatni boshqarish.",
      room: "401-xona",
      icon: "👩‍💼"
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Page Header */}
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-blue-900 via-blue-800 to-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl xl:text-5xl font-black mb-4">
            Mutaxassis Shifokorlar
          </h1>
          <p className="text-xl xl:text-2xl text-blue-100 max-w-2xl mx-auto">
            Yuqori malakali va tajribali mutaxassislar jamoasi sizning sog&apos;ligingiz uchun
          </p>
        </div>
      </div>

      {/* Doctors Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 hover:-translate-y-2 relative overflow-hidden"
              >
                {/* Top linear border */}
                <div className="h-1 bg-linear-to-r from-cyan-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 absolute top-0 left-0 right-0" />
                
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                  {/* Doctor Avatar */}
                  <div className="w-12 h-12 bg-linear-to-br from-blue-900 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
                    {/* {doctor.icon} */}
                    <FaUserMd size={24}/>
                  </div>
                  
                  {/* Room Number */}
                  <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-full border-2 border-blue-200 dark:border-blue-800 text-sm font-semibold">
                    <DoorOpen className="w-4 h-4" />
                    <span>{doctor.room}</span>
                  </div>
                </div>

                {/* Doctor Info */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                    {doctor.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {doctor.specialty}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}