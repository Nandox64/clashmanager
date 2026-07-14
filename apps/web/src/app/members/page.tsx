"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClanStore } from "@/lib/store";
import { useClanData } from "@/hooks/use-clan-data";
import { daysAgo, getActivityColor } from "@/lib/utils";
import { ROLE_LABELS, MEDALS } from "@clashmanager/shared";
import type { Member } from "@clashmanager/shared";
import { getCachedRole } from "@/lib/profile-cache";
import { Search, RefreshCw, UserPlus, Check, X, Clock, Users, Award } from "lucide-react";
import { toast } from "sonner";

const roleOrder = ["leader", "coleader", "veteran", "member"];

export default function MembersPage() {
  const { loading, error, refetch } = useClanData();
  const members = useClanStore((s) => s.members);
  const loaded = useClanStore((s) => s.loaded);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  const storeRecruits = useClanStore((s) => s.recruits);
  const setStoreRecruits = useClanStore((s) => s.setRecruits);
  const [recruits, setRecruits] = useState<typeof storeRecruits>([]);
  const [recruitLoading, setRecruitLoading] = useState(false);
  const [recruitError, setRecruitError] = useState<string | null>(null);
  const achievements = useClanStore((s) => s.achievements);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showAll, setShowAll] = useState(false);
  const userRole = getCachedRole();
  const isLeader = userRole === "leader" || userRole === "coleader";

  const fetchRecruits = async () => {
    setRecruitLoading(true);
    setRecruitError(null);
    try {
      const res = await fetch("/api/recruits");
      if (!res.ok) throw new Error("Error al cargar reclutas");
      const data = await res.json();
      setRecruits(data.recruits ?? []);
      setStoreRecruits(data.recruits ?? []);
    } catch (err) {
      setRecruitError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setRecruitLoading(false);
    }
  };

  useEffect(() => {
    if (storeRecruits.length > 0) {
      setRecruits(storeRecruits);
    } else if (loaded && isLeader) {
      fetchRecruits();
    }
  }, [loaded]);

  const updateRecruitStatus = async (id: string, status: "accepted" | "rejected" | "trial") => {
    const updated = recruits.map((r) =>
      r.id === id
        ? { ...r, status, trialStart: status === "trial" ? Date.now() : r.trialStart, trialEnd: status === "trial" ? Date.now() + 7 * 86400000 : r.trialEnd }
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
    } catch {
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

  if (error && !loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <p className="text-sm text-clash-error">{error}</p>
          <button
            onClick={refetch}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-metallic-gold animate-metallic-shimmer text-black border border-clash-border text-xs font-medium hover:brightness-110 disabled:opacity-50"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <img src="/carga4.gif" alt="Cargando..." className="w-32 h-32 mx-auto" />
          <p className="text-sm text-clash-muted">Cargando miembros...</p>
        </div>
      </div>
    );
  }

  const filtered = members
    .filter((m) => {
      if (filterRole !== "all" && m.role !== filterRole) return false;
      if (
        search &&
        !m.displayName.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    })
    .sort(
      (a, b) =>
        roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role) ||
        b.trophies - a.trophies
    );

  const visibleMembers = showAll ? filtered : filtered.slice(0, 20);

  const roleCounts = members.reduce(
    (acc, m) => {
      acc[m.role] = (acc[m.role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-4">
       <div>
          <div className="flex items-center gap-2">
            <Users size={24} className="text-[#ffd700]" style={{ filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.5)) drop-shadow(1px 0 0 rgba(0,0,0,0.5)) drop-shadow(-1px 0 0 rgba(0,0,0,0.5)) drop-shadow(0 -1px 0 rgba(0,0,0,0.5)) drop-shadow(0 0 6px rgba(0,0,0,0.35))' }} />
            <h1 className="text-page-title text-2xl">Miembros</h1>
          </div>
         <p className="text-sm text-clash-muted mt-0.5">
           {members.length} miembros en el clan
         </p>
        </div>

      <img src="/members.png" alt="Banner" className="w-auto max-w-full h-auto rounded-xl object-contain max-h-[200px]" />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-clash-dimmed"
          />
          <Input
            placeholder="Buscar miembro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {["all", ...roleOrder].map((role) => (
            <Button
              key={role}
              variant={filterRole === role ? "primary" : "ghost"}
              size="sm"
              onClick={() => setFilterRole(role)}
              className="whitespace-nowrap"
            >
              {role === "all"
                ? `Todos (${members.length})`
                : `${ROLE_LABELS[role as keyof typeof ROLE_LABELS]} (${roleCounts[role] || 0})`}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {visibleMembers.map((member) => {
          const daysSinceActive = Math.floor(
            (Date.now() - member.lastActiveAt) / (1000 * 60 * 60 * 24)
          );
          const memberAchievements = achievements.filter((a) => a.memberId === member.uid);
          return (
            <Card key={member.uid} className="cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setSelectedMember(member)}>
              <div className="flex items-center gap-3">
                <Avatar name={member.displayName} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-clash-text truncate">
                      {member.displayName}
                    </p>
                    <Badge
                      variant={
                        member.role === "leader"
                          ? "info"
                          : member.role === "coleader"
                            ? "warning"
                            : "default"
                      }
                      size="sm"
                    >
                      {ROLE_LABELS[member.role]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-clash-dimmed flex-wrap">
                    <span>🏆 {member.trophies.toLocaleString()}</span>
                    <span>🎁 {member.donations ?? 0}</span>
                    <span>⚔️ {member.weeklyStats?.warParticipation ?? 0}%</span>
                    {memberAchievements.length > 0 && (
                      <span className="text-metallic-gold">{memberAchievements.length} 🏅</span>
                    )}
                  </div>
                </div>
                <span
                  className={`text-xs font-mono ${getActivityColor(daysSinceActive)}`}
                >
                  {daysAgo(member.lastActiveAt)}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {!showAll && filtered.length > 20 && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowAll(true)}
            className="px-6 py-2 rounded-lg bg-glass border border-white/20 text-sm text-clash-muted hover:text-clash-text hover:border-white/40 transition-colors"
          >
            Cargar Todos ({filtered.length} miembros)
          </button>
        </div>
      )}

      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedMember(null)}>
          <div className="bg-glass border border-white/20 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-clash-border flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-2">
                <Avatar name={selectedMember.displayName} size="sm" />
                <div>
                  <h3 className="font-bold text-white text-sm">{selectedMember.displayName}</h3>
                  <p className="text-[10px] text-clash-muted">{ROLE_LABELS[selectedMember.role]}</p>
                </div>
              </div>
              <button onClick={() => setSelectedMember(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <X size={18} className="text-clash-muted" />
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 mb-3">
                <Award size={14} className="text-clash-gold" />
                <h4 className="text-xs font-semibold text-clash-text uppercase tracking-wider">Medallas</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {MEDALS.map((medal) => {
                  const earned = achievements.some((a) => a.memberId === selectedMember.uid && a.type === medal.id);
                  return (
                    <div
                      key={medal.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border ${
                        earned
                          ? "bg-metallic-gold/10 border-metallic-gold/30"
                          : "bg-black/20 border-white/10 opacity-50"
                      }`}
                    >
                      <span className="text-xl">{medal.icon}</span>
                      <div>
                        <p className={`text-xs font-medium ${earned ? "text-clash-text" : "text-clash-dimmed"}`}>
                          {medal.name}
                        </p>
                        <p className="text-[9px] text-clash-dimmed">{medal.requirement}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {isLeader && (
        <div className="space-y-6 pt-6 border-t border-clash-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-page-title text-xl">Reclutamiento</h2>
              <p className="text-sm text-clash-muted mt-0.5">Evalúa y gestiona nuevos candidatos</p>
            </div>
            <button onClick={fetchRecruits} disabled={recruitLoading} title="Actualizar">
              <RefreshCw size={16} className={`text-clash-muted hover:text-clash-text transition-colors ${recruitLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card>
              <p className="text-2xl font-bold font-mono text-clash-gold">{recruits.length}</p>
              <p className="text-xs text-clash-muted">Total candidatos</p>
            </Card>
            <Card>
              <p className="text-2xl font-bold font-mono text-yellow-400">{recruits.filter((r) => r.status === "pending").length}</p>
              <p className="text-xs text-clash-muted">Pendientes</p>
            </Card>
            <Card>
              <p className="text-2xl font-bold font-mono text-clash-secondary">{recruits.filter((r) => r.status === "trial").length}</p>
              <p className="text-xs text-clash-muted">En prueba</p>
            </Card>
            <Card>
              <p className="text-2xl font-bold font-mono text-green-400">{recruits.filter((r) => r.status === "accepted").length}</p>
              <p className="text-xs text-clash-muted">Aceptados</p>
            </Card>
          </div>

          {recruitError && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-3">
                <p className="text-sm text-clash-error">{recruitError}</p>
                <button onClick={fetchRecruits} disabled={recruitLoading} className="px-3 py-1.5 rounded-lg bg-metallic-gold animate-metallic-shimmer text-black border border-clash-border text-xs font-medium hover:brightness-110 disabled:opacity-50">Reintentar</button>
              </div>
            </div>
          )}

          {!recruitError && (
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
                    <div key={recruit.id} className="flex items-center gap-3 p-3 rounded-lg bg-glass flex-wrap">
                      <Avatar name={recruit.displayName} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-clash-text">{recruit.displayName}</p>
                          <Badge variant={config.variant} size="sm">
                            <StatusIcon size={10} className="mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-clash-muted flex-wrap">
                          <span>🏆 {recruit.trophies.toLocaleString()}</span>
                          <span>🎯 Score: {recruit.score}/100</span>
                          {recruit.status === "trial" && (
                            <span>📅 Trial: {Math.ceil((recruit.trialEnd - Date.now()) / (1000 * 60 * 60 * 24))} días restantes</span>
                          )}
                        </div>
                      </div>
                      <div className="w-16 h-16 rounded-lg bg-metallic-gold animate-metallic-shimmer flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-lg font-bold font-mono text-white">{recruit.score}</p>
                          <p className="text-[10px] text-clash-muted">Score</p>
                        </div>
                      </div>
                      {recruit.status === "pending" && (
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="primary" onClick={() => updateRecruitStatus(recruit.id, "trial")}><Check size={14} /></Button>
                          <Button size="sm" variant="danger" onClick={() => updateRecruitStatus(recruit.id, "rejected")}><X size={14} /></Button>
                        </div>
                      )}
                      {recruit.status === "trial" && (
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="primary" onClick={() => updateRecruitStatus(recruit.id, "accepted")}><Check size={14} /> Aceptar</Button>
                          <Button size="sm" variant="danger" onClick={() => updateRecruitStatus(recruit.id, "rejected")}><X size={14} /> Rechazar</Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
