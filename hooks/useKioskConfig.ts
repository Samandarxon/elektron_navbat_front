"use client";

import { useState, useEffect } from "react";

const KIOSK_CONFIG_KEY = "kioskConfig";

export interface KioskConfig {
  buildingId: string;
  buildingName: string;
  kioskCode: string;
  polyclinicId: string;
  polyclinicName: string;
}

const defaultConfig: KioskConfig = {
  buildingId: "",
  buildingName: "",
  kioskCode: "",
  polyclinicId: "",
  polyclinicName: "",
};

export function useKioskConfig() {
  const [config, setConfig] = useState<KioskConfig>(defaultConfig);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KIOSK_CONFIG_KEY);
      if (stored) {
        setConfig({ ...defaultConfig, ...JSON.parse(stored) });
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  const saveConfig = (newConfig: KioskConfig) => {
    localStorage.setItem(KIOSK_CONFIG_KEY, JSON.stringify(newConfig));
    setConfig(newConfig);
  };

  const clearConfig = () => {
    localStorage.removeItem(KIOSK_CONFIG_KEY);
    setConfig(defaultConfig);
  };

  return { config, saveConfig, clearConfig, loaded };
}
