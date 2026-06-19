"use client";

import { useClanStore } from "@/lib/store";
import type { ProgressPhase } from "@/lib/store";
import { RefreshCw, Wifi, Database, CheckCircle, AlertTriangle, HardDrive } from "lucide-react";

const phaseConfig: Record<ProgressPhase, {
  message: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  animate?: boolean;
}> = {
  idle: {
    message: "Iniciando…",
    icon: HardDrive,
    color: "text-clash-muted",
  },
  "checking-cache": {
    message: "Verificando caché local…",
    icon: Database,
    color: "text-blue-400",
    animate: true,
  },
  "loading-api": {
    message: "Conectando con el servidor…",
    icon: Wifi,
    color: "text-amber-400",
    animate: true,
  },
  syncing: {
    message: "Sincronizando con Clash Royale API…",
    icon: RefreshCw,
    color: "text-clash-primary",
    animate: true,
  },
  ready: {
    message: "¡Datos listos!",
    icon: CheckCircle,
    color: "text-clash-success",
  },
  error: {
    message: "Error al cargar datos",
    icon: AlertTriangle,
    color: "text-clash-error",
  },
};

/**
 * Porcentaje visual de progreso según la fase.
 * No es exacto, pero da feedback psicológico útil.
 */
function phaseProgress(phase: ProgressPhase): number {
  switch (phase) {
    case "idle": return 0;
    case "checking-cache": return 15;
    case "loading-api": return 40;
    case "syncing": return 70;
    case "ready": return 100;
    case "error": return 100;
    default: return 0;
  }
}

interface LoadingProgressProps {
  /** Callback para reintentar tras un error */
  onRetry?: () => void;
}

export function LoadingProgress({ onRetry }: LoadingProgressProps) {
  const progressPhase = useClanStore((s) => s.progressPhase);
  const error = useClanStore((s) => s.error);
  const loading = useClanStore((s) => s.loading);

  const config = phaseConfig[progressPhase] || phaseConfig.idle;
  const Icon = config.icon;
  const progress = phaseProgress(progressPhase);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-5 max-w-xs w-full px-4">
        {/* GIF de carga (mantener el original para consistencia) */}
        <img
          src="/carga4.gif"
          alt="Cargando..."
          className="w-28 h-28 animate-loading-delay"
        />

        {/* Indicador de fase con icono */}
        <div className="flex items-center gap-2.5">
          <Icon
            size={18}
            className={`${config.color} ${config.animate ? "animate-pulse" : ""}`}
          />
          <span className={`text-sm font-medium ${config.color}`}>
            {progressPhase === "error" && error ? error : config.message}
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="w-full h-1.5 rounded-full bg-clash-border/40 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              progressPhase === "error"
                ? "bg-clash-error"
                : "bg-gradient-to-r from-clash-gold-dark via-clash-primary to-clash-gold"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Botón reintentar en estado error */}
        {progressPhase === "error" && onRetry && (
          <button
            onClick={onRetry}
            disabled={loading}
            className="mt-2 px-4 py-2 rounded-lg bg-metallic-gold animate-metallic-shimmer text-black border border-clash-border text-xs font-semibold hover:brightness-110 disabled:opacity-50 transition-all"
          >
            Reintentar
          </button>
        )}

        {/* Texto secundario por fase */}
        {progressPhase === "syncing" && (
          <p className="text-[11px] text-clash-muted/60 text-center">
            Guardando datos en el servidor — primera carga más lenta
          </p>
        )}
        {progressPhase === "loading-api" && (
          <p className="text-[11px] text-clash-muted/60 text-center">
            Esto puede tardar unos segundos la primera vez
          </p>
        )}
      </div>
    </div>
  );
}
