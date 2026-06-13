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
        className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none -z-10"
      />
      <div className="relative z-10 space-y-2">
        {top.map((member, i) => (
          <div
            key={member.uid}
            className="flex items-center gap-3 p-2 rounded-lg bg-glass hover:bg-glass/80 transition-colors"
          >
            <span className="w-5 text-center text-sm font-bold font-mono text-clash-muted">
              {i + 1}
            </span>
            <Avatar name={member.displayName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-clash-text">
                {member.displayName}
              </p>
            </div>
            <span className="font-mono text-sm font-semibold text-metallic-silver animate-metallic-shimmer">
              {member.weeklyStats.donationsGiven}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
