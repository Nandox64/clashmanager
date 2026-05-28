"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { MetricCard } from "@/components/shared/metric-card";
import { useClanStore } from "@/lib/store";
import { useClanData } from "@/hooks/use-clan-data";
import { mockWeeklyStats, mockWars } from "@/lib/mock-data";
import { BarChart3, Radar, RefreshCw } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function AnalyticsPage() {
  const { loading, error, refetch } = useClanData();
  const members = useClanStore((s) => s.members);
  const loaded = useClanStore((s) => s.loaded);
  const weeklyStats = mockWeeklyStats;
  const lastWar = mockWars[mockWars.length - 1];

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
          <img src="/carga4.gif" alt="Cargando..." className="w-24 h-24 mx-auto" />
          <p className="text-sm text-clash-muted">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  const sortedByEffort = [...members].sort(
    (a, b) =>
      b.weeklyStats.trophiesGained +
      b.weeklyStats.donationsGiven / 10 +
      b.weeklyStats.warParticipation -
      (a.weeklyStats.trophiesGained +
        a.weeklyStats.donationsGiven / 10 +
        a.weeklyStats.warParticipation)
  );

  const topEffort = sortedByEffort.slice(0, 3);
  const lowEffort = sortedByEffort.slice(-3).reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-clash-text">Estadísticas</h1>
        <p className="text-sm text-clash-muted mt-0.5">
          Analytics y rendimiento del clan
        </p>
      </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
         <MetricCard
           title="Promedio Semanal"
           value={`+${formatNumber(weeklyStats[weeklyStats.length - 1].totalTrophies - weeklyStats[0].totalTrophies)}`}
           subtitle="Crecimiento total"
           trend="up"
           trendValue="+4.2%"
           icon={<BarChart3 size={16} className="text-metallic-gold animate-icon-shine" />}
         />
         <MetricCard
           title="Donaciones Totales"
           value={formatNumber(
             weeklyStats.reduce((a, s) => a + s.totalDonations, 0)
           )}
           subtitle="Últimas 8 semanas"
           trend="up"
           trendValue="+12%"
         />
         <MetricCard
           title="Participación Guerra"
           value={`${Math.round((lastWar.battlesPlayed / (lastWar.participants * 4)) * 100)}%`}
           subtitle="Última guerra"
           trend="up"
           trendValue="+5%"
         />
         <MetricCard
           title="Mejor Semana"
           value={formatNumber(
             Math.max(...weeklyStats.map((s) => s.totalTrophies))
           )}
           subtitle="Máximo histórico"
         />
       </div>

       {/* Weekly trend chart */}
       <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-metallic-gold bg-clip-text">Progreso Semanal</CardTitle>
              <p className="text-xs text-clash-muted mt-0.5">Evolución de trofeos y donaciones por semana</p>
            </div>
          </CardHeader>
         <div className="h-48 flex gap-2">
           {weeklyStats.map((week, i) => {
             const max = Math.max(...weeklyStats.map((s) => s.totalTrophies));
             const min = Math.min(...weeklyStats.map((s) => s.totalTrophies));
             const range = max - min || 1;
             const trophyPct = (week.totalTrophies - min) / range;
             const donationPct =
               week.totalDonations /
               Math.max(...weeklyStats.map((s) => s.totalDonations));

             return (
               <div key={week.id} className="flex-1 h-full flex flex-col items-center justify-end gap-1">
                 <div className="w-full flex-1 flex flex-col justify-end gap-0.5">
                   <div
                     className={`w-full rounded-t-sm transition-all ${
                       i === weeklyStats.length - 1
                         ? "bg-metallic-gold animate-metallic-shimmer"
                         : "bg-gradient-to-t from-green-500/40 to-green-500/70"
                     }`}
                     style={{ flex: trophyPct * 0.5 }}
                   />
                   <div
                     className="w-full rounded-t-sm bg-gradient-to-t from-clash-secondary/40 to-clash-secondary/70 transition-all"
                     style={{ flex: donationPct * 0.5 }}
                   />
                 </div>
                 <span className="text-[10px] text-clash-muted font-mono">
                   S{i + 1}
                 </span>
               </div>
             );
           })}
         </div>
         <div className="flex items-center gap-4 mt-3 text-xs text-clash-muted">
           <div className="flex items-center gap-1.5">
             <div className="w-3 h-3 rounded-sm bg-gradient-to-b from-green-500/70 to-green-500/40" />
             <span>Copas</span>
           </div>
           <div className="flex items-center gap-1.5">
             <div className="w-3 h-3 rounded-sm bg-gradient-to-b from-clash-secondary/70 to-clash-secondary/40" />
             <span>Donaciones</span>
           </div>
         </div>
       </Card>

       {/* Matriz 2x2 - Rendimiento vs Actividad */}
       <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-metallic-gold bg-clip-text">Matriz Rendimiento vs Actividad</CardTitle>
              <p className="text-xs text-clash-muted mt-0.5">Clasifica miembros en estrellas, talento dormido, trabajadores y lastre</p>
            </div>
            <Radar size={16} className="text-metallic-gold animate-icon-shine" />
          </CardHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-green-400 flex items-center gap-1">
                ★ Estrellas
              </h4>
              {members
                .filter(
                  (m) =>
                    m.weeklyStats.trophiesGained > 150 &&
                    m.weeklyStats.activityDays >= 5
                )
                .slice(0, 3)
                .map((m) => (
                  <div
                    key={m.uid}
                    className="flex items-center gap-2 p-2 rounded bg-glass"
                  >
                    <Avatar name={m.displayName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {m.displayName}
                      </p>
                      <p className="text-[10px] text-clash-muted">
                        +{m.weeklyStats.trophiesGained} · {m.weeklyStats.activityDays}d
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-yellow-400 flex items-center gap-1">
                ⚠️ Talento Dormido
              </h4>
              {members
                .filter(
                  (m) =>
                    m.weeklyStats.trophiesGained > 150 &&
                    m.weeklyStats.activityDays < 5
                )
                .slice(0, 3)
                .map((m) => (
                  <div
                    key={m.uid}
                    className="flex items-center gap-2 p-2 rounded bg-glass"
                  >
                    <Avatar name={m.displayName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {m.displayName}
                      </p>
                      <p className="text-[10px] text-clash-muted">
                        +{m.weeklyStats.trophiesGained} · {m.weeklyStats.activityDays}d
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-blue-400 flex items-center gap-1">
                💪 Trabajadores
              </h4>
              {members
                .filter(
                  (m) =>
                    m.weeklyStats.trophiesGained <= 150 &&
                    m.weeklyStats.activityDays >= 5
                )
                .slice(0, 3)
                .map((m) => (
                  <div
                    key={m.uid}
                    className="flex items-center gap-2 p-2 rounded bg-glass"
                  >
                    <Avatar name={m.displayName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {m.displayName}
                      </p>
                      <p className="text-[10px] text-clash-muted">
                        +{m.weeklyStats.trophiesGained} · {m.weeklyStats.activityDays}d
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-red-400 flex items-center gap-1">
                ❌ Lastre
              </h4>
              {members
                .filter(
                  (m) =>
                    m.weeklyStats.trophiesGained <= 150 &&
                    m.weeklyStats.activityDays < 5
                )
                .slice(0, 3)
                .map((m) => (
                  <div
                    key={m.uid}
                    className="flex items-center gap-2 p-2 rounded bg-glass"
                  >
                    <Avatar name={m.displayName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {m.displayName}
                      </p>
                      <p className="text-[10px] text-clash-muted">
                        +{m.weeklyStats.trophiesGained} · {m.weeklyStats.activityDays}d
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Card>

       {/* Comparativa de jugadores */}
       <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-metallic-gold bg-clip-text">Comparativa de Jugadores</CardTitle>
              <p className="text-xs text-clash-muted mt-0.5">Top 3 por esfuerzo combinado (copas, donaciones, guerra)</p>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {topEffort.map((member, i) => (
             <div
               key={member.uid}
               className="flex items-center gap-3 p-3 rounded-lg bg-glass"
             >
               <span className="text-sm font-bold font-mono text-metallic-gold w-6">
                 #{i + 1}
               </span>
               <Avatar name={member.displayName} size="sm" />
               <div className="flex-1 min-w-0">
                 <p className="text-sm font-medium text-clash-text">
                   {member.displayName}
                 </p>
               </div>
               <div className="flex items-center gap-4 text-xs font-mono">
                 <span className="text-green-400">+{member.weeklyStats.trophiesGained}</span>
                 <span className="text-metallic-silver">{member.weeklyStats.donationsGiven}</span>
                 <span className="text-metallic-gold">{member.weeklyStats.warParticipation}%</span>
               </div>
             </div>
           ))}
         </div>
       </Card>

       {/* Radar chart visualization */}
       <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-metallic-gold bg-clip-text">Rendimiento Individual</CardTitle>
              <p className="text-xs text-clash-muted mt-0.5">Score compuesto 0–100 de cada miembro</p>
            </div>
          </CardHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {members.slice(0, 10).map((member) => {
            const score = Math.round(
              (member.weeklyStats.trophiesGained / 300) * 30 +
                (member.weeklyStats.donationsGiven / 1000) * 25 +
                (member.weeklyStats.warParticipation / 100) * 25 +
                (member.weeklyStats.activityDays / 7) * 20
            );
            return (
              <div key={member.uid} className="text-center p-3 rounded-lg bg-glass">
                <Avatar name={member.displayName} size="md" className="mx-auto mb-2" />
                <p className="text-xs font-medium truncate text-clash-text">
                  {member.displayName}
                </p>
                <div className="mt-2 w-full bg-glass rounded-full h-1.5">
                  <div
                    className={`h-full rounded-full transition-all ${
                      score >= 80
                        ? "bg-green-500"
                        : score >= 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <p className="text-[10px] font-mono text-clash-muted mt-1">
                  {score}/100
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
