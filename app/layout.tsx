import type React from "react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Header } from "@/components/header";
import InactivityHandler from "@/components/inactivtyHandler";
import { QueueProvider } from "@/contexts/queueContext";
import { readServerEnv } from "@/lib/runtime-env";

// Runtime env har so'rovda server'da o'qilishi uchun dinamik render majburiy.
// (Aks holda build paytidagi qiymatlar HTML ga "muzlab" qolardi.)
export const dynamic = "force-dynamic";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Toshkent IIBB Tibbiyot bo'limi",
  description: "Toshkent shahar Ichki Ishlar Bosh Boshqarmasi Tibbiyot bo'limi",
  icons: {
    icon: [
      {
        url: "/iib.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/iib.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/iib.png",
        type: "image/svg+xml",
      },
    ],
    apple: "/iib.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Runtime konfiguratsiyani client'ga uzatish uchun window.__ENV__ ga yozamiz.
  // Bu <script> Next.js bundle'laridan oldin ishga tushadi, shuning uchun
  // client modullari (API_URL, WS_URL, ...) o'qiganda qiymatlar tayyor bo'ladi.
  const runtimeEnv = readServerEnv();
  const envScript = `window.__ENV__ = ${JSON.stringify(runtimeEnv).replace(
    /</g,
    "\\u003c",
  )};`;

  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <script dangerouslySetInnerHTML={{ __html: envScript }} />
        <QueueProvider>
          <InactivityHandler />
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          {children}
          <Analytics />
        </QueueProvider>
      </body>
    </html>
  );
}
