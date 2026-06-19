// contexts/queueContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { DisplayTicket, backendStatusToDisplay, getQueue, getDoctors, getDoctorsByBuilding, adaptTicket, type Doctor } from "@/app/lib/api/doctors";
import { getKioskToken, getKioskRefreshToken, getDisplayToken, hasValidToken, refreshKioskToken, decodeJwtPayload } from "@/app/lib/api/auth";
import { getRuntimeEnv } from "@/lib/runtime-env";

const WS_URL = getRuntimeEnv().WS_URL;

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface CurrentCall {
  ticketNumber: number;
  room: string;
  timestamp: number;
  callId: string;
}

interface QueueContextType {
  // Modal va audio (mavjud logika)
  currentCall: CurrentCall | null;
  showModal: boolean;
  triggerCall: (ticketNumber: number, room: string) => void;
  closeModal: () => void;
  pendingCalls: CurrentCall[];

  // Real-time ticket ro'yxati (display ekran uchun)
  tickets: DisplayTicket[];
  isConnected: boolean;
  loadingTickets: boolean;
  wsAuthError: boolean;

  // Real-time doktorlar ro'yxati (holat bilan)
  doctors: Doctor[];
  loadingDoctors: boolean;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────
// LocalStorage mutex (audio navbati uchun)
// ─────────────────────────────────────────────────────────────
const STORAGE_KEY = "queueCalls";
const LOCK_KEY = "queueCalls_lock";
const LOCK_TIMEOUT = 5000;

const acquireLock = async (): Promise<boolean> => {
  const maxAttempts = 50;
  let attempts = 0;
  while (attempts < maxAttempts) {
    const lockTime = localStorage.getItem(LOCK_KEY);
    const now = Date.now();
    if (!lockTime || now - parseInt(lockTime) > LOCK_TIMEOUT) {
      localStorage.setItem(LOCK_KEY, now.toString());
      await new Promise((r) => setTimeout(r, 10));
      if (localStorage.getItem(LOCK_KEY) === now.toString()) return true;
    }
    await new Promise((r) => setTimeout(r, 100));
    attempts++;
  }
  return false;
};

const releaseLock = () => localStorage.removeItem(LOCK_KEY);

const readCallsFromStorage = (): CurrentCall[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const calls = JSON.parse(stored);
    return Array.isArray(calls) ? calls : [];
  } catch {
    return [];
  }
};

const addCallToStorage = async (newCall: CurrentCall): Promise<boolean> => {
  const locked = await acquireLock();
  if (!locked) return false;
  try {
    const current = readCallsFromStorage();
    if (current.some((c) => c.callId === newCall.callId)) return true;
    const updated = [...current, newCall].sort((a, b) => a.timestamp - b.timestamp);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  } finally {
    releaseLock();
  }
};

const removeFirstCallFromStorage = async (): Promise<boolean> => {
  const locked = await acquireLock();
  if (!locked) return false;
  try {
    const current = readCallsFromStorage();
    if (current.length === 0) return true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current.slice(1)));
    return true;
  } catch {
    return false;
  } finally {
    releaseLock();
  }
};

