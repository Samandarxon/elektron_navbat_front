// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Award, Laptop } from "lucide-react";

export default function Information() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const slides = [
    { id: 1, image: "/images/slider-img/image.png" },
    { id: 2, image: "/images/slider-img/image2.png" },
  ];

  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const showSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen pt-20 bg-linear-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="relative min-h-[700px] flex items-center overflow-hidden">
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

        {/* Hero Content */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-16 items-center py-16">
            {/* Text Content */}
            <div className="text-white">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
                <span className="bg-linear-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                  Harbiy-Tibbiy komissiya
                </span>{" "}
                ma&apos;lumot oynasi
              </h1>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed mb-8">
                Ichki ishlar organlari va oliy ta&apos;lim muassasalari uchun
                yuqori sifatli tibbiy ko&apos;rik va komissiya xizmatlari.
                Zamonaviy uskunalar va malakali mutaxassislar bilan xizmatdamiz.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: "👨‍⚕️", number: "10+", label: "Mutaxassis Shifokorlar" },
                { icon: "📋", number: "3", label: "Asosiy Bosqichlar" },
                { icon: "⭐", number: "100%", label: "Professional Xizmat" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/12 backdrop-blur-xl border border-white/25 rounded-3xl p-8 text-center hover:bg-white/18 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                >
                  <div className="text-4xl mb-4">{stat.icon}</div>
                  <div className="text-4xl font-black text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-white/90 font-semibold text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slider Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => showSlide(index)}
              className={`transition-all duration-300 ${
                index === currentSlide
                  ? "w-10 h-3 bg-white rounded-lg"
                  : "w-3 h-3 bg-white/40 rounded-full hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-8 bg-white dark:bg-slate-900">
        <div className="max-w-[1400px] mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-6 py-3 rounded-full border-2 border-blue-200 dark:border-blue-800 text-sm font-bold uppercase tracking-wider mb-6">
              <Star className="w-4 h-4" />
              Xususiyatlar
            </div>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Professional xizmat, zamonaviy uskunalar va tajribali
              mutaxassislar
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link
              href="/doctors"
              className="group bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-3xl p-8 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-500/50 transition-all duration-300 text-center no-underline"
            >
              <div className="w-20 h-20 bg-linear-to-br from-blue-900 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
                Professional jamoa
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                15 yildan ortiq tajribaga ega yuqori malakali shifokorlar va
                mutaxassislar
              </p>
            </Link>

            <Link
              href="/technologies"
              className="group bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-3xl p-8 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-500/50 transition-all duration-300 text-center no-underline"
            >
              <div className="w-20 h-20 bg-linear-to-br from-blue-900 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Laptop className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
                Zamonaviy uskunalar
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Eng so&apos;nggi tibbiy asbob-uskunalar va diagnostika tizimlari
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
