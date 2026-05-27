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
    (acc, m) => acc + m.weeklyStats.donationsGiven,
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
        <CardTitle className="text-metallic-gold bg-clip-text">Rendimiento Semanal</CardTitle>
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
      <div className="mt-4 h-16 flex items-end gap-1">
        {Array.from({ length: 7 }).map((_, i) => {
          const height = 20 + Math.floor(Math.random() * 60);
          return (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-metallic-gold animate-metallic-shimmer"
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>
    </Card>
  );
}
