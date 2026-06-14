"use client";

import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/metric-card";
import { TopCopas } from "@/components/dashboard/top-copas";
import { TopDonadores } from "@/components/dashboard/top-donadores";

import { ComparativaJugadores } from "@/components/dashboard/comparativa-jugadores";
import { RendimientoSemanal } from "@/components/dashboard/rendimiento-semanal";
import { GuerraActiva } from "@/components/dashboard/guerra-activa";
import { EvolucionClan } from "@/components/dashboard/evolucion-clan";
import { Alertas } from "@/components/dashboard/alertas";
import { MiembrosRiesgo } from "@/components/dashboard/miembros-riesgo";
import { Destacados } from "@/components/dashboard/destacados";
import { LoadingProgress } from "@/components/dashboard/loading-progress";
import { useClanStore } from "@/lib/store";
import { useClanData } from "@/hooks/use-clan-data";
import { Trophy, Users, Activity, Shield, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { IdentificationBanner } from "@/components/onboarding/identification-banner";
import { barContainerStyle, barTrackStyle, barFillStyle } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

/** Formatea milisegundos a texto legible ("hace 5 min", "hace 1 hora", etc.) */
function formatAge(ms: number | null): string {
  if (ms === null) return "";
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return "hace unos segundos";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export function DashboardGrid() {
  const { loading, error, fromCache, refetch } = useClanData();
  const clan = useClanStore((s) => s.clan);
  const members = useClanStore((s) => s.members);
  const loaded = useClanStore((s) => s.loaded);
  const cacheAge = useClanStore((s) => s.cacheAge);
  const { isMock } = useAuth();
  const loadingToastRef = useRef<string | number | null>(null);
  const wasLoadingRef = useRef(false);
  const cacheShownRef = useRef(false);

  useEffect(() => {
    if (fromCache && cacheAge !== null && !cacheShownRef.current) {
      cacheShownRef.current = true;
      toast.info(`Mostrando datos cacheados (${formatAge(cacheAge)})`, {
        duration: 3000,
        icon: "📦",
      });
    }
  }, [fromCache, cacheAge]);

  useEffect(() => {
    if (loading && !wasLoadingRef.current) {
      wasLoadingRef.current = true;
      loadingToastRef.current = toast.loading("Actualizando datos...");
    } else if (!loading && wasLoadingRef.current) {
      wasLoadingRef.current = false;
      if (loadingToastRef.current) {
        toast.dismiss(loadingToastRef.current);
        loadingToastRef.current = null;
      }
      if (!error) {
        toast.success("Datos actualizados", { duration: 2000 });
      }
    }
  }, [loading, error]);

  const activeMembers = members.filter((m) => m.status === "active").length;
  const avgTrophies = members.length > 0
    ? Math.round(members.reduce((acc, m) => acc + m.trophies, 0) / members.length)
    : 0;

  useEffect(() => {
    if (error && loaded) {
      toast.error(error, { duration: 4000 });
    }
  }, [error, loaded]);

  // Error sin datos previos — pantalla de error completa
  if (error && !loaded) {
    return <LoadingProgress onRetry={refetch} />;
  }

  // Sin datos cargados (ni de caché ni de API) — pantalla de progreso
  if (!loaded) {
    return <LoadingProgress onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <IdentificationBanner />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-xl">Dashboard</h1>
          <p className="text-sm text-clash-muted mt-0.5">
            Centro de control • {clan.name}
          </p>
          <p className="text-xs text-clash-dimmed mt-1">
            Monitorea el rendimiento, actividad y logros de tu clan en tiempo real
          </p>
        </div>
        <div className="flex items-center">
          <button
            onClick={refetch}
            disabled={loading}
            className="p-2 rounded-lg bg-glass-card border border-clash-border text-clash-text hover:text-metallic-gold transition-colors disabled:opacity-50"
            title="Actualizar datos"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trophy size={14} className="text-clash-muted" />
                <span className="text-xs text-clash-muted">Total Copas</span>
              </div>
              <span className="text-lg font-bold font-mono text-clash-text">
                {clan.stats.clanScore.toLocaleString()}
              </span>
              <p className="text-[10px] text-clash-dimmed mt-0.5">
                Promedio: {avgTrophies.toLocaleString()}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users size={14} className="text-clash-muted" />
                <span className="text-xs text-clash-muted">Miembros</span>
              </div>
              <span className="text-lg font-bold font-mono text-clash-text">
                {members.length}
              </span>
              <p className="text-[10px] text-clash-dimmed mt-0.5">
                {activeMembers} activos
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield size={14} className="text-clash-muted" />
                <span className="text-xs text-clash-muted">Trofeos Guerra</span>
              </div>
              <span className="text-lg font-bold font-mono text-clash-text">
                {clan.stats.clanWarTrophies.toLocaleString()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity size={14} className="text-clash-muted" />
                <span className="text-xs text-clash-muted">Salud del Clan</span>
              </div>
              <span className="text-lg font-bold font-mono text-clash-text">
                {clan.healthScore}%
              </span>
              <div className="mt-1" style={{ ...barContainerStyle, height: "6px" }}>
                <div style={barTrackStyle} />
                <div style={barFillStyle(clan.healthScore)} />
              </div>
              <p className="text-[10px] text-clash-dimmed mt-1">
                {clan.healthScore >= 80 ? "Excelente" : clan.healthScore >= 60 ? "Buena" : "Regular"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TopCopas />
        <MiembrosRiesgo />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TopDonadores />
        <ComparativaJugadores />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RendimientoSemanal />
        <GuerraActiva />
      </div>

      <EvolucionClan />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Alertas />
        </div>
        <Destacados />
      </div>

      <footer className="text-center pt-6 pb-4 border-t border-clash-border">
        <p className="text-xs text-clash-dimmed font-mono">
          V.1.0 - 2026 &nbsp;&nbsp;&nbsp;&nbsp; "By Nandox64"
        </p>
      </footer>
    </div>
  );
}


