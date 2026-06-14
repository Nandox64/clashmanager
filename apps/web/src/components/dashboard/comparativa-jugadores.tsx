"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useClanStore } from "@/lib/store";
import { formatNumber } from "@/lib/utils";
import { Trophy } from "lucide-react";

const effortScore = (m: { trophies: number; donations: number; weeklyStats?: { warParticipation: number; activityDays: number } }) =>
  m.trophies / 20 +
  m.donations / 10 +
  (m.weeklyStats?.warParticipation ?? 0) +
  (m.weeklyStats?.activityDays ?? 0) * 50;

export function ComparativaJugadores() {
  const members = useClanStore((s) => s.members);
  const topEffort = [...members].sort((a, b) => effortScore(b) - effortScore(a)).slice(0, 3);

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div>
          <CardTitle className="text-metallic-gold bg-clip-text">Comparativa de Jugadores</CardTitle>
          <p className="text-xs text-clash-muted mt-0.5">Top 3 por esfuerzo combinado (copas, donaciones, guerra)</p>
        </div>
        <Trophy size={16} className="text-metallic-gold animate-icon-shine" />
      </CardHeader>
      <img
        src="/duende.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none"
      />
      <div className="relative z-10 space-y-3">
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
              <p className="text-sm font-medium text-clash-text truncate">
                {member.displayName}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-green-400">🏆{formatNumber(member.trophies)}</span>
              <span className="text-metallic-silver">📦{formatNumber(member.donations)}</span>
              <span className="text-metallic-gold">{member.weeklyStats?.warParticipation ?? 0}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
