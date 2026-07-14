"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useClanStore } from "@/lib/store";
import { TrendingUp, Trophy, Gift } from "lucide-react";

export function RendimientoSemanal() {
  const members = useClanStore((s) => s.members);
  const totalTrophiesGained = members.reduce(
    (acc, m) => acc + m.weeklyStats.trophiesGained,
    0
  );
  const totalDonations = members.reduce(
    (acc, m) => acc + m.donations,
    0
  );
  const activeMembers = members.filter((m) => m.status === "active").length;

  const metrics = [
    {
      label: "Copas ganadas",
      value: `+${totalTrophiesGained.toLocaleString()}`,
      color: "text-metallic-gold",
      icon: <Trophy size={16} className="text-metallic-gold animate-icon-shine" />,
    },
    {
      label: "Donaciones",
      value: totalDonations.toLocaleString(),
      color: "text-metallic-silver",
      icon: <Gift size={16} className="text-metallic-silver animate-icon-shine" />,
    },
    {
      label: "Miembros activos",
      value: `${activeMembers}/${members.length}`,
      color: "text-clash-success",
      icon: <TrendingUp size={16} className="text-clash-success" />,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="text-metallic-gold bg-clip-text">Rendimiento Semanal</CardTitle>
          <p className="text-xs text-clash-muted mt-0.5">Copas ganadas, donaciones y miembros activos</p>
        </div>
        <TrendingUp size={16} className="text-clash-success" />
      </CardHeader>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="text-center">
            <div className="flex items-center justify-center mb-2">
              {metric.icon}
            </div>
            <p className="text-lg font-bold font-mono text-metallic-gold animate-metallic-shimmer">
              {metric.value}
            </p>
            <p className="text-xs text-clash-muted mt-0.5">{metric.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <p className="text-[10px] text-clash-muted mb-2">Distribución de actividad</p>
        <div className="flex gap-1">
          {["active", "risk", "inactive"].map((status) => {
            const count = members.filter((m) => m.status === status).length;
            const pct = members.length > 0 ? (count / members.length) * 100 : 0;
            const colors: Record<string, string> = {
              active: "bg-clash-success",
              risk: "bg-yellow-500",
              inactive: "bg-clash-error",
            };
            const labels: Record<string, string> = {
              active: "Activos",
              risk: "En riesgo",
              inactive: "Inactivos",
            };
            return (
              <div key={status} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-sm ${colors[status]}`}
                  style={{ height: `${Math.max(pct, 4)}%` }}
                />
                <span className="text-[10px] font-mono text-clash-muted">{count}</span>
                <span className="text-[8px] text-clash-muted/60">{labels[status]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
