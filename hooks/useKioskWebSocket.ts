"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { getKioskToken, isKioskLoggedIn } from "@/app/lib/api/auth";
import { getRuntimeEnv } from "@/lib/runtime-env";

const WS_URL = getRuntimeEnv().WS_URL;

export interface KioskWsMessage {
  type: string;
  payload: unknown;
  user_id?: string;
  timestamp?: string;
}

interface UseKioskWebSocketOptions {
  onMessage?: (msg: KioskWsMessage) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  enabled?: boolean;
}

export function useKioskWebSocket({
  onMessage,
  onConnected,
  onDisconnected,
  enabled = true,
}: UseKioskWebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // reconnectCount useRef — useState'dan farqli ravishda o'zgarsa connect/useEffect qayta ishlamaydi
  const reconnectCountRef = useRef(0);
  const [connected, setConnected] = useState(false);

  // Stable callbacks — har render'da yangi reference hosil bo'lmasin
  const onMessageRef = useRef(onMessage);
  const onConnectedRef = useRef(onConnected);
  const onDisconnectedRef = useRef(onDisconnected);
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
  useEffect(() => { onConnectedRef.current = onConnected; }, [onConnected]);
  useEffect(() => { onDisconnectedRef.current = onDisconnected; }, [onDisconnected]);

  const connect = useCallback(() => {
    if (!enabled || !isKioskLoggedIn()) return;
    const token = getKioskToken();
    if (!token) return;

    // Allaqachon ochiq bo'lsa qayta ulanmaymiz
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;
    // Ulanish jarayonida bo'lsa ham qayta ulanmaymiz
    if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) return;

    const url = `${WS_URL}/api/v1/ws/kiosk?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      reconnectCountRef.current = 0;
      onConnectedRef.current?.();
    };

    ws.onmessage = (event) => {
      try {
        // Backend xabarlar alohida frame sifatida keladi
        const msg: KioskWsMessage = JSON.parse(event.data);
        onMessageRef.current?.(msg);
      } catch {
        // parse error — ignore
      }
    };

    ws.onclose = (event: CloseEvent) => {
      setConnected(false);
      wsRef.current = null;
      onDisconnectedRef.current?.();

      // 4001 = session_replaced (backend yangi connection evict qildi) — reconnect qilmaymiz
      if (event.code === 4001) {
        console.log("[KioskWS] session_replaced (4001) — reconnect bekor qilindi");
        return;
      }
      // 1000 = normal closure (komponent unmount) — reconnect qilmaymiz
      if (event.code === 1000) return;

      // Exponential backoff: 5s → 10s → 20s (max)
      const delay = Math.min(5000 * Math.pow(2, reconnectCountRef.current), 20000);
      console.log(`[KioskWS] uzildi (${event.code}) — ${delay}ms da qayta ulanish`);
      reconnectTimer.current = setTimeout(() => {
        reconnectCountRef.current++;
        connect();
      }, delay);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [enabled]); // faqat `enabled` dep — callback'lar ref orqali, reconnectCount ref orqali

  useEffect(() => {
    if (!enabled) return;
    connect();
    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
      if (wsRef.current) {
        wsRef.current.onclose = null; // unmount'da auto-reconnect oldini olish
        wsRef.current.close(1000, "component_unmounted");
        wsRef.current = null;
      }
    };
  }, [connect, enabled]);

  const sendMessage = useCallback((type: string, payload?: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    }
  }, []);

  return { connected, sendMessage };
}
