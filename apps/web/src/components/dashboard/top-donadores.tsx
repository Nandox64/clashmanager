"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useClanStore } from "@/lib/store";
import { Gift } from "lucide-react";

export function TopDonadores() {
  const members = useClanStore((s) => s.members);
  const top = [...members]
    .sort((a, b) => b.weeklyStats.donationsGiven - a.weeklyStats.donationsGiven)
    .slice(0, 5);

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div>
          <CardTitle className="text-metallic-gold bg-clip-text">Top Donadores Semanal</CardTitle>
          <p className="text-xs text-clash-muted mt-0.5">Jugadores con más donaciones de la semana</p>
        </div>
        <Gift size={16} className="text-metallic-silver animate-icon-shine" />
      </CardHeader>
      <img
        src="/cofre1.png"
        alt=""
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-45 object-cover opacity-65 pointer-events-none"
      />
      <div className="relative z-10 space-y-2">
        {top.map((member, i) => (
          <div
            key={member.uid}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-glass/30 transition-colors"
          >
            <span className="w-5 text-center text-sm font-bold font-mono text-clash-muted drop-shadow-sm">
              {i + 1}
            </span>
            <Avatar name={member.displayName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-clash-text drop-shadow-sm">
                {member.displayName}
              </p>
            </div>
            <span className="font-mono text-sm font-semibold text-metallic-silver animate-metallic-shimmer drop-shadow-sm">
              {member.weeklyStats.donationsGiven}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
