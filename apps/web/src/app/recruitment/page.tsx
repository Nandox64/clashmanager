"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { mockRecruits } from "@/lib/mock-data";
import { UserPlus, Check, X, Clock } from "lucide-react";

export default function RecruitmentPage() {
  const recruits = mockRecruits;

  const statusConfig = {
    pending: { label: "Pendiente", variant: "warning" as const, icon: Clock },
    trial: { label: "Prueba", variant: "info" as const, icon: Clock },
    accepted: { label: "Aceptado", variant: "success" as const, icon: Check },
    rejected: { label: "Rechazado", variant: "danger" as const, icon: X },
  };

  return (
    <div className="space-y-6">
       <div>
         <h1 className="text-xl font-bold text-metallic-gold bg-clip-text">Reclutamiento</h1>
         <p className="text-sm text-clash-muted mt-0.5">
           Evalúa y gestiona nuevos candidatos
         </p>
       </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <p className="text-2xl font-bold font-mono text-clash-gold">
            {recruits.length}
          </p>
          <p className="text-xs text-clash-muted">Total candidatos</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold font-mono text-yellow-400">
            {recruits.filter((r) => r.status === "pending").length}
          </p>
          <p className="text-xs text-clash-muted">Pendientes</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold font-mono text-clash-secondary">
            {recruits.filter((r) => r.status === "trial").length}
          </p>
          <p className="text-xs text-clash-muted">En prueba</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold font-mono text-green-400">
            {recruits.filter((r) => r.status === "accepted").length}
          </p>
          <p className="text-xs text-clash-muted">Aceptados</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Candidatos</CardTitle>
            <p className="text-xs text-clash-muted mt-0.5">Lista de reclutas en evaluación y período de prueba</p>
          </div>
          <UserPlus size={16} className="text-clash-secondary" />
        </CardHeader>
        <div className="space-y-3">
          {recruits.map((recruit) => {
            const config = statusConfig[recruit.status];
            const StatusIcon = config.icon;
            return (
              <div
                key={recruit.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-glass flex-wrap"
              >
                <Avatar name={recruit.displayName} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-clash-text">
                      {recruit.displayName}
                    </p>
                    <Badge variant={config.variant} size="sm">
                      <StatusIcon size={10} className="mr-1" />
                      {config.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-clash-muted flex-wrap">
                    <span>🏆 {recruit.trophies.toLocaleString()}</span>
                    <span>🎯 Score: {recruit.score}/100</span>
                    {recruit.status === "trial" && (
                      <span>
                        📅 Trial:{" "}
                        {Math.ceil(
                          (recruit.trialEnd - Date.now()) / (1000 * 60 * 60 * 24)
                        )}{" "}
                        días restantes
                      </span>
                    )}
                  </div>
                </div>
                     <div className="w-16 h-16 rounded-lg bg-metallic-gold animate-metallic-shimmer flex items-center justify-center">
                   <div className="text-center">
                     <p className="text-lg font-bold font-mono text-white">
                       {recruit.score}
                     </p>
                     <p className="text-[10px] text-clash-muted">Score</p>
                   </div>
                 </div>
                {recruit.status === "pending" && (
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="primary">
                      <Check size={14} />
                    </Button>
                    <Button size="sm" variant="danger">
                      <X size={14} />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
