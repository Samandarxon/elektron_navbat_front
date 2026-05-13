"use client";

import { useCallback, useRef } from "react";

export function useMutex() {
  const lockRef = useRef(false);
  const queueRef = useRef<(() => void)[]>([]);

  const acquire = useCallback((): Promise<() => void> => {
    return new Promise((resolve) => {
      if (!lockRef.current) {
        // Lock bo'sh, darhol beramiz
        lockRef.current = true;
        resolve(() => {
          lockRef.current = false;
          const next = queueRef.current.shift();
          if (next) next();
        });
      } else {
        // Lock band, navbatga qo'shamiz
        queueRef.current.push(() => {
          lockRef.current = true;
          resolve(() => {
            lockRef.current = false;
            const next = queueRef.current.shift();
            if (next) next();
          });
        });
      }
    });
  }, []);

  return { acquire };
}