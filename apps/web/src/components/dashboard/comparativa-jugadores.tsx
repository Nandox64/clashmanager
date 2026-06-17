"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
        src="/wing.png"
        alt=""
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-52 object-cover opacity-65 pointer-events-none"
      />
      <div className="relative z-10 space-y-3">
        {topEffort.map((member, i) => (
          <div
            key={member.uid}
            className="flex items-center gap-2 p-3 rounded-lg hover:bg-glass/30 transition-colors"
          >
            <span className="text-sm font-bold font-mono text-metallic-gold w-5 shrink-0 drop-shadow-sm">
              #{i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-clash-text drop-shadow-sm">
                {member.displayName}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono shrink-0 flex-wrap justify-end">
              <span className="text-green-400 drop-shadow-sm whitespace-nowrap">🏆{formatNumber(member.trophies)}</span>
              <span className="text-metallic-silver drop-shadow-sm whitespace-nowrap">📦{formatNumber(member.donations)}</span>
              <span className="text-metallic-gold drop-shadow-sm whitespace-nowrap">{member.weeklyStats?.warParticipation ?? 0}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
