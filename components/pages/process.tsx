// components/pages/steps.tsx
"use client";

import { CheckCircle, Clock, Shield, Smartphone, QrCode } from "lucide-react";
import Image from "next/image";

export function Process() {
  const steps = [
    {
      id: 1,
      title: "Hujjatlar Tayyorlash",
      icon: "1",
      qrCode: "/images/qrcode/qr1.png",
      items: [
        "Doimiy ro'yhatda otgan manzil bo'yicha oilaviy poliklinikadan 5 yillik ko'chirma(5 yil davomida 2 va undan ortiq manzilda doimiy ro'yxatda turgan bo'lsa har bir oilaviy poliklinikadan ko'chirma olib kelib kelishi lozim)",
        "Sil kasalliklari despanseridan ma'lumotnoma doimiy ro'yhatdan o'tgan manzildan, Rentgen plyonkasi bilan (5 yil davomida 2 va undan ortiq manzilda doimiy ro'yxatda turgan bo'lsa har bir oilaviy poliklinikadan ko'chirma olib kelib kelishi lozim)",
        "Teri-tanosil kasalliklari despanseridan ma'lumotnoma doimiy ro'yhatdan o'tgan manzildan (5 yil davomida 2 va undan ortiq manzilda doimiy ro'yxatda turgan bo'lsa har bir oilaviy poliklinikadan ko'chirma olib kelib kelishi lozim)",
        "Narkologiya dispanseridan ma'lumotnoma (davlat xizmatlaridan yoki my.gov.uz dan)",
        "Ruhiy-asab kasalliklari dispanseridan ma'lumotnoma (davlat xizmatlaridan yoki my.gov.uz dan)",
        {
          text: "Respublika OITS markazidan sertifikat 'RW, Gepatit HbsAg, B, HCV , C' (Chilonzor metro)",
          qrCode: "/images/qrcode/OITS_markazi.jpg", // OITS markazi uchun QR
        },
        {
          text: "EXOKG (Respublika ixtisoslashtirilgan Kardiologiya ilmiy amaliy tibbiyot markazi)",
          qrCode: "/images/qrcode/Kardiologiya_markazi.jpg", // Kardiologiya markazi uchun QR
        },
	{
          text: "Ko'krak qafasi rentgenogrammasi oilaviy poliklinikadan (agar poliklinikada rentgen apparati bo'lmasa Toshkent shahridagi kosultativ diagnostika markazidan)",
          qrCode: "/images/qrcode/KDM.png", // KDM uchun QR
        },
        "3x4 o'lchamdi rasm (1 dona)",
      ],
    },
    {
      id: 2,
      title: "Laboratoriya Tekshiruvlari",
      icon: "2",
      qrCode: "/images/qrcode/qr2.png",
      items: [
        { name: "Qorin bo'shlig'i", price: "60 000 so'm" },
        { name: "Buyrak", price: "60 000 so'm" },
        { name: "Prostata bezi", price: "60 000 so'm" },
        { name: "Bachadon va tuxumdonlar", price: "60 000 so'm" },
        { name: "Qalqonsimon bez", price: "60 000 so'm" },
        {
          name: "Bakterial floraga surtma (Qizlar uchun)",
          price: "53 000 so'm",
        },
	{
          name: "UTT ko'krak bezlar (Qizlar uchun)",
          price: "60 000 so'm",
        },
        { name: "Qonning kengaytirilgan klinik tahlili", price: "60 000 so'm" },
        { name: "Peshobning umumiy tahlili", price: "55 000 so'm" },
        { name: "Umumiy najas tahlili", price: "53 000 so'm" },
        { name: "Qondagi qand miqdori", price: "62 000 so'm" },
        { name: "ALT, AST", price: "62 000 so'm" },
        { name: "Bilirubin", price: "65 000 so'm" },
        { name: "Sheyochnaya fosfotaza", price: "50 000 so'm" },
        {
          name: "Ko'krak qafasi rentgenologik tekshiruvi",
          price: "80 000 so'm",
        },
        { name: "EKG - Elektrokardiogramma", price: "50 000 so'm" },
        { name: "EFGDS - Gastroskopiya", price: "120 000 so'm" },
        { name: "Qondagi umumiy oqsil", price: "60 000 so'm"}
      ],
    },
    {
      id: 3,
      title: "Mutaxassislar Tekshiruvi",
      icon: "3",
      qrCode: "/images/qrcode/qr3.png",
      items: [
        "Ekspert-okulist shifokori ko'rigi",
        "Ekspert-LOR shifokori ko'rigi",
        "Ginekolog shifokori (qizlar uchun)",
        "Ekspert-dermatovenerolog shifokori",
        "Ekspert-jarroh shifokori",
        "Ekspert-nevrolog shifokori",
        "Stomatolog shifokori ko'rigi",
        "Ekspert-terapevt shifokori",
        "PFL-psixolog tekshiruvi",
        "Ekspert-psixiatr shifokori",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Page Header */}
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-blue-900 via-blue-800 to-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl xl:text-5xl font-black mb-4">
            Tibbiy Komissiya Bosqichlari
          </h1>
          <p className="text-xl xl:text-2xl text-blue-100 max-w-2xl mx-auto">
            Harbiy-tibbiy komissiyadan muvaffaqiyatli o'tish uchun quyidagi
            bosqichlarni ketma-ket bajaring
          </p>
        </div>
      </div>

      {/* Steps Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* Step Cards */}
            {steps.map((step) => (
              <div
                key={step.id}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 hover:-translate-y-2"
              >
                {/* Top linear border */}
                <div className="h-1 bg-linear-to-r from-cyan-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

                {/* Step Number with QR Code */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-xl overflow-hidden border-2 border-blue-200 dark:border-blue-800">
                    <Image
                      src={step.qrCode}
                      alt={`QR Code for ${step.title}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Step Header */}
                <div className="p-6 pb-4">
                  <div className="w-14 h-14 bg-linear-to-br from-blue-900 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-black mb-4 border-2 border-blue-500 shadow-lg">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                </div>

                {/* Step Content */}
                <div className="px-6 pb-6">
                  <ul className="">
                    {step.items.map((item, index) => (
                      <li
                        key={index}
                        className={`
                          ${
                            typeof item === "string" || "text" in item
                              ? "py-4"
                              : "py-[5px] text-sm"
                          }
                          flex items-start gap-3 text-slate-700 dark:text-slate-300 text-sm border-b border-slate-100 dark:border-slate-700 last:border-b-0
                        `}
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          {typeof item === "string" ? (
                            <span>{item}</span>
                          ) : "text" in item ? (
                            <div className="flex flex-col md:flex-row md:items-center gap-3">
                              <div className="flex-1">
                                <span>{item.text}</span>
                              </div>

                              {item.qrCode && (
                                <div className="shrink-0">
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-lg overflow-hidden border border-blue-300 dark:border-blue-700">
                                      <Image
                                        src={item.qrCode}
                                        alt="QR Code"
                                        width={64}
                                        height={64}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    {/* <div className="text-xs text-blue-600 dark:text-blue-400">
                                      <QrCode className="w-4 h-4" />
                                    </div> */}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex justify-between items-center w-full">
                              <span className="flex-1">{item.name}</span>
                              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-xs font-semibold ml-2 whitespace-nowrap">
                                {item.price}
                              </span>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                    {step.id == 2 && (
                      <div className="flex justify-between pt-10">
                        <h2 className="">Hisobchi xonasi: </h2>
                        <p>206-xona</p>
                      </div>
                    )}
                </div>
              </div>
            ))}

            {/* QR Code Section */}
            <div className="lg:col-span-1 xl:col-span-3">
              <div className="h-full bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
                <div className="flex flex-col xl:flex-row items-center gap-8">
                  {/* QR Code Box */}
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

                  {/* QR Code Info */}
                  <div className="flex-1 text-center xl:text-left">
                    <div className="relative flex items-center justify-center md:justify-start gap-3 mb-4">
                      <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400 static lg:absolute top-1 left-0 xl:static" />
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white lg:ml-3">
                        Ma'lumot olish uchun telegram botga o'tish
                      </h3>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg leading-relaxed">
                      QR kodni skanerlang va komissiyaga online ro'yxatdan
                      o'ting. Navbat kutmasdan, tez va qulay!
                    </p>

                    {/* Features */}
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
        </div>
      </section>
    </div>
  );
}
