import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Header } from "@/components/header";
import InactivityHandler from "@/components/inactivtyHandler";
import { QueueProvider } from "@/contexts/queueContext";

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
  return (
    <html lang="uz">
      <body className={`font-sans antialiased`}>
        <QueueProvider>
          <InactivityHandler />
          <Header />
          {children}
          <Analytics />
        </QueueProvider>
      </body>
    </html>
  );
}
