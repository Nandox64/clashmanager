"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useClanStore } from "@/lib/store";
import { Bell } from "lucide-react";

export function Alertas() {
  const members = useClanStore((s) => s.members);
  const alerts: { message: string; variant: "warning" | "danger" | "info" }[] = [];

  const inactivos = members.filter(
    (m) => m.status === "inactive"
  );
  if (inactivos.length > 0) {
    alerts.push({
      message: `${inactivos.length} miembro(s) inactivo(s) por más de 3 días`,
      variant: "danger",
    });
  }

  const risk = members.filter((m) => m.status === "risk");
  if (risk.length > 0) {
    alerts.push({
      message: `${risk.length} miembro(s) en riesgo de expulsión`,
      variant: "warning",
    });
  }

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
        <CardTitle>Alertas</CardTitle>
        <Bell size={16} className="text-clash-gold" />
      </CardHeader>
      <div className="space-y-2">
        {inactivos.length > 0 && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-glass">
            <Badge variant="danger" size="sm" className="mt-0.5">🚨</Badge>
            <p className="text-xs text-clash-text">{inactivos.length} miembro(s) inactivo(s) por más de 3 días</p>
          </div>
        )}
        {risk.length > 0 && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-glass">
            <Badge variant="warning" size="sm" className="mt-0.5">⚠️</Badge>
            <p className="text-xs text-clash-text">{risk.length} miembro(s) en riesgo de expulsión</p>
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
            <div className="space-y-1 ml-6">
              {lowDonations.slice(0, 10).map((m) => (
                <div key={m.uid} className="flex items-center gap-2">
                  <Avatar name={m.displayName} size="xs" />
                  <span className="text-xs text-clash-text flex-1 truncate">{m.displayName}</span>
                  <span className="text-xs text-clash-muted font-mono">{m.weeklyStats.donationsGiven}</span>
                </div>
              ))}
              {lowDonations.length > 10 && (
                <p className="text-xs text-clash-muted">...y {lowDonations.length - 10} más</p>
              )}
            </div>
          </div>
        )}
        {alerts.length === 0 && lowDonations.length === 0 && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-glass">
            <Badge variant="info" size="sm" className="mt-0.5">ℹ️</Badge>
            <p className="text-xs text-clash-text">No hay alertas activas. Todo en orden ✅</p>
          </div>
        )}
      </div>
    </Card>
  );
}
