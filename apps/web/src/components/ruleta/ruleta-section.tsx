"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { RuletaWheel } from "./ruleta-wheel";
import { Confetti } from "./confetti";
import { playSpinTick, playWinSound, playLoseSound, playCountdownBeep } from "@/lib/ruleta-sound";
import { useAuth } from "@/contexts/AuthContext";
import { useClanStore } from "@/lib/store";
import { getCachedLinkedMemberId } from "@/lib/profile-cache";
import { Loader2, Gift, X } from "lucide-react";

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
  outOfCompetition?: boolean;
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
  const [spinTrigger, setSpinTrigger] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingResultRef = useRef<SpinResult | null>(null);

  const linkedId = getCachedLinkedMemberId();
  const linkedMember = members.find((m) => m.uid === linkedId);
  const displayName = linkedMember?.displayName || user?.displayName || "Anónimo";
  const dismissedErrorRef = useRef(false);
  const userRef = useRef(user);
  userRef.current = user;

  const fetchState = useCallback(async (retries = 1, silent = false) => {
    const currentUser = userRef.current;
    const token = await currentUser?.getIdToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : { Authorization: "Bearer mock-mode" };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch("/api/ruleta/init", { headers, signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error || "Error al cargar estado");
      }
      const data = await res.json();

      setEventActive(data.config?.eventActive ?? false);
      setSpinsRemaining(data.state?.spinsRemaining ?? -1);
      setWon(data.state?.won ?? false);
      setPrize(data.state?.prize ?? null);
      setWinners(Array.isArray(data.winners) ? data.winners : []);
      dismissedErrorRef.current = false;
    } catch (err) {
      if (retries > 0) {
        setTimeout(() => fetchState(0, silent), 2000);
      } else if (!silent && !dismissedErrorRef.current) {
        const friendly = err instanceof Error && err.name === "AbortError"
          ? "Tardó demasiado — volvé a intentar"
          : err instanceof Error ? err.message : "Error al cargar estado";
        setLastResult({ prize: "error", label: friendly, segmentIndex: 0, won: false });
      }
    }
  }, []);

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
    setSpinTrigger((t) => t + 1);
    setSpinning(true);
    setCurrentResult(result);
    setLastResult(result);
    setTimeout(() => {
      setSpinning(false);
      if (result.won) {
        playWinSound();
        setShowConfetti(true);
      } else {
        playLoseSound();
      }
      if (eventActive) {
        setSpinsRemaining((prev) => Math.max(0, prev - 1));
        if (result.won) { setWon(true); setPrize(result.prize); }
      }
      fetchState(1, true);
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
    const timeoutId = setTimeout(() => controller.abort(), 30000);

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
        setCountdown(null);
        return;
      }
      const data = await res.json();
      pendingResultRef.current = data;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === "AbortError") {
        console.warn("[Ruleta] Spin timeout (30s)");
        pendingResultRef.current = { prize: "error", label: "La ruleta tardó demasiado — intenta de nuevo", segmentIndex: 0, won: false };
      } else {
        console.error("[Ruleta] Spin exception:", err);
        pendingResultRef.current = { prize: "error", label: "Error de conexión — intenta de nuevo", segmentIndex: 0, won: false };
      }
    }
  };

  const canSpin = eventActive
    ? spinsRemaining > 0 && !won
    : !spinning && countdown === null;

  return (
    <div className="space-y-6">
      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 will-change-[opacity] overflow-y-auto">
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

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {/* Column 1: Wheel */}
        <div className="flex flex-col items-center gap-6 overflow-hidden pt-6">
          <RuletaWheel
            spinning={spinning}
            resultIndex={currentResult?.segmentIndex ?? null}
            spinTrigger={spinTrigger}
          />

          <button
            onClick={handleSpin}
            disabled={!canSpin}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#B05E0E] text-white text-base font-bold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#B05E0E]/20 relative z-10 animate-pulse-glow"
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

        {/* Column 2: Instructions + Winners */}
        <div className="p-4 rounded-xl bg-glass border border-clash-border space-y-4">
          <div>
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

          <div className="border-t border-clash-border pt-4">
            <h3 className="text-sm font-bold text-clash-text mb-2">🏆 Ganadores</h3>
            {winners.length > 0 ? (
              <div className="space-y-3">
                {winners.filter((w) => !w.outOfCompetition).length > 0 && (
                  <div className="space-y-2">
                    {winners.filter((w) => !w.outOfCompetition).map((w) => (
                      <div key={w.uid} className="flex items-center gap-3 p-3 rounded-lg bg-glass-card border border-clash-border">
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
                )}
                {winners.filter((w) => w.outOfCompetition).length > 0 && (
                  <div>
                    <p className="text-[10px] text-clash-dimmed uppercase tracking-wider mb-1.5">Fuera de concurso</p>
                    <div className="space-y-2">
                      {winners.filter((w) => w.outOfCompetition).map((w) => (
                        <div key={w.uid} className="flex items-center gap-3 p-3 rounded-lg bg-glass-card border border-clash-border">
                          <div className="w-8 h-8 rounded-full bg-metallic-gold/20 flex items-center justify-center text-sm">
                            {w.displayName?.slice(0, 2).toUpperCase() || "??"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-clash-text truncate">{w.displayName}</p>
                            <p className="text-xs text-clash-muted">{PRIZE_LABELS[w.prize] || w.prize}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-clash-muted">Sin ganadores aún</p>
            )}
          </div>
        </div>
      </div>

      {/* Last result — modal overlay */}
      {lastResult && !spinning && countdown === null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 will-change-[opacity] animate-fade-in p-4 overflow-y-auto">
          <div className={`relative w-full max-w-md aspect-[504/308] flex flex-col items-center justify-center p-5 rounded-xl text-center bg-[url('/card.png')] bg-cover bg-center bg-no-repeat overflow-hidden ${lastResult.prize === "error" ? "ring-2 ring-red-500/50" : ""}`}>
            <button
              onClick={() => { dismissedErrorRef.current = true; setLastResult(null); }}
              className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-black/10 transition-colors text-black/60 hover:text-black"
            >
              <X size={18} />
            </button>
            {lastResult.won && <p className="text-5xl mb-3 [text-shadow:_0_2px_6px_rgb(0_0_0_/_60%)]">🏆</p>}
            <p className={`text-3xl font-black [text-shadow:_0_2px_4px_rgb(0_0_0_/_70%)] ${lastResult.won ? "text-green-300" : lastResult.prize === "error" ? "text-red-300" : "text-white"}`}>
              {lastResult.label}
            </p>
            {lastResult.won && (
              <>
                <p className="text-white/90 mt-3 [text-shadow:_0_1px_3px_rgb(0_0_0_/_60%)]">
                  Premio: <span className="text-yellow-300 font-black text-xl">{lastResult.label}</span>
                </p>
                <p className="text-lg font-black text-green-300 mt-3 animate-bounce [text-shadow:_0_2px_4px_rgb(0_0_0_/_70%)]">
                  ¡Felicidades!
                </p>
              </>
            )}
            {eventActive && lastResult.won && (
              <p className="text-sm text-white/80 mt-2 [text-shadow:_0_1px_3px_rgb(0_0_0_/_60%)]">Contacta al líder para recibir tu premio.</p>
            )}
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => { dismissedErrorRef.current = true; setLastResult(null); }}
                className="px-6 py-2.5 rounded-xl bg-black/20 text-black text-sm font-bold border border-black/20 hover:bg-black/30 transition-colors"
              >
                Cerrar
              </button>
              {lastResult.prize === "error" && (
                <button
                  onClick={() => { dismissedErrorRef.current = false; setLastResult(null); setTimeout(() => fetchState(0), 300); }}
                  className="px-6 py-2.5 rounded-xl bg-metallic-gold text-black text-sm font-bold border border-yellow-400/40 hover:brightness-110 transition-colors"
                >
                  Reintentar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confetti overlay */}
      <Confetti active={showConfetti} />
    </div>
  );
}
