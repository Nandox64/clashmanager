"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useClanStore } from "@/lib/store";
import { Swords, Trophy, Users, Activity, MapPin, TrendingUp, TrendingDown, HelpCircle } from "lucide-react";

export function GuerraActiva() {
  const clan = useClanStore((s) => s.clan);
  const localWarRank = useClanStore((s) => s.localWarRank);
  const localWarRankChange = useClanStore((s) => s.localWarRankChange);
  const warRankConfidence = useClanStore((s) => s.warRankConfidence);
  const warRankMethod = useClanStore((s) => s.warRankMethod);
  const warRankNewEntries = useClanStore((s) => s.warRankNewEntries);
  const members = useClanStore((s) => s.members);

  const activeMembers = members.filter((m) => m.status === "active").length;
  const participation = members.length > 0
    ? Math.round((activeMembers / members.length) * 100)
    : 0;

  const confidenceIcon = warRankConfidence === "exact"
    ? null
    : warRankConfidence === "estimated"
      ? <HelpCircle size={12} className="text-clash-muted" />
      : warRankConfidence === "seed"
        ? null
        : null;

  const confidenceLabel = warRankConfidence === "exact"
    ? "Exacto"
    : warRankConfidence === "estimated"
      ? `Estimado${warRankNewEntries > 0 ? ` (${warRankNewEntries} nuevos)` : ""}`
      : warRankConfidence === "seed"
        ? null
        : "Fallback";

  return (
    <Card>
       <CardHeader>
         <div>
           <CardTitle className="text-metallic-gold bg-clip-text">Guerra de Clanes</CardTitle>
           <p className="text-xs text-clash-muted mt-0.5">Ranking local, trofeos y participación</p>
         </div>
         <Swords size={16} className="text-metallic-gold animate-icon-shine" />
       </CardHeader>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-clash-muted flex items-center gap-1.5">
            <MapPin size={14} /> Puesto Local
            {confidenceLabel && (
              <span className="text-[10px] text-clash-muted/60">({confidenceLabel})</span>
            )}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold font-mono text-clash-gold">
              {localWarRank ? `#${localWarRank}` : "—"}
              {confidenceIcon}
            </span>
            {localWarRankChange > 0 && (
              <span className="text-xs text-clash-success flex items-center gap-0.5">
                <TrendingUp size={12} />+{localWarRankChange}
              </span>
            )}
            {localWarRankChange < 0 && (
              <span className="text-xs text-clash-error flex items-center gap-0.5">
                <TrendingDown size={12} />{localWarRankChange}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-clash-muted flex items-center gap-1.5">
            <Trophy size={14} /> Trofeos Guerra
          </span>
          <span className="text-sm font-mono text-clash-text">
            {clan.stats?.clanWarTrophies?.toLocaleString() || "—"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-clash-muted flex items-center gap-1.5">
            <Users size={14} /> Miembros
          </span>
          <span className="text-sm font-mono text-clash-text">
            {activeMembers}/{members.length}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-clash-muted flex items-center gap-1.5">
            <Activity size={14} /> Participación
          </span>
          <Badge variant={participation >= 70 ? "success" : "warning"}>
            {participation}%
          </Badge>
        </div>
         <div className="w-full bg-glass rounded-full h-2 mt-1">
           <div
             className="h-full rounded-full bg-metallic-gold animate-metallic-shimmer"
             style={{ width: `${participation}%` }}
           />
         </div>
      </div>
    </Card>
  );
}
