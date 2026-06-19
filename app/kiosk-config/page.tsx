"use client";

import { useState, useEffect } from "react";
import { useKioskConfig } from "@/hooks/useKioskConfig";
import { getRuntimeEnv } from "@/lib/runtime-env";

const API_URL = getRuntimeEnv().API_URL;

interface Polyclinic {
  id: string;
  name: string;
  code: string;
  type: string;
  address: string;
  is_active: boolean;
}

interface Building {
  id: string;
  name: string;
  code: string;
  polyclinic_id: string;
  floor_count: number;
  is_active: boolean;
}

export default function KioskConfigPage() {
  const { config, saveConfig, clearConfig, loaded } = useKioskConfig();

  const [polyclinics, setPolyclinics] = useState<Polyclinic[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);

  const [selectedPolyclinicId, setSelectedPolyclinicId] = useState("");
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [kioskCode, setKioskCode] = useState("");

  const [loadingPolyclinics, setLoadingPolyclinics] = useState(true);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Poliklinikalar ro'yxatini yuklash
  useEffect(() => {
    fetch(`${API_URL}/api/v1/public/polyclinics`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const list: Polyclinic[] =
          data?.data ?? data?.polyclinics ?? [];
        setPolyclinics(list.filter((p) => p.is_active));
      })
      .catch((e) => setError(`Poliklinikalar yuklanmadi: ${e.message}`))
      .finally(() => setLoadingPolyclinics(false));
  }, []);

  // Saqlangan konfiguratsiyani yuklash
  useEffect(() => {
    if (loaded && config.buildingId) {
      setSelectedPolyclinicId(config.polyclinicId || "");
      setSelectedBuildingId(config.buildingId);
      setKioskCode(config.kioskCode);
    }
  }, [loaded, config]);

  // Poliklinika tanlanganda binolarni yuklash
  useEffect(() => {
    if (!selectedPolyclinicId) {
      setBuildings([]);
      setSelectedBuildingId("");
      return;
    }
    setLoadingBuildings(true);
    setSelectedBuildingId("");
    fetch(`${API_URL}/api/v1/public/buildings?polyclinic_id=${selectedPolyclinicId}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const list: Building[] =
          data?.data?.buildings ?? data?.buildings ?? [];
        setBuildings(list.filter((b) => b.is_active));
      })
      .catch((e) => setError(`Binolar yuklanmadi: ${e.message}`))
      .finally(() => setLoadingBuildings(false));
  }, [selectedPolyclinicId]);

  const handleSave = () => {
    if (!selectedPolyclinicId) {
      setError("Poliklinika tanlanishi shart");
      return;
    }
    if (!selectedBuildingId) {
      setError("Bino tanlanishi shart");
      return;
    }
    const polyclinic = polyclinics.find((p) => p.id === selectedPolyclinicId);
    const building = buildings.find((b) => b.id === selectedBuildingId);
    saveConfig({
      polyclinicId: selectedPolyclinicId,
      polyclinicName: polyclinic?.name || "",
      buildingId: selectedBuildingId,
      buildingName: building?.name || "",
      kioskCode: kioskCode.trim(),
    });
    setSaved(true);
    setError("");
    setTimeout(() => setSaved(false), 2000);
  };

  const polyclinicTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      republic: "Respublika",
      city: "Shahar",
      region: "Viloyat",
    };
    return map[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center">Kiosk Sozlamalari</h1>
        <p className="text-gray-400 text-sm text-center mb-8">
          Avval poliklinikani, so&apos;ng binoni tanlang
        </p>

        {error && (
          <div className="bg-red-900/50 text-red-300 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Joriy sozlama */}
        {config.buildingId && (
          <div className="bg-green-900/30 text-green-300 rounded-lg px-4 py-3 mb-6 text-sm space-y-1">
            <div>
              <span className="font-semibold">Poliklinika:</span>{" "}
              {config.polyclinicName || "—"}
            </div>
            <div>
              <span className="font-semibold">Bino:</span>{" "}
              {config.buildingName}
            </div>
            {config.kioskCode && (
              <div>
                <span className="font-semibold">Kiosk kodi:</span>{" "}
                {config.kioskCode}
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          {/* 1. Poliklinika tanlash */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              1. Poliklinika <span className="text-red-400">*</span>
            </label>
            {loadingPolyclinics ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400" />
                Yuklanmoqda...
              </div>
            ) : (
              <select
                value={selectedPolyclinicId}
                onChange={(e) => {
                  setSelectedPolyclinicId(e.target.value);
                  setError("");
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tanlang...</option>
                {polyclinics.map((p) => (
                  <option key={p.id} value={p.id}>
                    {polyclinicTypeLabel(p.type)} — {p.name} ({p.code})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 2. Bino tanlash */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              2. Bino <span className="text-red-400">*</span>
            </label>
            {!selectedPolyclinicId ? (
              <div className="text-gray-500 text-sm py-2">
                Avval poliklinikani tanlang
              </div>
            ) : loadingBuildings ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400" />
                Binolar yuklanmoqda...
              </div>
            ) : buildings.length === 0 ? (
              <div className="text-yellow-500 text-sm py-2">
                Bu poliklinikada binolar topilmadi
              </div>
            ) : (
              <select
                value={selectedBuildingId}
                onChange={(e) => {
                  setSelectedBuildingId(e.target.value);
                  setError("");
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tanlang...</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 3. Kiosk kodi */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              3. Kiosk kodi{" "}
              <span className="text-gray-500 font-normal">(ixtiyoriy)</span>
            </label>
            <input
              type="text"
              value={kioskCode}
              onChange={(e) => setKioskCode(e.target.value)}
              placeholder="Masalan: KIOSK-01"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tugmalar */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={!selectedPolyclinicId || !selectedBuildingId || loadingPolyclinics}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed rounded-lg py-2.5 text-sm font-semibold transition-colors"
            >
              {saved ? "Saqlandi ✓" : "Saqlash"}
            </button>
            {config.buildingId && (
              <button
                onClick={() => {
                  clearConfig();
                  setSelectedPolyclinicId("");
                  setSelectedBuildingId("");
                  setKioskCode("");
                }}
                className="px-4 bg-gray-700 hover:bg-gray-600 rounded-lg py-2.5 text-sm transition-colors text-gray-300"
              >
                Tozalash
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700 text-center">
          <p className="text-gray-600 text-xs">
            Sahifa: <code className="text-gray-500">/kiosk-config</code>
            {" · "}
            <code className="text-gray-600">{API_URL}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
