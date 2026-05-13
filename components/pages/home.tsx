"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Doctor } from "./elektronNavbat";
import { getDoctors } from "@/app/lib/api/doctors";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const slides = [
    { id: 1, image: "/images/slider-img/image.png" },
    { id: 2, image: "/images/slider-img/image2.png" },
  ];

  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        await (document.documentElement as any).webkitRequestFullscreen();
      } else if ((document.documentElement as any).mozRequestFullScreen) {
        await (document.documentElement as any).mozRequestFullScreen();
      } else if ((document.documentElement as any).msRequestFullscreen) {
        await (document.documentElement as any).msRequestFullscreen();
      }

      console.log("Fullscreen rejimiga o'tildi");
    } catch (error) {
      console.log("Fullscreen rejimiga o'tish muvaffaqiyatsiz:", error);
    }
  };

  useEffect(() => {
    enterFullscreen();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  // Ma'lumotlarni yuklash
  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const data = await getDoctors();
      setDoctors(data);
    } catch (error) {
      console.error("Ma'lumotlarni yuklashda xatolik:", error);
      alert("Serverga ulanishda xatolik.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center p-4 relative">
      {/* Background Slider */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out bg-cover bg-center ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(15, 46, 92, 0.88), rgba(26, 67, 120, 0.3)), url(${slide.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl">
        {/* Title Section */}
        <div className="text-center mb-16 flex flex-col items-center">
          <Image src={"/iib.png"} alt="logo" width={400} height={400} />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 text-white">
            <span className="bg-linear-to-r from-blue-500 via-blue-300 to-cyan-200 bg-clip-text text-transparent uppercase">
              Toshkent shahar ichki ishlar bosh boshqarmasi <br />
              tibbiyot bolimi
            </span>
          </h1>
        </div>

        {/* Cards Section */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-8 max-w-6xl mx-auto">
          {/* Elektron Navbat Card */}
          <Link href={"/elektronNavbat"} className="group relative flex-1">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl transition-all duration-500 group-hover:bg-white/15 group-hover:border-white/30 group-hover:-translate-y-3 group-hover:shadow-2xl" />

            <div className="relative z-10 p-8 md:p-10 text-white h-full flex flex-col items-center justify-center text-center">
              {/* Icon Container */}
              <div className="w-20 h-20 bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

              {/* Content */}
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white group-hover:text-amber-100 transition-colors duration-300">
                Elektron Navbat
              </h2>
              <p className="text-white/80 text-base md:text-lg mb-6 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                Onlayn navbat oling va vaqtingizni tejang. Tez va qulay tibbiy
                ko'rik jarayoni.
              </p>

              {/* CTA Button */}
              <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white font-semibold group-hover:bg-white/30 group-hover:border-white/40 group-hover:translate-x-2 transition-all duration-300">
                Navbat olish
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>

          {/* Ma'lumotlar Card */}
          <Link href={"/information"} className="group relative flex-1">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl transition-all duration-500 group-hover:bg-white/15 group-hover:border-white/30 group-hover:-translate-y-3 group-hover:shadow-2xl" />

            <div className="relative z-10 p-8 md:p-10 text-white h-full flex flex-col items-center justify-center text-center">
              {/* Icon Container */}
              <div className="w-20 h-20 bg-linear-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              {/* Content */}
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white group-hover:text-blue-100 transition-colors duration-300">
                Ma'lumotlar oynasi
              </h2>
              <p className="text-white/80 text-base md:text-lg mb-6 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                Harbiy-Tibbiy komissiya haqida batafsil ma'lumotlar, xizmatlar
                va yangiliklar.
              </p>

              {/* CTA Button */}
              <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white font-semibold group-hover:bg-white/30 group-hover:border-white/40 group-hover:translate-x-2 transition-all duration-300">
                Ko'rish
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Statistics Cards - Yuqoridagi dizaynga moslashtirilgan */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16 mx-auto bg-white/50 p-7 rounded-2xl">
          {/* Bo'sh Doktorlar */}
          <div className="group relative flex-1">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl transition-all duration-500 group-hover:bg-white/15 group-hover:border-white/30 group-hover:-translate-y-2 group-hover:shadow-2xl" />
            <div className="relative z-10 p-6 text-white h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="text-3xl font-bold text-white mb-2 group-hover:text-green-100 transition-colors duration-300">
                {doctors.filter((d) => d.status === "available").length}
              </div>
              <div className="text-white/80 text-sm font-medium group-hover:text-white/90 transition-colors duration-300">
                Bo'sh Doktorlar
              </div>
            </div>
          </div>

          {/* Band Doktorlar */}
          <div className="group relative flex-1">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl transition-all duration-500 group-hover:bg-white/15 group-hover:border-white/30 group-hover:-translate-y-2 group-hover:shadow-2xl" />
            <div className="relative z-10 p-6 text-white h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-linear-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="text-3xl font-bold text-white mb-2 group-hover:text-yellow-100 transition-colors duration-300">
                {doctors.filter((d) => d.status === "busy").length}
              </div>
              <div className="text-white/80 text-sm font-medium group-hover:text-white/90 transition-colors duration-300">
                Band Doktorlar
              </div>
            </div>
          </div>

          {/* Jami Navbatlar */}
          <div className="group relative flex-1">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl transition-all duration-500 group-hover:bg-white/15 group-hover:border-white/30 group-hover:-translate-y-2 group-hover:shadow-2xl" />
            <div className="relative z-10 p-6 text-white h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div className="text-3xl font-bold text-white mb-2 group-hover:text-blue-100 transition-colors duration-300">
                {doctors.reduce((acc, doc) => acc + doc.currentQueue, 0)}
              </div>
              <div className="text-white/80 text-sm font-medium group-hover:text-white/90 transition-colors duration-300">
                Jami Navbatlar
              </div>
            </div>
          </div>

          {/* Tanaffusda */}
          <div className="group relative flex-1">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl transition-all duration-500 group-hover:bg-white/15 group-hover:border-white/30 group-hover:-translate-y-2 group-hover:shadow-2xl" />
            <div className="relative z-10 p-6 text-white h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-linear-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="text-3xl font-bold text-white mb-2 group-hover:text-red-100 transition-colors duration-300">
                {doctors.filter((d) => d.status === "break").length}
              </div>
              <div className="text-white/80 text-sm font-medium group-hover:text-white/90 transition-colors duration-300">
                Tanaffusda
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
