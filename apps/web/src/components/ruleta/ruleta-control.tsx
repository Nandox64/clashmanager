"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, Play, Save, Square, RotateCcw } from "lucide-react";

interface PrizeCount {
  oro1k: number;
  oro10k: number;
  gemas500: number;
  gemas1200: number;
  pass: number;
}

interface Winner {
  uid: string;
  displayName: string;
  prize: string;
  awardedAt: number;
}

const PRIZE_LABELS: Record<string, string> = {
  "oro-1k": "Oro $1,000", "oro-10k": "Oro $10,000",
  "gemas-500": "Gemas 500", "gemas-1200": "Gemas 1200", "pass": "Pass Royale",
};

const PRIZE_KEYS = ["oro-1k", "oro-10k", "gemas-500", "gemas-1200", "pass"];

export function RuletaControl({ isAllowed }: { isAllowed: boolean }) {
  const { user } = useAuth();
  const [eventActive, setEventActive] = useState(false);
  const [prizeCounts, setPrizeCounts] = useState<PrizeCount>({ oro1k: 0, oro10k: 0, gemas500: 0, gemas1200: 0, pass: 0 });
  const [maxWinners, setMaxWinners] = useState(3);
  const [eventName, setEventName] = useState("");
  const [winners, setWinners] = useState<Winner[]>([]);
  const [toggling, setToggling] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const getHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const token = await user?.getIdToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : { Authorization: "Bearer mock-mode" }),
    };
  }, [user]);

  const fetchData = useCallback(async () => {
    const headers = await getHeaders();
    try {
      const [configRes, winnersRes] = await Promise.all([
        fetch("/api/ruleta/config", { headers }),
        fetch("/api/ruleta/winners", { headers }),
      ]);
      const config = await configRes.json();
      const w: Winner[] = await winnersRes.json();
      setEventActive(config.eventActive ?? false);
      setEventName(config.eventName ?? "");
      setMaxWinners(config.maxWinners ?? 3);
      setPrizeCounts({
        oro1k: config.prizeCounts?.["oro-1k"] ?? 0,
        oro10k: config.prizeCounts?.["oro-10k"] ?? 0,
        gemas500: config.prizeCounts?.["gemas-500"] ?? 0,
        gemas1200: config.prizeCounts?.["gemas-1200"] ?? 0,
        pass: config.prizeCounts?.pass ?? 0,
      });
      setWinners(Array.isArray(w) ? w : []);
    } catch {
      // silent
    }
  }, [getHeaders]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveConfig = async () => {
    setSaving(true);
    try {
      const headers = await getHeaders();
      const res = await fetch("/api/ruleta/config", {
        method: "POST",
        headers,
        body: JSON.stringify({ eventActive, eventName, maxWinners }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const toggleEvent = async (active: boolean) => {
    setToggling(true);
    try {
      const headers = await getHeaders();
      const res = await fetch("/api/ruleta/config", {
        method: "POST",
        headers,
        body: JSON.stringify({ eventActive: active, eventName, maxWinners }),
      });
      if (res.ok) {
        setEventActive(active);
        await fetchData();
      }
    } catch {
      // silent
    } finally {
      setToggling(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("¿Estás seguro? Se borrarán todos los ganadores, tiros y la configuración de la ruleta.")) return;
    setResetting(true);
    try {
      const headers = await getHeaders();
      await fetch("/api/ruleta/reset", { method: "POST", headers });
      await fetchData();
    } catch {
      // silent
    } finally {
      setResetting(false);
    }
  };

  const totalWinners = Object.values(prizeCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      {/* Event name + max winners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-clash-muted">Nombre del evento</label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            disabled={!isAllowed || eventActive}
            placeholder="Ej: Evento Julio 2026"
            className="w-full rounded-lg border border-clash-border bg-glass px-3 py-2 text-sm text-clash-text focus:outline-none focus:border-metallic-gold focus:ring-1 focus:ring-metallic-gold transition-colors disabled:opacity-70"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-clash-muted">Máx ganadores por evento</label>
          <input
            type="number"
            value={maxWinners}
            onChange={(e) => setMaxWinners(Math.max(1, Number(e.target.value)))}
            disabled={!isAllowed || eventActive}
            min={1}
            max={50}
            className="w-full rounded-lg border border-clash-border bg-glass px-3 py-2 text-sm text-clash-text focus:outline-none focus:border-metallic-gold focus:ring-1 focus:ring-metallic-gold transition-colors disabled:opacity-70"
          />
        </div>
      </div>

      {/* Save + Toggle buttons */}
      {isAllowed && (
        <div className="flex flex-wrap gap-3">
          <Button onClick={saveConfig} disabled={saving || eventActive} variant="metal">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Guardar configuración
          </Button>
          {!eventActive ? (
            <Button onClick={() => toggleEvent(true)} disabled={toggling} variant="metal">
              {toggling ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              Activar evento
            </Button>
          ) : (
            <Button onClick={() => toggleEvent(false)} disabled={toggling} variant="secondary" className="text-red-500">
              {toggling ? <Loader2 size={16} className="animate-spin" /> : <Square size={16} />}
              Desactivar evento
            </Button>
          )}
          <Button onClick={handleReset} disabled={resetting} variant="secondary" className="text-red-400 border-red-400/30">
            {resetting ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
            Reset ruleta
          </Button>
        </div>
      )}

      {/* Prize counts */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {PRIZE_KEYS.map((key) => (
          <div key={key} className="p-2 rounded-lg bg-glass border border-clash-border text-center">
            <p className="text-[10px] text-clash-muted truncate">{PRIZE_LABELS[key]}</p>
            <p className={`text-sm font-bold ${key === "pass" ? "text-red-500" : "text-metallic-gold"}`}>
              {prizeCounts[key.replace("-", "") as keyof PrizeCount] ?? 0}
              <span className="text-[10px] text-clash-muted font-normal">/ {key === "pass" ? 1 : 3}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="text-xs text-clash-muted">
        Total: <strong className="text-clash-text">{totalWinners}</strong> / {maxWinners} ganadores
      </div>

      {/* Winners list */}
      {winners.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-clash-text">Ganadores</p>
          {winners.map((w) => (
            <div key={w.uid + w.awardedAt} className="flex items-center gap-2 p-2 rounded-lg bg-glass">
              <p className="text-xs text-clash-text flex-1 truncate">{w.displayName}</p>
              <p className="text-[10px] text-metallic-gold font-medium">{PRIZE_LABELS[w.prize] || w.prize}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
