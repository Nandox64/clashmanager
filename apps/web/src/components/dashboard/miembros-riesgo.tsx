"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useClanStore } from "@/lib/store";
import { AlertTriangle } from "lucide-react";

export function MiembrosRiesgo() {
  const members = useClanStore((s) => s.members);
  const enRiesgo = members.filter(
    (m) => m.status === "risk" || m.status === "inactive"
  );

  if (enRiesgo.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Miembros en Riesgo</CardTitle>
            <p className="text-xs text-clash-muted mt-0.5">Jugadores que requieren atención</p>
          </div>
          <AlertTriangle size={16} className="text-green-400" />
        </CardHeader>
        <p className="text-sm text-clash-muted text-center py-6">
          Sin miembros en riesgo
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Miembros en Riesgo</CardTitle>
          <p className="text-xs text-clash-muted mt-0.5">Jugadores que requieren atención</p>
        </div>
        <AlertTriangle size={16} className="text-red-400" />
      </CardHeader>
      <div className="space-y-2">
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
    </Card>
  );
}
