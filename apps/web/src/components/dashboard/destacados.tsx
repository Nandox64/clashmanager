"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useClanStore } from "@/lib/store";
import { Star } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export function Destacados() {
  const members = useClanStore((s) => s.members);
  const sorted = [...members].sort(
    (a, b) => b.weeklyStats.trophiesGained - a.weeklyStats.trophiesGained
  );
  const topGainers = sorted.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Jugadores Destacados ⭐</CardTitle>
          <p className="text-xs text-clash-muted mt-0.5">Mejor rendimiento de la semana</p>
        </div>
        <Star size={16} className="text-clash-gold" />
      </CardHeader>
      <div className="space-y-3">
        {topGainers.map((member, i) => {
          const badges = [];
          if (member.weeklyStats.trophiesGained > 200) badges.push("🚀");
          if (member.weeklyStats.donationsGiven > 500) badges.push("🏅");
          if (member.weeklyStats.warParticipation === 100) badges.push("⚔️");

          return (
            <div
              key={member.uid}
              className="flex items-center gap-3 p-2 rounded-lg bg-glass"
            >
              <Avatar name={member.displayName} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-clash-text truncate">
                    {member.displayName}
                  </p>
                  <span className="text-xs">{badges.join(" ")}</span>
                </div>
                <p className="text-xs text-clash-muted">
                  +{member.weeklyStats.trophiesGained} copas ·{" "}
                  {member.weeklyStats.donationsGiven} donaciones
                </p>
              </div>
              <span className="text-xs font-mono text-green-400">
                +{formatNumber(member.weeklyStats.trophiesGained)}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
