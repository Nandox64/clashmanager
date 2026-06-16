"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useClanStore } from "@/lib/store";
import { Bell } from "lucide-react";

export function Alertas() {
  const members = useClanStore((s) => s.members);

  const inactivos = members.filter(
    (m) => m.status === "inactive"
  );

  const risk = members.filter((m) => m.status === "risk");

  const donationsValues = members
    .filter((m) => m.status === "active")
    .map((m) => m.weeklyStats.donationsGiven);
  const avgDonations =
    donationsValues.length > 0
      ? donationsValues.reduce((a, b) => a + b, 0) / donationsValues.length
      : 0;
  const lowDonationThreshold = Math.max(avgDonations * 0.5, 20);
  const lowDonations = members
    .filter(
      (m) =>
        m.status === "active" &&
        m.weeklyStats.donationsGiven < lowDonationThreshold
    )
    .sort((a, b) => a.weeklyStats.donationsGiven - b.weeklyStats.donationsGiven);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Alertas</CardTitle>
          <p className="text-xs text-clash-muted mt-0.5">Inactivos, riesgo y donaciones bajas</p>
        </div>
        <Bell size={16} className="text-clash-gold" />
      </CardHeader>
      <div className="space-y-2">
        {inactivos.length > 0 && (
          <div className="p-2 rounded-lg bg-glass">
            <div className="flex items-start gap-2 mb-2">
              <Badge variant="danger" size="sm" className="mt-0.5">🚨</Badge>
              <p className="text-xs text-clash-text font-medium">{inactivos.length} miembro(s) inactivo(s) por más de 3 días</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-1 ml-0 sm:ml-6 grid-flow-row">
              {inactivos.map((m) => {
                const days = Math.floor((Date.now() - m.lastActiveAt) / (1000 * 60 * 60 * 24));
                return (
                  <div key={m.uid} className="flex items-center gap-1.5 min-w-0">
                    <Avatar name={m.displayName} size="xs" />
                    <span className="text-xs text-clash-text truncate">{m.displayName}</span>
                    <span className="text-xs text-clash-error font-mono shrink-0">{days}d</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {risk.length > 0 && (
          <div className="p-2 rounded-lg bg-glass">
            <div className="flex items-start gap-2 mb-2">
              <Badge variant="warning" size="sm" className="mt-0.5">⚠️</Badge>
              <p className="text-xs text-clash-text font-medium">{risk.length} miembro(s) en riesgo de expulsión</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-1 ml-0 sm:ml-6 grid-flow-row">
              {risk.map((m) => {
                const days = Math.floor((Date.now() - m.lastActiveAt) / (1000 * 60 * 60 * 24));
                return (
                  <div key={m.uid} className="flex items-center gap-1.5 min-w-0">
                    <Avatar name={m.displayName} size="xs" />
                    <span className="text-xs text-clash-text truncate">{m.displayName}</span>
                    <span className="text-xs text-yellow-400 font-mono shrink-0">{days}d</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {lowDonations.length > 0 && avgDonations > 30 && (
          <div className="p-2 rounded-lg bg-glass">
            <div className="flex items-start gap-2 mb-2">
              <Badge variant="info" size="sm" className="mt-0.5">ℹ️</Badge>
              <p className="text-xs text-clash-text font-medium">
                {lowDonations.length} miembro(s) con donaciones bajas (menos de {Math.round(lowDonationThreshold)})
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-1 ml-0 sm:ml-6 grid-flow-row">
              {lowDonations.map((m) => (
                <div key={m.uid} className="flex items-center gap-1.5 min-w-0">
                  <Avatar name={m.displayName} size="xs" />
                  <span className="text-xs text-clash-text truncate">{m.displayName}</span>
                  <span className="text-xs text-clash-muted font-mono shrink-0">{m.weeklyStats.donationsGiven}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {inactivos.length === 0 && risk.length === 0 && lowDonations.length === 0 && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-glass">
            <Badge variant="info" size="sm" className="mt-0.5">ℹ️</Badge>
            <p className="text-xs text-clash-text">No hay alertas activas. Todo en orden ✅</p>
          </div>
        )}
      </div>
    </Card>
  );
}