// ─────────────────────────────────────────────────────────────
// WebSocket payload → DisplayTicket
// ─────────────────────────────────────────────────────────────
function payloadToDisplayTicket(p: any): DisplayTicket {
  const roomNumber = p.room_number ?? "";
  return {
    id: p.ticket_id,
    ticketNumber: p.queue_number ?? 0,
    queueDisplay: p.queue_display ?? `#${p.queue_number ?? 0}`,
    doctorName: p.doctor_name ?? "—",
    specialization: p.specialization ?? p.department_name ?? "—",
    room: roomNumber ? `${roomNumber}-xona` : "—",
    roomNumber,
    status: backendStatusToDisplay(p.status ?? "waiting"),
    estimatedWait: p.estimated_wait ? `${p.estimated_wait} daqiqa` : "10 daqiqa",
    timestamp: new Date().toLocaleTimeString("uz-UZ"),
    buildingId: p.building_id ?? undefined,
  };
}

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────
export function QueueProvider({ children }: { children: ReactNode }) {
  // --- Audio modal state ---
  const [currentCall, setCurrentCall] = useState<CurrentCall | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [pendingCalls, setPendingCalls] = useState<CurrentCall[]>([]);

  // --- Building isolation: URL params → localStorage fallback ---
  const computeBuildingId = useCallback((): string => {
    if (typeof window === "undefined") return "";
    // 1. URL: /display?building_id=UUID  (eng yuqori ustuvorlik)
    const urlParam = new URLSearchParams(window.location.search).get("building_id");
    if (urlParam) return urlParam;
    // 2. localStorage fallback (eski /kiosk-config usuli)
    try {
      const cfg = localStorage.getItem("kioskConfig");
      if (cfg) return (JSON.parse(cfg) as { buildingId?: string }).buildingId || "";
    } catch { /* ignore */ }
    return "";
  }, []);

  // activeBuildingId — reactive state. Login dan keyin client-navigatsiya bo'lsa
  // ham (provider qayta mount bo'lmaydi) building id va auth holatini kuzatamiz.
  const [activeBuildingId, setActiveBuildingId] = useState<string>("");
  // authTick — token tayyor bo'lganda (login tugaganda) ortadi va fetch'larni qayta ishga tushiradi
  const [authTick, setAuthTick] = useState(0);

  // --- Ticket list state ---
  const [tickets, setTickets] = useState<DisplayTicket[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [wsAuthError, setWsAuthError] = useState(false);

  // --- Doctors state (real-time) ---
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // --- Refs ---
  const audioPlayingRef = useRef(false);
  const isProcessingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wsCallbackRef = useRef<((msg: any) => void) | null>(null);

  // ─────────────────────────────────────────────────────────
  // Auth holatini kuzatish: token tayyor bo'lguncha kutish
  //
  // QueueProvider root layout'da bo'lgani uchun /login sahifasida ham mount
  // bo'ladi (token hali yo'q). Login tugab client-navigatsiya bo'lganda provider
  // QAYTA mount bo'lmaydi — shu sababli mount-only effect ishlamay qolardi va
  // doktorlar/tiketlar kelmas edi. Bu yerda token paydo bo'lishini kuzatamiz va
  // building id ni reactive state'ga yozamiz, so'ng fetch'lar qayta ishga tushadi.
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    const syncAuth = () => {
      setActiveBuildingId(computeBuildingId());
      if (hasValidToken()) {
        setAuthTick((t) => t + 1);
        return true;
      }
      return false;
    };

    // Darhol tekshiramiz; token bo'lmasa qisqa interval bilan ~10s kutamiz
    if (!syncAuth()) {
      let attempts = 0;
      const id = setInterval(() => {
        attempts++;
        if (syncAuth() || attempts >= 20) clearInterval(id);
      }, 500);
      return () => clearInterval(id);
    }
  }, [computeBuildingId]);

  // Boshqa tab/sahifada login yoki kioskConfig o'zgarsa — qayta sinxronlash
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "kioskConfig" || e.key === "kiosk_access_token" || e.key === null) {
        setActiveBuildingId(computeBuildingId());
        if (hasValidToken()) setAuthTick((t) => t + 1);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [computeBuildingId]);

  // ─────────────────────────────────────────────────────────
  // Active ticketlar endi FAQAT WebSocket orqali keladi:
  //   • ulanishda backend "QUEUE_SNAPSHOT" yuboradi (binoga filtrlangan)
  //   • keyin TICKET_CREATED / CALLED / UPDATED ... eventlari yangilaydi
  // Shuning uchun bu yerda HTTP getQueue chaqirilmaydi (polling ham yo'q).
  // loadingTickets WS ulanishi/snapshot'ida false bo'ladi.
  // ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (authTick === 0 || !hasValidToken()) {
      if (authTick === 0) setLoadingDoctors(false);
      return;
    }
    console.log("[QueueContext] doktorlar yuklash boshlandi, building_id:", activeBuildingId || "yo'q");
    setLoadingDoctors(true);
    const load = activeBuildingId
      ? getDoctorsByBuilding(activeBuildingId)
      : getDoctors();
    load
      .then((data) => {
        setDoctors(data);
        console.log("[QueueContext] doktorlar yuklandi:", data.length, "ta");
      })
      .catch((err) => {
        console.warn("[QueueContext] doctors fetch xatolik:", err.message);
      })
      .finally(() => setLoadingDoctors(false));
  }, [authTick, activeBuildingId]);

  // ─────────────────────────────────────────────────────────
  // Audio queue — localStorage dan yuklash
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    const calls = readCallsFromStorage();
    setPendingCalls(calls);
  }, []);

  // Boshqa sahifalardan storage o'zgarishini tinglash
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setPendingCalls(readCallsFromStorage());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // ─────────────────────────────────────────────────────────
  // Audio funksiyalari
  // ─────────────────────────────────────────────────────────
  const playAudioFile = async (filePath: string, time = 2500): Promise<boolean> => {
    return new Promise((resolve) => {
      const audio = new Audio(filePath);
      audio.volume = 0.7;
      audio.onloadeddata = () => {
        audio.play().catch(() => resolve(false));
      };
      audio.onended = () => resolve(true);
      audio.onerror = () => resolve(false);
      setTimeout(() => {
        if (!audio.ended) { audio.pause(); resolve(false); }
      }, time);
    });
  };

  const playNumber = async (number: number): Promise<void> => {
    if (number <= 10) {
      await playAudioFile(`/sounds/numbers/${number}.mp3`, 800);
    } else if (number <= 19) {
      await playAudioFile(`/sounds/numbers/10a.mp3`, 700);
      await new Promise((r) => setTimeout(r, 200));
      await playAudioFile(`/sounds/numbers/${number - 10}.mp3`, 800);
    } else if (number <= 99) {
      const tens = Math.floor(number / 10);
      const ones = number % 10;
      await playAudioFile(`/sounds/numbers/${tens}0a.mp3`, 700);
      await new Promise((r) => setTimeout(r, 200));
      if (ones > 0) await playAudioFile(`/sounds/numbers/${ones}.mp3`, 800);
    } else {
      await playAudioFile(`/sounds/numbers/${number}.mp3`, 800);
    }
    await new Promise((r) => setTimeout(r, 200));
  };

  const playRoomNumber = async (room: string): Promise<void> => {
    // room "201" yoki "201-xona" formatida kelishi mumkin
    const roomCode = room.replace("-xona", "");
    await playAudioFile(`/sounds/numbers/${roomCode}-xona.mp3`, 1150);
    await new Promise((r) => setTimeout(r, 200));
  };

  const playNotificationSound = async (ticketNumber: number, room: string) => {
    if (audioPlayingRef.current) return;
    audioPlayingRef.current = true;
    try {
      await playNumber(ticketNumber);
      await playAudioFile("/sounds/phrases/raqam_egasi.mp3", 1500);
      await playRoomNumber(room);
      await playAudioFile("/sounds/phrases/honaga_kelishin.mp3");
    } catch {
    } finally {
      audioPlayingRef.current = false;
    }
  };

  // ─────────────────────────────────────────────────────────
  // Audio navbat boshqaruvi
  // ─────────────────────────────────────────────────────────
  const finishCurrentCall = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowModal(false);
    setTimeout(() => {
      setCurrentCall(null);
      isProcessingRef.current = false;
      setTimeout(() => processQueue(), 500);
    }, 300);
  };

  const processQueue = async () => {
    if (isProcessingRef.current) return;
    const storageCalls = readCallsFromStorage();
    if (storageCalls.length === 0) { setPendingCalls([]); return; }
    if (currentCall || showModal || audioPlayingRef.current) return;

    isProcessingRef.current = true;
    const nextCall = storageCalls[0];
    setCurrentCall(nextCall);
    setShowModal(true);
    await removeFirstCallFromStorage();
    setPendingCalls(storageCalls.slice(1));
    // Audio'ni imkon qadar tez boshlaymiz (admin panel bilan kechikishni kamaytirish).
    // 150ms — modal render bo'lishiga yetarli, lekin sezilarli lag bermaydi.
    setTimeout(() => {
      playNotificationSound(nextCall.ticketNumber, nextCall.room);
    }, 150);
    timeoutRef.current = setTimeout(() => finishCurrentCall(), 8000);
  };

  useEffect(() => {
    if (!isProcessingRef.current && !currentCall && !showModal && pendingCalls.length > 0) {
      setTimeout(() => processQueue(), 500);
    }
  }, [pendingCalls.length]);

  const triggerCall = async (ticketNumber: number, room: string) => {
    const newCall: CurrentCall = {
      ticketNumber,
      room,
      timestamp: Date.now(),
      callId: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
    const success = await addCallToStorage(newCall);
    if (success) {
      const updated = readCallsFromStorage();
      setPendingCalls(updated);
      if (!isProcessingRef.current && !currentCall && !showModal) {
        setTimeout(() => processQueue(), 50);
      }
    }
  };

  const closeModal = () => finishCurrentCall();

  // ─────────────────────────────────────────────────────────
  // WebSocket callback ref — stale closure muammosini hal qiladi
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    wsCallbackRef.current = (msg: any) => {
      const p = msg?.payload;
      if (!p) return;

      // Building isolation: agar kiosk bino bilan sozlangan bo'lsa,
      // faqat o'sha binoga tegishli ticketlarni ko'rsatish
      const kioskBuildingId = activeBuildingId;
      const ticketBuildingId = p.building_id || "";
      if (kioskBuildingId && ticketBuildingId && kioskBuildingId !== ticketBuildingId) return;

      switch (msg.type) {
        case "QUEUE_SNAPSHOT": {
          // Ulanishda backend yuborgan boshlang'ich active-ticketlar ro'yxati
          // (binoga filtrlangan). HTTP polling o'rnini bosadi.
          const list = Array.isArray(p.tickets) ? p.tickets : [];
          setTickets(list.map(adaptTicket));
          setLoadingTickets(false);
          break;
        }

        case "TICKET_CREATED":
          setTickets((prev) => {
            if (prev.some((t) => t.id === p.ticket_id)) return prev;
            return [...prev, payloadToDisplayTicket(p)];
          });
          break;

        case "TICKET_CALLED":
          // Status yangilash
          setTickets((prev) =>
            prev.map((t) =>
              t.id === p.ticket_id ? { ...t, status: "in-progress" as const } : t
            )
          );
          // Brauzer audiosi + animatsiya FAQAT display/queueDisplay sahifalarida.
          // Kiosk (elektronNavbat) sahifasida chalmaymiz — aks holda kiosk
          // mashinasida POS80 drayveri (backend notifyKioskAudio) bilan birga
          // OVOZ IKKI MARTA eshitilardi. Kioskda faqat POS80 chaladi.
          if (
            typeof window !== "undefined" &&
            (window.location.pathname.startsWith("/display") ||
              window.location.pathname.startsWith("/queueDisplay"))
          ) {
            triggerCall(p.queue_number ?? 0, p.room_number ?? "");
          }
          break;

        case "TICKET_IN_PROGRESS":
          setTickets((prev) =>
            prev.map((t) =>
              t.id === p.ticket_id ? { ...t, status: "in-progress" as const } : t
            )
          );
          break;

        case "TICKET_STATUS_UPDATED":
          if (["completed", "cancelled", "missed"].includes(p.new_status)) {
            setTickets((prev) => prev.filter((t) => t.id !== p.ticket_id));
          } else {
            setTickets((prev) =>
              prev.map((t) =>
                t.id === p.ticket_id
                  ? { ...t, status: backendStatusToDisplay(p.new_status) }
                  : t
              )
            );
          }
          break;

        case "TICKET_COMPLETED":
        case "TICKET_CANCELLED":
          setTickets((prev) => prev.filter((t) => t.id !== p.ticket_id));
          break;

        case "QUEUE_UPDATED":
          if (!hasValidToken()) break;
          getQueue(kioskBuildingId || undefined)
            .then((data) => setTickets(data))
            .catch((err) => { console.warn("[WS:QUEUE_UPDATED] fetch xatolik:", err.message); });
          break;

        case "TICKET_UPDATED":
          // medical_ai dan kelgan yangi event format
          if (p.status && ["completed", "cancelled", "missed"].includes(p.status)) {
            setTickets((prev) => prev.filter((t) => t.id !== p.id));
          } else if (p.status) {
            setTickets((prev) =>
              prev.map((t) =>
                t.id === p.id ? { ...t, status: backendStatusToDisplay(p.status) } : t
              )
            );
          }
          break;

        case "DOCTOR_BUSY":
        case "DOCTOR_AVAILABLE": {
          if (p.doctor_id) {
            // Payloaddagi status ni ishlatamiz (busy, break, available)
            const validStatuses = ["available", "busy", "break"] as const;
            const newStatus: Doctor["status"] = validStatuses.includes(p.status)
              ? p.status
              : msg.type === "DOCTOR_BUSY" ? "busy" : "available";
            setDoctors((prev) =>
              prev.map((d) =>
                d.id === p.doctor_id ? { ...d, status: newStatus } : d
              )
            );
          }
          break;
        }
      }
    };
  }, [triggerCall, activeBuildingId]);

  // ─────────────────────────────────────────────────────────
  // WebSocket ulanish
  // ─────────────────────────────────────────────────────────
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (wsRef.current?.readyState === WebSocket.CONNECTING) return;

    // Token: URL ?token= (display_token) > localStorage display_token > kiosk token
    let token = "";
    if (typeof window !== "undefined") {
      const urlToken = new URLSearchParams(window.location.search).get("token");
      token = urlToken || getDisplayToken() || getKioskToken() || "";
    }

    if (!token) {
      console.warn("[WS] token yo'q — WebSocket ulanish bekor qilindi");
      setWsAuthError(true);
      setIsConnected(false);
      setLoadingTickets(false);
      return;
    }

    setWsAuthError(false);
    const wsEndpoint = `${WS_URL}/api/v1/ws/public?token=${encodeURIComponent(token)}`;
    console.log("[WS] ulanish boshlandi:", wsEndpoint.replace(/token=.*/, "token=***"));

    try {
      const ws = new WebSocket(wsEndpoint);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[WS] ulandi ✓");
        setIsConnected(true);
        // Snapshot kelguncha kutamiz, lekin spinner abadiy qotmasin —
        // ulanish bo'lgach yuklanish holatini yopamiz (snapshot ham yangilaydi).
        setLoadingTickets(false);
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          // PING/PONG ni e'tiborsiz qoldiramiz
          if (msg.type === "PING" || msg.type === "PONG" || msg.type === "CONNECTION_ESTABLISHED") return;
          wsCallbackRef.current?.(msg);
        } catch {}
      };

      ws.onclose = (event: CloseEvent) => {
        setIsConnected(false);
        wsRef.current = null;
        // 4001 = session_replaced — backend yangi connection evict qildi, reconnect qilmaymiz
        if (event.code === 4001) {
          console.log("[WS] session_replaced (4001) — reconnect bekor qilindi");
          return;
        }
        if (!hasValidToken()) {
          console.warn("[WS] token yo'q — qayta ulanish bekor qilindi");
          return;
        }
        console.log(`[WS] uzildi (${event.code}) — 5 soniyada qayta ulanish`);
        reconnectTimerRef.current = setTimeout(() => connectWebSocket(), 5000);
      };

      ws.onerror = (e) => {
        console.warn("[WS] xatolik:", e);
        ws.close();
      };
    } catch {
      if (!hasValidToken()) return;
      reconnectTimerRef.current = setTimeout(() => connectWebSocket(), 5000);
    }
  }, []);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // auto-reconnect ni o'chirish
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  // ─────────────────────────────────────────────────────────
  // Proaktiv token yangilash (avtomatik refresh)
  //
  // Access token muddati tugaganda (yoki tugashiga oz qolganda) refresh token
  // orqali yangi access token olamiz. Aks holda token o'lganda hasValidToken()
  // false bo'lib polling/WS/doktorlar yuklash to'xtab qolardi. Bu yerda har
  // daqiqada tekshirib, kerak bo'lsa yangilaymiz — display/kiosk uzluksiz ishlaydi.
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const ensureFreshToken = async () => {
      if (typeof window === "undefined") return;
      const refresh = getKioskRefreshToken();
      if (!refresh) return; // refresh token yo'q — yangilab bo'lmaydi

      const token = getKioskToken();
      let needRefresh = !token;
      if (token) {
        try {
          const exp = (decodeJwtPayload(token).exp as number) || 0;
          // 2 daqiqadan kam qolgan yoki tugagan bo'lsa — yangilaymiz
          needRefresh = exp * 1000 - Date.now() < 2 * 60 * 1000;
        } catch {
          needRefresh = true;
        }
      }
      if (!needRefresh) return;

      const fresh = await refreshKioskToken();
      if (fresh && !cancelled) {
        console.log("[Auth] token avtomatik yangilandi");
        // Bog'liq mexanizmlarni qayta tiklash
        setActiveBuildingId(computeBuildingId());
        setAuthTick((t) => t + 1);   // doctors/tickets refetch
        connectWebSocket();          // WS qayta ulanish (token o'lib uzilgan bo'lsa)
      }
    };

    ensureFreshToken();
    const id = setInterval(ensureFreshToken, 60 * 1000); // har daqiqa
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [computeBuildingId, connectWebSocket]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <QueueContext.Provider
      value={{
        currentCall,
        showModal,
        triggerCall,
        closeModal,
        pendingCalls,
        tickets,
        isConnected,
        loadingTickets,
        wsAuthError,
        doctors,
        loadingDoctors,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (context === undefined) {
    throw new Error("useQueue must be used within a QueueProvider");
  }
  return context;
}
