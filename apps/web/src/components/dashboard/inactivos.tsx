"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useClanStore } from "@/lib/store";
import { daysAgo, getActivityColor } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export function Inactivos() {
  const members = useClanStore((s) => s.members);
  const inactivos = members
    .filter((m) => m.status === "inactive" || m.status === "risk")
    .sort((a, b) => a.lastActiveAt - b.lastActiveAt)
    .slice(0, 5);

  if (inactivos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inactivos</CardTitle>
          <AlertTriangle size={16} className="text-green-400" />
        </CardHeader>
        <p className="text-sm text-clash-muted text-center py-6">
          Todos los miembros están activos ✅
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inactivos / En Riesgo</CardTitle>
        <AlertTriangle size={16} className="text-orange-400" />
      </CardHeader>
      <div className="space-y-2">
        {inactivos.map((member) => {
          const daysSinceActive = Math.floor(
            (Date.now() - member.lastActiveAt) / (1000 * 60 * 60 * 24)
          );
          return (
            <div
              key={member.uid}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-glass transition-colors"
            >
              <Avatar name={member.displayName} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-clash-text">
                  {member.displayName}
                </p>
              </div>
              <span
                className={`font-mono text-xs font-medium ${getActivityColor(daysSinceActive)}`}
              >
                {daysAgo(member.lastActiveAt)}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
