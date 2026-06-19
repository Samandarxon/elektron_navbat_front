import { fetchWithAuth } from "./fetchWithAuth"
import { getRuntimeEnv } from "@/lib/runtime-env"
const API_URL = getRuntimeEnv().API_URL

export type CommissionStepItem =
  | string
  | { text: string; qr_code?: string }
  | { name: string; price: string }

export interface CommissionStep {
  id: string
  building_id: string
  step_number: number
  title: string
  icon: string
  qr_code_url?: string
  items: CommissionStepItem[]
  extra_info?: string
  display_order: number
  is_active: boolean
}

export async function getCommissionStepsByBuilding(buildingId: string): Promise<CommissionStep[]> {
  const res = await fetchWithAuth(`${API_URL}/api/v1/buildings/${buildingId}/commission-steps`)
  if (!res.ok) throw new Error("Komissiya bosqichlarini olishda xatolik")
  const json = await res.json()
  return json?.data?.commission_steps ?? []
}
