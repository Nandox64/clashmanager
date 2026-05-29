"use client";

import { MetricCard } from "@/components/shared/metric-card";
import { TopCopas } from "@/components/dashboard/top-copas";
import { TopDonadores } from "@/components/dashboard/top-donadores";
import { Inactivos } from "@/components/dashboard/inactivos";
import { RendimientoSemanal } from "@/components/dashboard/rendimiento-semanal";
import { GuerraActiva } from "@/components/dashboard/guerra-activa";
import { EvolucionClan } from "@/components/dashboard/evolucion-clan";
import { Alertas } from "@/components/dashboard/alertas";
import { MiembrosRiesgo } from "@/components/dashboard/miembros-riesgo";
import { Destacados } from "@/components/dashboard/destacados";
import { useClanStore } from "@/lib/store";
import { useClanData } from "@/hooks/use-clan-data";
import { Trophy, Users, Activity, Shield, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function DashboardGrid() {
  const { loading, error, refetch } = useClanData();
  const clan = useClanStore((s) => s.clan);
  const members = useClanStore((s) => s.members);
  const loaded = useClanStore((s) => s.loaded);
  const { isMock } = useAuth();

  const activeMembers = members.filter((m) => m.status === "active").length;
  const avgTrophies = members.length > 0
    ? Math.round(members.reduce((acc, m) => acc + m.trophies, 0) / members.length)
    : 0;

   if (error && !loaded) {
     return (
       <div className="flex items-center justify-center h-64">
         <div className="text-center space-y-3">
           <p className="text-sm text-clash-error">{error}</p>
           <button
             onClick={refetch}
             disabled={loading}
             className="px-3 py-1.5 rounded-lg bg-metallic-gold animate-metallic-shimmer text-black border border-clash-border text-xs font-medium hover:brightness-110 disabled:opacity-50"
           >
             Reintentar
           </button>
         </div>
       </div>
     );
   }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <img src="/carga4.gif" alt="Cargando..." className="w-24 h-24 mx-auto animate-loading-delay" />
          <p className="text-sm text-clash-muted">Cargando datos del clan...</p>
        </div>
      </div>
    );
  }

   if (error) {
     return (
       <div className="flex items-center justify-center h-64">
         <div className="text-center space-y-3">
           <p className="text-sm text-clash-error">{error}</p>
           <button
             onClick={refetch}
             disabled={loading}
             className="px-3 py-1.5 rounded-lg bg-metallic-gold animate-metallic-shimmer text-black border border-clash-border text-xs font-medium hover:brightness-110 disabled:opacity-50"
           >
             Reintentar
           </button>
         </div>
       </div>
     );
   }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-clash-text">Dashboard</h1>
          <p className="text-sm text-clash-muted mt-0.5">
            Centro de control • {clan.name}
          </p>
          <p className="text-xs text-clash-muted/60 mt-1">
            Monitorea el rendimiento, actividad y logros de tu clan en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <span className="text-xs text-clash-muted animate-pulse">
              Actualizando...
            </span>
          )}
          <button
            onClick={refetch}
            disabled={loading}
            className="p-2 rounded-lg bg-glass-card border border-clash-border text-clash-muted hover:text-clash-text transition-colors disabled:opacity-50"
            title="Actualizar datos"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          title="Total Copas"
          value={clan.stats.clanScore.toLocaleString()}
          subtitle={`Promedio: ${avgTrophies.toLocaleString()}`}
          trend="up"
          trendValue="+2.1%"
          icon={<Trophy size={16} />}
        />
        <MetricCard
          title="Miembros"
          value={`${members.length}`}
          subtitle={`${activeMembers} activos`}
          trend="up"
          trendValue="+2"
          icon={<Users size={16} />}
        />
        <MetricCard
          title="Trofeos Guerra"
          value={clan.stats.clanWarTrophies.toLocaleString()}
          trend="up"
          trendValue="+120"
          icon={<Shield size={16} />}
        />
        <MetricCard
          title="Salud del Clan"
          value={`${clan.healthScore}%`}
          subtitle={
            clan.healthScore >= 80
              ? "Excelente"
              : clan.healthScore >= 60
                ? "Buena"
                : "Regular"
          }
          trend={
            clan.healthScore >= 80
              ? "up"
              : clan.healthScore >= 60
                ? "neutral"
                : "down"
          }
          trendValue={
            clan.healthScore >= 80
              ? "Óptimo"
              : clan.healthScore >= 60
                ? "Estable"
                : "Crítico"
          }
          icon={<Activity size={16} />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TopCopas />
        <TopDonadores />
        <Inactivos />
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
        <MiembrosRiesgo />
      </div>

      <Destacados />
    </div>
  );
}
