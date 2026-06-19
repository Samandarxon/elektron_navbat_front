// app/lib/api/doctors.ts
// Navbat backend bilan ishlash uchun API client

import { fetchWithAuth } from "./fetchWithAuth";
import { getRuntimeEnv } from "@/lib/runtime-env";

function throwIfUnauth(res: Response): void {
  if (res.status === 401 || res.status === 403) {
    const e = new Error("Autentifikatsiya talab qilinadi");
    e.name = "AuthError";
    throw e;
  }
}

const API_URL = getRuntimeEnv().API_URL;

// ─────────────────────────────────────────────────────────────
// Backend raw types
// ─────────────────────────────────────────────────────────────
interface BackendDoctor {
  id: string;
  specialization: string;
  room_number: string | null;
  is_active: boolean;
  is_busy: boolean;          // hozir called/in_progress ticketi bor-yo'qligi
  user_full_name: string | null;
  max_patients_per_day: number;
  average_consultation_minutes: number;
  department: {
    id: string;
    name: string;
    queue_prefix: string;
    display_color: string;
  } | null;
}

// ─────────────────────────────────────────────────────────────
// Frontend Doctor type (komponentlar bilan mos keladi)
// ─────────────────────────────────────────────────────────────
export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  room: string;       // "201-xona" formatida
  roomNumber: string; // faqat "201"
  currentQueue: number;
  nextAvailable: string;
  status: "available" | "busy" | "break";
  phone?: string;
  icon?: string;
}

function adaptDoctor(d: BackendDoctor): Doctor {
  const roomNumber = d.room_number ?? "";
  return {
    id: d.id,
    name: d.user_full_name || d.specialization,
    specialization: d.specialization,
    room: roomNumber ? `${roomNumber}-xona` : "—",
    roomNumber,
    currentQueue: 0,
    nextAvailable: "--:--",
    status: !d.is_active ? "busy" : d.is_busy ? "busy" : "available",
    icon: "👨‍⚕️",
  };
}

// ─────────────────────────────────────────────────────────────
// Doktorlar API
// ─────────────────────────────────────────────────────────────
export async function getDoctors(): Promise<Doctor[]> {
  const res = await fetchWithAuth(`${API_URL}/api/v1/doctors/active`);
  throwIfUnauth(res);
  if (!res.ok) throw new Error("Doktorlarni olishda xatolik");
  const json = await res.json();
  const list: BackendDoctor[] = json?.data?.doctors ?? json?.doctors ?? [];
  return list.map(adaptDoctor);
}

export async function getDoctorsByBuilding(buildingId: string): Promise<Doctor[]> {
  const res = await fetchWithAuth(`${API_URL}/api/v1/buildings/${buildingId}/doctors`);
  throwIfUnauth(res);
  if (!res.ok) throw new Error("Doktorlarni olishda xatolik");
  const json = await res.json();
  const list: BackendDoctor[] = json?.data?.doctors ?? json?.doctors ?? [];
  return list.map(adaptDoctor);
}

export async function getDoctorById(id: string): Promise<Doctor | null> {
  const doctors = await getDoctors();
  return doctors.find((d) => d.id === id) ?? null;
}

// ─────────────────────────────────────────────────────────────
// Ticket yaratish (kiosk dan navbat olish)
// POST /api/v1/queue/tickets — public endpoint, auth kerak emas
// ─────────────────────────────────────────────────────────────
export interface CreatedTicket {
  id: string;
  queue_number: number;
  queue_display: string; // masalan: "A-005"
  status: string;
  doctor_id: string;
  created_at: string;
}

export async function addToQueue(params: {
  doctor_id: string;
  kiosk_id?: string;
  building_id?: string;
  is_priority?: boolean;
  notes?: string;
}): Promise<CreatedTicket> {
  const res = await fetchWithAuth(`${API_URL}/api/v1/queue/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      doctor_id: params.doctor_id,
      kiosk_id: params.kiosk_id || undefined,
      building_id: params.building_id || undefined,
      is_priority: params.is_priority ?? false,
      notes: params.notes ?? "",
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Navbatga qo'shishda xatolik");
  }
  const json = await res.json();
  return json?.data?.ticket ?? json?.ticket ?? json;
}

// ─────────────────────────────────────────────────────────────
// Display ticket type (navbat ekrani uchun)
// ─────────────────────────────────────────────────────────────
export interface DisplayTicket {
  id: string;
  ticketNumber: number;
  queueDisplay: string;  // "A-005"
  doctorName: string;
  specialization: string;
  room: string;          // "201-xona"
  roomNumber: string;    // "201"
  status: "waiting" | "in-progress";
  estimatedWait: string;
  timestamp: string;
  buildingId?: string;
  calledAt?: string;     // oxirgi chaqirilgan vaqt — recall (qayta chaqirish) ni aniqlash uchun
}

export function backendStatusToDisplay(s: string): "waiting" | "in-progress" {
  if (s === "called" || s === "in_progress") return "in-progress";
  return "waiting";
}

export function adaptTicket(t: any): DisplayTicket {
  const roomNumber = t.doctor?.room_number ?? t.room_number ?? "";
  return {
    id: t.id,
    ticketNumber: t.queue_number ?? 0,
    queueDisplay: t.queue_display ?? `#${t.queue_number ?? 0}`,
    doctorName: t.doctor?.user_full_name ?? t.doctor_name ?? "—",
    specialization:
      t.doctor?.specialization ?? t.department?.name ?? t.department_name ?? "—",
    room: roomNumber ? `${roomNumber}-xona` : "—",
    roomNumber,
    status: backendStatusToDisplay(t.status),
    estimatedWait:
      t.estimated_wait ? `${t.estimated_wait} daqiqa` : "10 daqiqa",
    timestamp: t.created_at
      ? new Date(t.created_at).toLocaleTimeString("uz-UZ")
      : new Date().toLocaleTimeString("uz-UZ"),
    buildingId: t.building_id ?? undefined,
    calledAt: t.called_at ?? t.updated_at ?? undefined,
  };
}

// Faol ticketlarni olish (display ekran uchun)
// GET /api/v1/queue/tickets/active — public endpoint
export async function getQueue(buildingId?: string): Promise<DisplayTicket[]> {
  const params = new URLSearchParams();
  if (buildingId) params.set("building_id", buildingId);
  const qs = params.toString();
  const url = `${API_URL}/api/v1/queue/tickets/active${qs ? `?${qs}` : ""}`;
  const res = await fetchWithAuth(url);
  throwIfUnauth(res);
  if (!res.ok) throw new Error("Navbatlarni olishda xatolik");
  const json = await res.json();
  const tickets: any[] = json?.data?.tickets ?? json?.tickets ?? [];
  return tickets.map(adaptTicket);
}

// ─────────────────────────────────────────────────────────────
// Legacy funksiyalar — backendda avtomatik boshqariladi
// ─────────────────────────────────────────────────────────────
export async function updateDoctor(_id: any, _data: any): Promise<void> {}
export async function updateDoctorStatus(_id: any, _status: any): Promise<void> {}
export async function updateDoctorQueue(_id: any, _q: any): Promise<void> {}
export async function updateQueueStatus(_id: any, _status: any): Promise<void> {}
export async function deleteQueueItem(_id: any): Promise<void> {}
export async function getQueueWithPolling(): Promise<DisplayTicket[]> {
  return getQueue();
}
export async function getDoctorsWithPolling(): Promise<Doctor[]> {
  return getDoctors();
}
