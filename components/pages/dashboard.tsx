"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import Leaders from "@/app/leaders/page"
import Home  from "./home"

export default function DashboardPage() {
  const [activePage, setActivePage] = useState<"home" | "leaders">("home")

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-10">

      {/* Tanlangan sahifa */}
      <div className="w-full">
        {activePage === "home" ? <Home /> : <Leaders />}
      </div>
    </div>
  )
}
