"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useClanStore } from "@/lib/store";
import { UserPlus, Check, X, Clock, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { RoleGuard } from "@/components/auth/role-guard";

export default function RecruitmentPage() {
  const storeRecruits = useClanStore((s) => s.recruits);
  const setStoreRecruits = useClanStore((s) => s.setRecruits);
  const loaded = useClanStore((s) => s.loaded);
  const [recruits, setRecruits] = useState(storeRecruits);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecruits = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recruits");
      if (!res.ok) throw new Error("Error al cargar reclutas");
      const data = await res.json();
      setRecruits(data.recruits ?? []);
      setStoreRecruits(data.recruits ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeRecruits.length > 0) {
      setRecruits(storeRecruits);
    } else if (loaded) {
      fetchRecruits();
    }
  }, [loaded]);

  const updateRecruitStatus = async (id: string, status: "accepted" | "rejected" | "trial") => {
    const updated = recruits.map((r) =>
      r.id === id
        ? {
            ...r,
            status,
            trialStart: status === "trial" ? Date.now() : r.trialStart,
            trialEnd: status === "trial" ? Date.now() + 7 * 86400000 : r.trialEnd,
          }
        : r
    );
    setRecruits(updated);
    try {
      const res = await fetch("/api/recruits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recruits: updated }),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      const data = await res.json();
      setStoreRecruits(data.recruits ?? updated);
      toast.success(`Recluta ${status === "accepted" ? "aceptado" : status === "rejected" ? "rechazado" : "en período de prueba"}`);
    } catch (err) {
      setRecruits(recruits);
      toast.error("Error al actualizar recluta");
    }
  };

  const statusConfig = {
    pending: { label: "Pendiente", variant: "warning" as const, icon: Clock },
    trial: { label: "Prueba", variant: "info" as const, icon: Clock },
    accepted: { label: "Aceptado", variant: "success" as const, icon: Check },
    rejected: { label: "Rechazado", variant: "danger" as const, icon: X },
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <p className="text-sm text-clash-error">{error}</p>
          <button
            onClick={fetchRecruits}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-metallic-gold animate-metallic-shimmer text-black border border-clash-border text-xs font-medium hover:brightness-110 disabled:opacity-50"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!loaded && loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <img src="/carga4.gif" alt="Cargando..." className="w-32 h-32 mx-auto" />
          <p className="text-sm text-clash-muted">Cargando reclutas...</p>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-page-title text-xl">Reclutamiento</h1>
            <p className="text-sm text-clash-muted mt-0.5">
              Evalúa y gestiona nuevos candidatos
            </p>
          </div>
          <button onClick={fetchRecruits} disabled={loading} title="Actualizar">
            <RefreshCw size={16} className={`text-clash-muted hover:text-clash-text transition-colors ${loading ? "animate-spin" : ""}`} />
          </button>
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
                      <Button size="sm" variant="primary" onClick={() => updateRecruitStatus(recruit.id, "trial")}>
                        <Check size={14} />
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => updateRecruitStatus(recruit.id, "rejected")}>
                        <X size={14} />
                      </Button>
                    </div>
                  )}
                  {recruit.status === "trial" && (
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="primary" onClick={() => updateRecruitStatus(recruit.id, "accepted")}>
                        <Check size={14} /> Aceptar
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => updateRecruitStatus(recruit.id, "rejected")}>
                        <X size={14} /> Rechazar
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </RoleGuard>
  );
}
