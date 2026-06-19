import { fetchWithAuth } from "./fetchWithAuth";
import { getRuntimeEnv } from "@/lib/runtime-env";
const API_URL = getRuntimeEnv().API_URL;

export interface Leadership {
  id: string;
  polyclinic_id: string;
  full_name: string;
  position: string;
  rank?: string;
  photo_url?: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getLeadershipByPolyclinic(polyclinicId: string): Promise<Leadership[]> {
  const res = await fetchWithAuth(`${API_URL}/api/v1/polyclinics/${polyclinicId}/leadership`);
  if (!res.ok) throw new Error("Rahbariyatni olishda xatolik");
  const json = await res.json();
  return json?.data?.leadership ?? [];
}
