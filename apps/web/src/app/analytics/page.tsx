"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { MetricCard } from "@/components/shared/metric-card";
import { ComparativaJugadores } from "@/components/dashboard/comparativa-jugadores";
import { useClanStore } from "@/lib/store";
import { useClanData } from "@/hooks/use-clan-data";
import type { Member } from "@clashmanager/shared";
import { BarChart3, Radar } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function AnalyticsPage() {
  const { loading, error, refetch } = useClanData();
  const members = useClanStore((s) => s.members);
  const loaded = useClanStore((s) => s.loaded);

  const totalDonations = members.reduce((a, m) => a + m.donations, 0);
  const avgWarParticipation = members.length > 0
    ? Math.round(members.reduce((a, m) => a + (m.weeklyStats?.warParticipation ?? 0), 0) / members.length)
    : 0;
  const currentWeekTrophies = members.reduce((a, m) => a + m.trophies, 0);
  const avgTrophies = members.length > 0
    ? Math.round(currentWeekTrophies / members.length)
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
          <img src="/carga4.gif" alt="Cargando..." className="w-32 h-32 mx-auto" />
          <p className="text-sm text-clash-muted">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 size={24} className="text-[#ffd700]" style={{ filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.5)) drop-shadow(1px 0 0 rgba(0,0,0,0.5)) drop-shadow(-1px 0 0 rgba(0,0,0,0.5)) drop-shadow(0 -1px 0 rgba(0,0,0,0.5)) drop-shadow(0 0 6px rgba(0,0,0,0.35))' }} />
          <h1 className="text-page-title text-2xl">Estadísticas</h1>
        </div>
        <p className="text-sm text-clash-muted mt-0.5">
          Analytics y rendimiento del clan
        </p>
      </div>

      <img src="/analytics.png" alt="Banner" className="w-auto max-w-full h-auto rounded-xl object-contain max-h-[200px]" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 size={14} className="text-clash-muted" />
                <span className="text-xs text-clash-muted">Copas Totales</span>
              </div>
              <span className="text-lg font-bold font-mono text-clash-text">
                {formatNumber(currentWeekTrophies)}
              </span>
              <p className="text-[10px] text-clash-dimmed mt-0.5">Todos los miembros</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 size={14} className="text-clash-muted" />
                <span className="text-xs text-clash-muted">Promedio de Copas</span>
              </div>
              <span className="text-lg font-bold font-mono text-clash-text">
                {formatNumber(avgTrophies)}
              </span>
              <p className="text-[10px] text-clash-dimmed mt-0.5">Por miembro</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 size={14} className="text-clash-muted" />
                <span className="text-xs text-clash-muted">Donaciones Totales</span>
              </div>
              <span className="text-lg font-bold font-mono text-clash-text">
                {formatNumber(totalDonations)}
              </span>
              <p className="text-[10px] text-clash-dimmed mt-0.5">Todos los miembros</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 size={14} className="text-clash-muted" />
                <span className="text-xs text-clash-muted">Participación Guerra</span>
              </div>
              <span className="text-lg font-bold font-mono text-clash-text">
                {avgWarParticipation}%
              </span>
              <p className="text-[10px] text-clash-dimmed mt-0.5">Promedio del clan</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Matriz 2x2 - Rendimiento vs Actividad */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-metallic-gold bg-clip-text">Matriz Rendimiento vs Actividad</CardTitle>
            <p className="text-xs text-clash-dimmed mt-0.5">Clasifica miembros por copas (rendimiento) y días activo (actividad)</p>
          </div>
          <Radar size={16} className="text-metallic-gold animate-icon-shine" />
        </CardHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([
              { key: "stars", label: "★ Estrellas", color: "text-green-400", filter: (m: Member) => m.trophies >= 6000 && (m.weeklyStats?.activityDays ?? 0) >= 4 },
              { key: "talento", label: "⚠️ Talento Dormido", color: "text-yellow-400", filter: (m: Member) => m.trophies >= 6000 && (m.weeklyStats?.activityDays ?? 0) < 4 },
              { key: "workers", label: "💪 Trabajadores", color: "text-blue-400", filter: (m: Member) => m.trophies < 6000 && (m.weeklyStats?.activityDays ?? 0) >= 4 },
              { key: "lastre", label: "❌ Lastre", color: "text-red-500", filter: (m: Member) => m.trophies < 6000 && (m.weeklyStats?.activityDays ?? 0) < 4 },
            ] as const).map((section) => (
              <div key={section.key} className="space-y-2">
                <h4 className={`text-xs font-semibold ${section.color} flex items-center gap-1`}>
                  {section.label}
                </h4>
                {members.filter(section.filter).slice(0, 3).map((m) => (
                  <div key={m.uid} className="flex items-center gap-2 p-2 rounded bg-glass">
                    <Avatar name={m.displayName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{m.displayName}</p>
                      <p className="text-[10px] text-clash-dimmed">
                        🏆 {formatNumber(m.trophies)} · {(m.weeklyStats?.activityDays ?? 0)}d activo
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Radar chart visualization */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-metallic-gold bg-clip-text">Rendimiento Individual</CardTitle>
            <p className="text-xs text-clash-dimmed mt-0.5">Score compuesto 0–100 de cada miembro</p>
          </div>
        </CardHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {members.slice(0, 10).map((member) => {
            const score = Math.min(100, Math.round(
              (member.trophies / 6000) * 30 +
                (member.donations / 5000) * 25 +
                ((member.weeklyStats?.warParticipation ?? 0) / 100) * 25 +
                ((member.weeklyStats?.activityDays ?? 1) / 7) * 20
            ));
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
                <p className="text-[10px] font-mono text-clash-dimmed mt-1">
                  {score}/100
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Donations leaderboard */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-metallic-gold bg-clip-text">Top Donaciones</CardTitle>
              <p className="text-xs text-clash-dimmed mt-0.5">Miembros con más donaciones</p>
            </div>
          </CardHeader>
          <div className="space-y-2">
            {[...members]
              .sort((a, b) => b.donations - a.donations)
              .slice(0, 10)
              .map((m, i) => (
                <div key={m.uid} className="flex items-center gap-3 p-2 rounded-lg bg-glass">
                  <span className="text-xs font-mono text-clash-dimmed w-4">#{i + 1}</span>
                  <span className="text-sm text-clash-text flex-1 truncate">{m.displayName}</span>
                  <span className="text-xs font-mono text-metallic-silver">{formatNumber(m.donations)}</span>
                </div>
              ))}
          </div>
        </Card>

        <ComparativaJugadores />
      </div>
    </div>
  );
}
