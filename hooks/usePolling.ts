import { useState, useEffect, useRef } from 'react';

export function usePolling<T>(
  callback: () => Promise<T>,
  interval: number,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled ?? true;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setData(null);
      console.log("[Polling] to'xtatildi — token mavjud emas");
      return;
    }

    let mounted = true;
    let active = true;

    const stopPolling = () => {
      active = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const fetchData = async () => {
      if (!active) return;
      try {
        setLoading(true);
        const result = await callback();
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          const e = err as Error;
          if (e.name === "AuthError") {
            // Display/queueDisplay sahifalari — bu ekranlar devorga osilgan monitorlar,
            // ularni HECH QACHON login/bosh sahifaga yo'naltirmaymiz. Token tiklanguncha
            // (avtomatik refresh) joyida turib qayta urinaveradi.
            const onDisplayPage =
              typeof window !== "undefined" &&
              (window.location.pathname.startsWith("/display") ||
                window.location.pathname.startsWith("/queueDisplay"));
            if (onDisplayPage) {
              console.warn("[Polling] Auth xatolik (display) — redirect yo'q, qayta urinish davom etadi");
              setError(e);
            } else {
              console.warn("[Polling] Auth xatolik — polling to'xtatildi:", e.message);
              stopPolling();
              if (typeof window !== "undefined") {
                window.location.replace("/login");
              }
            }
          } else {
            setError(e);
          }
        }
      } finally {
        if (mounted && active) {
          setLoading(false);
        }
      }
    };

    fetchData();
    timerRef.current = setInterval(fetchData, interval);

    return () => {
      mounted = false;
      stopPolling();
    };
  }, [callback, interval, enabled]);

  return { data, loading, error };
}
