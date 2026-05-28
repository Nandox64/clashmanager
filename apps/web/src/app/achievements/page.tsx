"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useClanStore } from "@/lib/store";
import { useClanData } from "@/hooks/use-clan-data";
import { MEDALS } from "@clashmanager/shared";
import { Award, Trophy, RefreshCw } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function AchievementsPage() {
  const { loading, error, refetch } = useClanData();
  const members = useClanStore((s) => s.members);
  const achievements = useClanStore((s) => s.achievements);
  const loaded = useClanStore((s) => s.loaded);

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
          <p className="text-sm text-clash-muted">Cargando logros...</p>
        </div>
      </div>
    );
  }

  const sortedByXp = [...members].sort((a, b) => b.xp - a.xp);

  const memberMedals = members.map((m) => ({
    member: m,
    medals: achievements.filter((a) => a.memberId === m.uid),
  })).filter((m) => m.medals.length > 0);

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-xl font-bold text-metallic-gold bg-clip-text">Logros y Medallas</h1>
           <p className="text-sm text-clash-muted mt-0.5">
             Sistema de gamificación del clan
           </p>
         </div>
         <button onClick={refetch} disabled={loading}>
           <RefreshCw size={16} className={`text-clash-muted hover:text-clash-text transition-colors ${loading ? "animate-spin" : ""}`} />
         </button>
       </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sortedByXp.slice(0, 4).map((member, i) => (
          <Card key={member.uid}>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold font-mono text-clash-gold">
                #{i + 1}
              </span>
              <Avatar name={member.displayName} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-clash-text truncate">
                  {member.displayName}
                </p>
                <p className="text-xs text-clash-muted font-mono">
                  {formatNumber(member.xp)} XP
                </p>
              </div>
              <Trophy
                size={16}
                className={
                  i === 0
                    ? "text-clash-gold"
                    : i === 1
                      ? "text-clash-muted"
                      : i === 2
                        ? "text-orange-400"
                        : "text-clash-muted"
                }
              />
            </div>
          </Card>
        ))}
      </div>

      {memberMedals.length > 0 && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Medallas por Miembro</CardTitle>
              <p className="text-xs text-clash-muted mt-0.5">Miembros que han obtenido medallas</p>
            </div>
            <Award size={16} className="text-clash-gold" />
          </CardHeader>
          <div className="space-y-2">
            {memberMedals.map(({ member, medals }) => (
              <div
                key={member.uid}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-glass transition-colors"
              >
                <Avatar name={member.displayName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-clash-text">
                    {member.displayName}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {medals.map((m) => (
                      <span key={m.id} title={m.name} className="text-lg">
                        {m.icon}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-clash-muted">{medals.length} medalla(s)</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Medallas Disponibles</CardTitle>
            <p className="text-xs text-clash-muted mt-0.5">Logros y recompensas del sistema de gamificación</p>
          </div>
          <Award size={16} className="text-clash-gold" />
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MEDALS.map((medal) => {
            const earned = achievements.filter(
              (a) => a.type === medal.id
            ).length;
            return (
              <div
                key={medal.id}
                className="p-3 rounded-lg bg-glass border border-clash-border"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{medal.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-clash-text">
                      {medal.name}
                    </p>
                    <p className="text-[10px] text-clash-muted">
                      {earned} obtenida(s)
                    </p>
                  </div>
                </div>
                <p className="text-xs text-clash-muted">{medal.requirement}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {achievements.length > 0 && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Logros Recientes</CardTitle>
              <p className="text-xs text-clash-muted mt-0.5">Últimos logros obtenidos por los miembros</p>
            </div>
          </CardHeader>
          <div className="space-y-2">
            {achievements.slice().reverse().slice(0, 20).map((ach) => {
              const member = members.find((m) => m.uid === ach.memberId);
              if (!member) return null;
              return (
                <div
                  key={ach.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-glass transition-colors"
                >
                  <span className="text-xl">{ach.icon}</span>
                  <Avatar name={member.displayName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-clash-text">
                      {member.displayName}
                    </p>
                    <p className="text-xs text-clash-muted">{ach.name}</p>
                  </div>
                  <Badge variant="success" size="sm">
                    Nuevo
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {achievements.length === 0 && (
        <Card>
          <div className="text-center py-10">
            <Award size={32} className="mx-auto text-clash-muted mb-3" />
            <p className="text-sm text-clash-muted">Nadie ha obtenido medallas aún</p>
            <p className="text-xs text-clash-muted/60 mt-1">
              Las medallas se otorgan automáticamente al sincronizar según el rendimiento semanal
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
