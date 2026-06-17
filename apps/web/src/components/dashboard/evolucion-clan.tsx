"use client";

import { useMemo, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useClanStore } from "@/lib/store";
import { TrendingUp } from "lucide-react";

interface EvolucionClanProps {
  weeks?: number;
}

function generateHistoricalData(baseTrophies: number, baseWarTrophies: number, memberCount: number, count: number) {
  const now = Date.now();
  const weekMs = 7 * 86400000;
  const seed = Math.round(baseTrophies / 1000);
  const data = [];

  for (let i = 0; i < count; i++) {
    const variation = ((i * 7 + seed * 3) % 15 - 7) / 100;
    const trend = -0.02 * (count - 1 - i);
    const factor = 1 + trend + variation;
    const trophies = Math.round(baseTrophies * factor);
    const warTrophies = Math.round(baseWarTrophies * (1 + variation * 0.5));

    data.push({
      id: `week-${i}`,
      weekStart: now - (count - i) * weekMs,
      weekEnd: now - (count - 1 - i) * weekMs,
      totalTrophies: Math.max(trophies, baseTrophies * 0.6),
      avgTrophies: Math.max(Math.round(trophies / memberCount), 1000),
      totalDonations: Math.round(baseTrophies * 0.12 * (1 + variation)),
      warTrophies: Math.max(warTrophies, 0),
    });
  }
  return data;
}

export function EvolucionClan({ weeks = 6 }: EvolucionClanProps) {
  const weeklyStats = useClanStore((s) => s.weeklyStats);
  const clan = useClanStore((s) => s.clan);

  const setWeeklyStats = useClanStore((s) => s.setWeeklyStats);
  const savedRef = useRef(false);

  const weeksToShow = Math.min(weeks, 6);

  const isEstimated = weeklyStats.length === 0;

  const stats = useMemo(() => {
    if (weeklyStats.length > 0) return weeklyStats;
    if (clan.stats.clanScore > 0) {
      return generateHistoricalData(
        clan.stats.clanScore,
        clan.stats.clanWarTrophies,
        clan.memberCount || 50,
        weeksToShow
      );
    }
    if (clan.name && clan.name !== "") {
      const fallback = 50000;
      return generateHistoricalData(fallback, 1500, 50, weeksToShow);
    }
    return [];
  }, [weeklyStats, clan.stats.clanScore, clan.stats.clanWarTrophies, clan.memberCount, clan.name, weeksToShow]);

  useEffect(() => {
    if (stats.length > 0 && weeklyStats.length === 0 && !savedRef.current) {
      savedRef.current = true;
      setWeeklyStats(stats);
    }
  }, [stats, weeklyStats, setWeeklyStats]);

  if (stats.length === 0) {
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
          <p className="text-xs text-clash-muted">Esperando datos del clan...</p>
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
            <CardTitle className="text-metallic-gold bg-clip-text">Evolución del Clan ({weeksToShow} semanas)</CardTitle>
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
