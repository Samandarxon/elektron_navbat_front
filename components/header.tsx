// components/header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Home,
  Users,
  ClipboardList,
  Stethoscope,
  Building,
  Phone,
  HelpCircle,
} from "lucide-react";
import Image from "next/image";
import logo from "@/public/iib.png";
import { Button } from "./ui/button";

export function Header() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.className = initialTheme;
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.className = newTheme;
  };

  const mainNavLinks = [
    { href: "/information", label: "Bosh sahifa", icon: Home },
    { href: "/leaders", label: "Rahbariyat", icon: Users },
    { href: "/process", label: "Bosqichlar", icon: ClipboardList },
    { href: "/doctors", label: "Shifokorlar", icon: Stethoscope },
  ];

  const mobileNavLinks = [
    ...mainNavLinks,
    { href: "/services", label: "Xizmatlar", icon: Building },
    { href: "/faq", label: "FAQ", icon: HelpCircle },
    { href: "/contact", label: "Aloqa", icon: Phone },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const path = usePathname()
  const hiddenPaths = ["/", "/elektronNavbat", "/queueDisplay/"];

  return (
    <>
      {!hiddenPaths.includes(path) && (
        <header className="fixed w-full top-0 z-50 bg-background/95 backdrop-blur-xl border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo */}
              <Link
                href="/"
                className="flex items-center gap-4 cursor-pointer group"
              >
                <div className="w-14 h-14">
                  <Image
                    src={logo}
                    alt="Toshkent IIBB logotipi"
                    className="rounded-lg"
                    priority
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="font-bold text-lg leading-tight text-foreground">
                    Toshkent shahar IIBB <br />
                    <span className="text-sm font-semibold text-muted-foreground">
                      Tibbiyot bo&apos;limi
                    </span>
                  </h1>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-2">
                {mainNavLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 relative group rounded-lg ${
                        active
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                      {active && (
                        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-primary rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Right side controls */}
              <div className="flex items-center gap-2">
                {/* Theme Toggle - Yangilangan */}
                <Button
                  onClick={toggleTheme}
                  className="cursor-pointer relative w-12 h-12 rounded-full border bg-background hover:bg-accent transition-all duration-300 flex items-center justify-center group"
                  aria-label="Toggle theme"
                >
                  <Sun
                    className={`w-5 h-5 absolute transition-all duration-300 ${
                      theme === "light"
                        ? "scale-100 rotate-0 text-amber-500"
                        : "scale-0 -rotate-90"
                    }`}
                  />
                  <Moon
                    className={`w-5 h-5 absolute transition-all duration-300 ${
                      theme === "dark"
                        ? "scale-100 rotate-0 text-blue-400"
                        : "scale-0 rotate-90"
                    }`}
                  />
                  <span className="sr-only">Toggle theme</span>
                </Button>

                {/* Hamburger Button - shadcn/ui style */}
                <Button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="cursor-pointer relative w-12 h-12 rounded-lg border bg-background hover:bg-accent transition-all duration-300 flex flex-col items-center justify-center gap-1.5 group"
                >
                  <span
                    className={`w-6 h-0.5 bg-[#3b82f6] rounded-full transition-all duration-300 ${
                      mobileMenuOpen ? "rotate-45 translate-y-2" : ""
                    }`}
                  />
                  <span
                    className={`w-6 h-0.5 bg-[#3b82f6] rounded-full transition-all duration-300 ${
                      mobileMenuOpen ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  <span
                    className={`w-6 h-0.5 bg-[#3b82f6] rounded-full transition-all duration-300 ${
                      mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                    }`}
                  />
                </Button>
              </div>
            </div>

            {/* Mobile Menu */}
            <div
              className={`md:w-1/2 lg:w-[30%] w-full fixed top-20 right-0 h-[calc(100vh-5rem)] bg-background/95 backdrop-blur-xl transition-all duration-300 ${
                mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
            >
              <div className="p-6 h-full overflow-y-auto border-t">
                <div className="space-y-2">
                  {mobileNavLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group ${
                          active
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            active
                              ? "bg-primary text-primary-foreground"
                              : "bg-accent text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="font-semibold text-lg">
                          {link.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </header>
      )}
    </>
  );
}
