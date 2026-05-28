"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useClanStore } from "@/lib/store";
import { MEDALS } from "@clashmanager/shared";
import { Award, Trophy } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function AchievementsPage() {
  const members = useClanStore((s) => s.members);
  const achievements = useClanStore((s) => s.achievements);

  const sortedByXp = [...members].sort((a, b) => b.xp - a.xp);

  return (
    <div className="space-y-6">
       <div>
         <h1 className="text-xl font-bold text-metallic-gold bg-clip-text">Logros y Medallas</h1>
         <p className="text-sm text-clash-muted mt-0.5">
           Sistema de gamificación del clan
         </p>
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

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Logros Recientes</CardTitle>
            <p className="text-xs text-clash-muted mt-0.5">Últimos logros obtenidos por los miembros</p>
          </div>
        </CardHeader>
        <div className="space-y-2">
          {achievements.slice().reverse().map((ach) => {
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
    </div>
  );
}
