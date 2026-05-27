"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { RuletaWheel } from "./ruleta-wheel";
import { Confetti } from "./confetti";
import { playSpinTick, playWinSound, playLoseSound, playCountdownBeep } from "@/lib/ruleta-sound";
import { useAuth } from "@/contexts/AuthContext";
import { useClanStore } from "@/lib/store";
import { getCachedLinkedMemberId } from "@/lib/profile-cache";
import { Loader2, Gift } from "lucide-react";

interface SpinResult {
  prize: string;
  label: string;
  segmentIndex: number;
  won: boolean;
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

export function RuletaSection() {
  const { user } = useAuth();
  const members = useClanStore((s) => s.members);
  const [eventActive, setEventActive] = useState(false);
  const [spinsRemaining, setSpinsRemaining] = useState(-1);
  const [won, setWon] = useState(false);
  const [prize, setPrize] = useState<string | null>(null);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [currentResult, setCurrentResult] = useState<SpinResult | null>(null);
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingResultRef = useRef<SpinResult | null>(null);

  const linkedId = getCachedLinkedMemberId();
  const linkedMember = members.find((m) => m.uid === linkedId);
  const displayName = linkedMember?.displayName || user?.displayName || "Anónimo";

  const fetchState = useCallback(async () => {
    const token = await user?.getIdToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : { Authorization: "Bearer mock-mode" };

    try {
      const [configRes, stateRes, winnersRes] = await Promise.all([
        fetch("/api/ruleta/config", { headers }),
        fetch("/api/ruleta/state", { headers }),
        fetch("/api/ruleta/winners", { headers }),
      ]);

      const config = await configRes.json();
      const state = await stateRes.json();
      const w = await winnersRes.json();

      setEventActive(config.eventActive ?? false);
      setSpinsRemaining(state.spinsRemaining ?? -1);
      setWon(state.won ?? false);
      setPrize(state.prize ?? null);
      setWinners(Array.isArray(w) ? w : []);
    } catch {
      setLastResult({ prize: "error", label: "Error al cargar estado", segmentIndex: 0, won: false });
    }
  }, [user]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Tick sound while spinning (accelerates)
  useEffect(() => {
    if (!spinning) {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }
    let tickCount = 0;
    const tick = () => {
      playSpinTick();
      tickCount++;
      const delay = Math.max(40, 200 - tickCount * 3);
      tickRef.current = setTimeout(tick, delay);
    };
    tick();
    return () => { if (tickRef.current) clearTimeout(tickRef.current); };
  }, [spinning]);

  // Countdown effect
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      playCountdownBeep();
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
    // countdown === 0 → start spinning
    setCountdown(null);
    const result = pendingResultRef.current;
    pendingResultRef.current = null;
    if (!result || result.prize === "error") {
      if (result) setLastResult(result);
      return;
    }
    setSpinning(true);
    setCurrentResult(result);
    setLastResult(result);
    if (result.won) {
      playWinSound();
      setTimeout(() => setShowConfetti(true), 8200);
    } else {
      playLoseSound();
    }
    setTimeout(() => {
      setSpinning(false);
      if (eventActive) {
        setSpinsRemaining((prev) => Math.max(0, prev - 1));
        if (result.won) { setWon(true); setPrize(result.prize); }
      }
      fetchState();
    }, 8500);
  }, [countdown]);

