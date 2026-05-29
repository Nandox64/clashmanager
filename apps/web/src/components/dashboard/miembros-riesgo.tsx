"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useClanStore } from "@/lib/store";
import { AlertTriangle, UserPlus } from "lucide-react";

function daysAgo(ts: number) {
  const d = Math.floor((Date.now() - ts) / 86400000);
  if (d === 0) return "hoy";
  if (d === 1) return "1 día";
  return `${d} días`;
}

export function MiembrosRiesgo() {
  const members = useClanStore((s) => s.members);
  const enRiesgo = members.filter(
    (m) => m.status === "risk" || m.status === "inactive"
  );
  const ultimosIngresos = [...members]
    .sort((a, b) => b.joinedAt - a.joinedAt)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Miembros en Riesgo</CardTitle>
          <p className="text-xs text-clash-muted mt-0.5">Jugadores que requieren atención</p>
        </div>
        <AlertTriangle size={16} className={enRiesgo.length > 0 ? "text-red-400" : "text-green-400"} />
      </CardHeader>

      {enRiesgo.length > 0 ? (
        <div className="space-y-2 mb-4">
          {enRiesgo.slice(0, 4).map((member) => (
            <div
              key={member.uid}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-glass transition-colors"
            >
              <Avatar name={member.displayName} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-clash-text truncate">
                  {member.displayName}
                </p>
                <p className="text-xs text-clash-muted">
                  Don.: {member.weeklyStats?.donationsGiven ?? 0} · Guerra:{" "}
                  {member.weeklyStats?.warParticipation ?? 0}%
                </p>
              </div>
              <Badge
                variant={
                  member.status === "inactive" ? "danger" : "warning"
                }
              >
                {member.status === "inactive" ? "Inactivo" : "Riesgo"}
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-clash-muted text-center py-6 mb-4">
          Sin miembros en riesgo
        </p>
      )}

      <div className="separator-gold mx-5" />

      <div className="mt-4">
        <div className="flex items-center gap-2 px-2 mb-2">
          <UserPlus size={14} className="text-metallic-gold" />
          <span className="text-xs font-semibold text-metallic-gold">Últimos Ingresos</span>
        </div>
        <div className="space-y-2">
          {ultimosIngresos.map((member) => (
            <div
              key={member.uid}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-glass transition-colors"
            >
              <Avatar name={member.displayName} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-clash-text truncate">
                  {member.displayName}
                </p>
                <p className="text-xs text-clash-muted">
                  🏆 {member.trophies.toLocaleString()} · hace {daysAgo(member.joinedAt)}
                </p>
              </div>
              <Badge variant="info" size="sm">Nuevo</Badge>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
