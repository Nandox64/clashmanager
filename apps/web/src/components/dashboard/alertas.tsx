"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useClanStore } from "@/lib/store";
import { daysAgo } from "@/lib/utils";
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

  const lowDonations = members.filter(
    (m) => m.weeklyStats.donationsGiven < 100 && m.status === "active"
  );
  if (lowDonations.length > 0) {
    alerts.push({
      message: `${lowDonations.length} miembro(s) con donaciones bajas esta semana`,
      variant: "info",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      message: "No hay alertas activas. Todo en orden ✅",
      variant: "info",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas</CardTitle>
        <Bell size={16} className="text-clash-gold" />
      </CardHeader>
      <div className="space-y-2">
        {alerts.map((alert, i) => (
          <div
            key={i}
            className="flex items-start gap-2 p-2 rounded-lg bg-glass"
          >
            <Badge variant={alert.variant} size="sm" className="mt-0.5">
              {alert.variant === "danger"
                ? "🚨"
                : alert.variant === "warning"
                  ? "⚠️"
                  : "ℹ️"}
            </Badge>
            <p className="text-xs text-clash-text">{alert.message}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