  const handleSpin = async () => {
    if (spinning || countdown !== null || (eventActive && spinsRemaining <= 0) || (eventActive && won)) return;

    setCountdown(3);
    setCurrentResult(null);
    setLastResult(null);
    setShowConfetti(false);

    const token = await user?.getIdToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : { Authorization: "Bearer mock-mode" }),
    };
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch("/api/ruleta/spin", {
        method: "POST",
        headers,
        body: JSON.stringify({ displayName }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        const err = await res.json();
        pendingResultRef.current = { prize: "error", label: err.error || "Error", segmentIndex: 0, won: false };
        return;
      }
      pendingResultRef.current = await res.json();
    } catch {
      clearTimeout(timeoutId);
      pendingResultRef.current = { prize: "error", label: "Error de conexión — intenta de nuevo", segmentIndex: 0, won: false };
    }
  };

  const canSpin = eventActive
    ? spinsRemaining > 0 && !won
    : !spinning && countdown === null;

  return (
    <div className="space-y-6">
      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 will-change-[opacity]">
          <div className="text-center">
            {countdown > 0 ? (
              <>
                <p
                  className="text-9xl font-extrabold text-metallic-gold drop-shadow-[0_0_30px_rgba(184,134,11,0.5)]"
                  style={{ animation: "cd-pop 0.4s ease-out both" }}
                >
                  {countdown}
                </p>
                <p className="text-lg text-clash-muted mt-4 tracking-widest uppercase">Preparados...</p>
              </>
            ) : (
              <p className="text-6xl font-extrabold text-green-400 drop-shadow-[0_0_30px_rgba(74,222,128,0.5)] animate-ping">
                ¡YA!
              </p>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes cd-pop {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Event status */}
      {eventActive && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
          <p className="text-sm font-medium text-green-400">
            🎉 Evento activo — {spinsRemaining > 0 ? `Te quedan ${spinsRemaining} tiro${spinsRemaining !== 1 ? "s" : ""}` : "Ya participaste"}
          </p>
        </div>
      )}

      {/* Wheel */}
      <div className="flex flex-col items-center gap-6">
        <RuletaWheel
          spinning={spinning}
          resultIndex={currentResult?.segmentIndex ?? null}
        />

        <button
          onClick={handleSpin}
          disabled={!canSpin}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-metallic-gold text-black text-base font-bold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-metallic-gold/20"
        >
          {countdown !== null ? (
            <Loader2 size={20} className="animate-spin" />
          ) : spinning ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Gift size={20} />
          )}
          {countdown !== null ? "Preparando..." : spinning ? "Girando..." : eventActive && spinsRemaining <= 0 ? "Sin tiros" : "¡GIRAR!"}
        </button>
      </div>

      {/* Confetti overlay */}
      <Confetti active={showConfetti} />

      {/* Last result */}
      {lastResult && !spinning && countdown === null && (
        <div className={`p-6 rounded-xl text-center ${lastResult.won ? "bg-green-500/15 border-2 border-green-400/50 shadow-lg shadow-green-500/10 animate-pulse" : lastResult.prize === "error" ? "bg-red-500/10 border border-red-500/30" : "bg-glass border border-clash-border"}`}>
          {lastResult.won && <p className="text-4xl mb-2">🏆</p>}
          <p className={`text-2xl font-extrabold ${lastResult.won ? "text-green-400" : lastResult.prize === "error" ? "text-red-400" : "text-clash-text"}`}>
            {lastResult.label}
          </p>
          {lastResult.won && (
            <>
              <p className="text-clash-muted mt-3">
                Premio: <span className="text-metallic-gold font-bold text-xl">{lastResult.label}</span>
              </p>
              <p className="text-lg font-bold text-green-400 mt-3 animate-bounce drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]">
                ¡Felicidades!
              </p>
            </>
          )}
          {eventActive && lastResult.won && (
            <p className="text-sm text-clash-muted mt-2">Contacta al líder para recibir tu premio.</p>
          )}
        </div>
      )}

      {/* Rules */}
      <div className="p-4 rounded-xl bg-glass border border-clash-border">
        <h3 className="text-sm font-bold text-clash-text mb-2">📋 Instrucciones</h3>
        <ul className="space-y-1 text-xs text-clash-muted">
          {eventActive ? (
            <>
              <li>• Tienes <strong>2 tiros</strong> por evento</li>
              <li>• Si ganas un premio, quedas fuera automáticamente</li>
              <li>• Si pierdes los 2 tiros, fuera también</li>
              <li>• Máximo {3} ganadores por premio</li>
              <li>• Solo 1 Pass Royale por evento</li>
              <li>• El ganador debe contactar al líder para reclamar</li>
            </>
          ) : (
            <>
              <li>• La ruleta está en <strong>modo libre</strong> — no hay premios reales</li>
              <li>• Espera a que el líder active un evento para participar</li>
              <li>• En evento: 2 tiros por persona, premios con topes</li>
            </>
          )}
        </ul>
      </div>

      {/* Winners */}
      {winners.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-clash-text">🏆 Ganadores del evento</h3>
          <div className="grid gap-2">
            {winners.map((w) => (
              <div key={w.uid} className="flex items-center gap-3 p-3 rounded-lg bg-glass border border-clash-border">
                <div className="w-8 h-8 rounded-full bg-metallic-gold/20 flex items-center justify-center text-sm">
                  {w.displayName?.slice(0, 2).toUpperCase() || "??"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-clash-text truncate">{w.displayName}</p>
                  <p className="text-xs text-metallic-gold">{PRIZE_LABELS[w.prize] || w.prize}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
