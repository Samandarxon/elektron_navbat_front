import { Suspense } from "react"
import Information from "@/components/pages/information"

export default function ProcessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>}>
      <Information />
    </Suspense>
  )
}
