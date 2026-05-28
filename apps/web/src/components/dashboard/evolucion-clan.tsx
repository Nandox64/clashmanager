"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { mockWeeklyStats } from "@/lib/mock-data";
import { TrendingUp } from "lucide-react";

export function EvolucionClan() {
  const stats = mockWeeklyStats;
  const maxTrophies = Math.max(...stats.map((s) => s.totalTrophies));

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="text-metallic-gold bg-clip-text">Evolución del Clan (8 semanas)</CardTitle>
          <p className="text-xs text-clash-muted mt-0.5">Progreso de copas totales semana a semana</p>
        </div>
        <TrendingUp size={16} className="text-metallic-silver animate-icon-shine" />
      </CardHeader>
      <div className="h-40 flex gap-2">
        {stats.map((week, i) => {
          const flexValue = week.totalTrophies / maxTrophies;
          const isLatest = i === stats.length - 1;
          return (
            <div key={week.id} className="flex-1 h-full flex flex-col items-center justify-end gap-1">
              <div
                className={`w-full rounded-t-sm transition-all duration-500 ${
                  isLatest
                    ? "bg-metallic-gold animate-metallic-shimmer"
                    : "bg-metallic-gold opacity-40"
                }`}
                style={{ flex: flexValue }}
              />
              <span className="text-[10px] font-mono text-clash-muted">
                {(week.totalTrophies / 1000).toFixed(1)}k
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
