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
import { LoadingProgress } from "@/components/dashboard/loading-progress";
import { useClanStore } from "@/lib/store";
import { useClanData } from "@/hooks/use-clan-data";
import { Trophy, Users, Activity, Shield, RefreshCw } from "lucide-react";

import { barContainerStyle, barTrackStyle, barFillStyle } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

function formatTimeAgo(ts: number | null): string {
  if (!ts) return "";
  const diff = Date.now() - ts;
  if (diff < 60_000) return "Ahora";
  const min = Math.floor(diff / 60_000);
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `hace ${h}h${m > 0 ? ` ${m}m` : ""}`;
}

export function DashboardGrid() {
  const { loading, error, refetch, lastFetchedAt } = useClanData();
  const clan = useClanStore((s) => s.clan);
  const members = useClanStore((s) => s.members);
  const loaded = useClanStore((s) => s.loaded);
  const wasLoadingRef = useRef(false);

  useEffect(() => {
    if (!loading && wasLoadingRef.current) {
      wasLoadingRef.current = false;
      if (!error) {
        toast.success("Datos actualizados", { duration: 2000 });
      }
    }
    if (loading) wasLoadingRef.current = true;
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

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-page-title text-2xl">Bienvenido</h1>
            <div className="flex items-center gap-2">
              {lastFetchedAt && (
                <span className="text-[11px] text-clash-dimmed font-mono whitespace-nowrap">
                  {formatTimeAgo(lastFetchedAt)}
                </span>
              )}
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
          <p className="text-sm text-clash-text mt-0.5">
            Centro de control • {clan.name}
          </p>
          <p className="text-xs text-clash-dimmed mt-1">
            Monitorea el rendimiento, actividad y logros de tu clan en tiempo real, mejora tus mazos y estrategias con nuestra IA y datos actualizados al instante.
          </p>
        </div>
      </div>

      <img src="/banner.png" alt="Banner" className="w-auto max-w-full h-auto rounded-xl object-contain max-h-[200px]" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trophy size={16} className="text-clash-muted" />
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
                {activeMembers} Activos
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
                {clan.healthScore > 0 ? `${clan.healthScore}%` : "—"}
              </span>
              <div className="mt-1" style={{ ...barContainerStyle, height: "6px" }}>
                <div style={barTrackStyle} />
                {clan.healthScore > 0 && <div style={barFillStyle(clan.healthScore)} />}
              </div>
              <p className="text-[10px] text-clash-dimmed mt-1">
                {clan.healthScore === 0
                  ? "Sin datos"
                  : clan.healthScore >= 80
                    ? "Excelente"
                    : clan.healthScore >= 60
                      ? "Buena"
                      : clan.healthScore >= 40
                        ? "Regular"
                        : "Mala"}
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

      <Alertas />

      <footer className="text-center pt-6 pb-4 border-t border-clash-border">
        <p className="text-xs text-clash-dimmed font-mono">
          V.1.0 - 2026 &nbsp;&nbsp;&nbsp;&nbsp; "By Nandox64"
        </p>
      </footer>
    </div>
  );
}


