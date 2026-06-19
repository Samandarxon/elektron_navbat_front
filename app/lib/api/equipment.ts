import { fetchWithAuth } from "./fetchWithAuth";
import { getRuntimeEnv } from "@/lib/runtime-env";
const API_URL = getRuntimeEnv().API_URL;

export interface Equipment {
  id: string;
  building_id: string;
  title: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getEquipmentByBuilding(buildingId: string): Promise<Equipment[]> {
  const res = await fetchWithAuth(`${API_URL}/api/v1/buildings/${buildingId}/equipment`);
  if (!res.ok) throw new Error("Uskunalarni olishda xatolik");
  const json = await res.json();
  return json?.data?.equipment ?? [];
}
