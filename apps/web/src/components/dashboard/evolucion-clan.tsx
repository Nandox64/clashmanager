"use client";

import { useMemo } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useClanStore } from "@/lib/store";
import { TrendingUp } from "lucide-react";

export function EvolucionClan() {
  const weeklyStats = useClanStore((s) => s.weeklyStats);
  const weeklySnapshots = useClanStore((s) => s.weeklySnapshots);

  const source = weeklySnapshots.length > 0 ? weeklySnapshots : weeklyStats;
  const isEstimated = weeklySnapshots.length === 0 && weeklyStats.length > 0;
  const isEmpty = source.length === 0;

  const stats = useMemo(() => {
    return source.slice(-6);
  }, [source]);

  if (isEmpty) {
    return (
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-metallic-gold bg-clip-text">Evolución del Clan</CardTitle>
            <p className="text-xs text-clash-muted mt-0.5">Esperando datos de sincronización...</p>
          </div>
          <TrendingUp size={16} className="text-metallic-silver animate-icon-shine" />
        </CardHeader>
        <div className="h-40 flex items-center justify-center">
          <p className="text-xs text-clash-muted">Sin historial aún</p>
        </div>
      </Card>
    );
  }

  const maxTrophies = Math.max(...stats.map((s) => s.totalTrophies));

  return (
    <Card>
      <CardHeader>
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-metallic-gold bg-clip-text">Evolución del Clan ({stats.length} semanas)</CardTitle>
            {isEstimated && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                ⚠️ Datos estimados
              </span>
            )}
          </div>
          <p className="text-xs text-clash-muted mt-0.5">Progreso de copas totales semana a semana</p>
        </div>
        <TrendingUp size={16} className="text-metallic-silver animate-icon-shine" />
      </CardHeader>
      <div className="h-40 flex gap-1 sm:gap-2 overflow-x-auto scrollbar-premium">
        {stats.map((week, i) => {
          const flexValue = week.totalTrophies / maxTrophies;
          const isLatest = i === stats.length - 1;
          return (
            <div key={week.id} className="min-w-7 sm:min-w-0 flex-1 h-full flex flex-col items-center justify-end gap-0.5 sm:gap-1">
              <div
                className={`w-full rounded-t-sm transition-all duration-500 ${
                  isLatest
                    ? "bg-metallic-gold animate-metallic-shimmer"
                    : "bg-metallic-gold opacity-40"
                }`}
                style={{ flex: flexValue }}
              />
              <span className="text-[9px] sm:text-[10px] font-mono text-clash-muted truncate max-w-full">
                {(week.totalTrophies / 1000).toFixed(1)}k
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
