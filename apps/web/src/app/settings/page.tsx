"use client";

import Image from "next/image";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { useClanStore } from "@/lib/store";
import { useClanData } from "@/hooks/use-clan-data";
import { useProfile } from "@/hooks/use-profile";
import { ROLE_LABELS, ROLE_HIERARCHY } from "@clashmanager/shared";

import { Settings, Webhook, Save, Target, Gauge, Trophy, Trash2, UserCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { ClanScaling } from "@/lib/store";
import { RoleGuard } from "@/components/auth/role-guard";
import { RuletaControl } from "@/components/ruleta/ruleta-control";
import { useAuth } from "@/contexts/AuthContext";

const ALLOWED_ROLES = ["leader", "coleader"];

const ROLE_COLORS: Record<string, string> = {
  leader: "bg-yellow-500/20 text-yellow-300 border-2 border-yellow-400/60",
  coleader: "bg-purple-500/20 text-purple-300 border-2 border-purple-400/60",
  veteran: "bg-blue-500/20 text-blue-300 border-2 border-blue-400/60",
  member: "bg-gray-500/20 text-gray-300 border-2 border-gray-400/60",
};

export default function SettingsPage() {
  const { user, isMock, profile: authProfile } = useAuth();
  const { loading: clanLoading, error, refetch } = useClanData();
  const { profile, loading: profileLoading } = useProfile();
  const clan = useClanStore((s) => s.clan);
  const members = useClanStore((s) => s.members);
  const loaded = useClanStore((s) => s.loaded);
  const storeLogs = useClanStore((s) => s.logs);
  const setStoreLogs = useClanStore((s) => s.setLogs);
  const storeScaling = useClanStore((s) => s.clanScaling);
  const setStoreScaling = useClanStore((s) => s.setClanScaling);
  const storeLocalWarRank = useClanStore((s) => s.localWarRank);
  const setStoreLocalWarRank = useClanStore((s) => s.setLocalWarRank);
  const storeLocalWarRankChange = useClanStore((s) => s.localWarRankChange);
  const setStoreLocalWarRankChange = useClanStore((s) => s.setLocalWarRankChange);
  const progressPhase = useClanStore((s) => s.progressPhase);

  const linkedMember = members.find((m) => m.uid === profile?.linkedMemberId);
  const userRole = linkedMember?.role ?? null;
  const isAllowed = userRole ? ALLOWED_ROLES.includes(userRole) : false;

  const [logs, setLogs] = useState(storeLogs);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const [warRank, setWarRank] = useState(storeLocalWarRank ?? 0);
  const [warRankChange, setWarRankChange] = useState(storeLocalWarRankChange ?? 0);
  const [scaling, setScaling] = useState<ClanScaling>(storeScaling);

  const [rateLimits, setRateLimits] = useState<Array<{ route: string; used: number; remaining: number; resetIn: number }>>([]);
  const [rateLimitLoading, setRateLimitLoading] = useState(false);
  const [linkedProfiles, setLinkedProfiles] = useState<Array<{ uid: string; linkedMemberId: string | null; email?: string | null; displayName?: string }>>([]);
  const [linkedProfilesLoading, setLinkedProfilesLoading] = useState(false);

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    if (isMock) return { Authorization: `Bearer mock-${authProfile?.uid ?? "mode"}` };
    const token = await user?.getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    setWarRank(storeLocalWarRank ?? 0);
    setWarRankChange(storeLocalWarRankChange ?? 0);
  }, [storeLocalWarRank, storeLocalWarRankChange]);

  useEffect(() => {
    setScaling(storeScaling);
  }, [storeScaling]);

  const fetchLinkedProfiles = async () => {
    setLinkedProfilesLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/profile?linked=1", { headers });
      if (res.ok) {
        const data = await res.json();
        setLinkedProfiles(data.profiles ?? []);
      }
    } catch {
      // ignore
    } finally {
      setLinkedProfilesLoading(false);
    }
  };

  const unlinkProfile = async (firebaseUid: string, memberUid: string) => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/profile/unlink", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ uid: firebaseUid, memberUid }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error" }));
        throw new Error(err.error || "Error al desvincular");
      }
      toast.success("Perfil desvinculado");
      fetchLinkedProfiles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  const fetchRateLimits = async () => {
    setRateLimitLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/ai/rate-limit-status", { headers });
      if (res.ok) {
        const data = await res.json();
        setRateLimits(data.limits ?? []);
      }
    } catch {
      // ignore
    } finally {
      setRateLimitLoading(false);
    }
  };

  const fetchSettings = async () => {
    setSettingsLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch("/api/settings", { signal: controller.signal });
      if (!res.ok) throw new Error("Error al cargar ajustes");
      const data = await res.json();
      setLogs(data.logs ?? []);
      setStoreLogs(data.logs ?? []);
      if (data.warRank !== undefined && data.warRank !== null) {
        setWarRank(data.warRank);
        setStoreLocalWarRank(data.warRank);
      }
      if (data.warRankChange !== undefined && data.warRankChange !== null) {
        setWarRankChange(data.warRankChange);
        setStoreLocalWarRankChange(data.warRankChange);
      }
      if (data.scaling) {
        setScaling(data.scaling);
        setStoreScaling(data.scaling);
      }
    } catch {
      // Silently fall back to current state
    } finally {
      clearTimeout(timeoutId);
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    if (loaded && (progressPhase === "ready" || progressPhase === "error")) {
      fetchSettings();
    }
  }, [loaded, progressPhase]);

  useEffect(() => {
    if (user) fetchRateLimits();
  }, [user]);
  useEffect(() => {
    if (isAllowed) fetchLinkedProfiles();
  }, [isAllowed]);
  const saveSettings = async (extra: Record<string, unknown> = {}) => {
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          warRank,
          warRankChange,
          scaling,
          ...extra,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error ?? `Error ${res.status}`);
      }
      setStoreScaling(scaling);
      setStoreLocalWarRank(warRank);
      setStoreLocalWarRankChange(warRankChange);
      toast.success("Ajustes guardados");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar ajustes");
    }
  };

  if (error && !loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <p className="text-sm text-clash-error">{error}</p>
          <button
            onClick={refetch}
            disabled={clanLoading}
            className="px-3 py-1.5 rounded-lg bg-metallic-gold animate-metallic-shimmer text-black border border-yellow-400/40 text-xs font-medium hover:brightness-110 disabled:opacity-50"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!loaded) {
    return <Loading text="Cargando ajustes..." className="h-64" />;
  }

  return (
    <RoleGuard>
      <div className="space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Settings size={24} className="text-[#ffd700]" style={{ filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.5)) drop-shadow(1px 0 0 rgba(0,0,0,0.5)) drop-shadow(-1px 0 0 rgba(0,0,0,0.5)) drop-shadow(0 -1px 0 rgba(0,0,0,0.5)) drop-shadow(0 0 6px rgba(0,0,0,0.35))' }} />
              <h1 className="text-page-title text-2xl">Ajustes</h1>
            </div>
            <p className="text-sm text-clash-muted mt-0.5">
              Configuración del clan y automatización
            </p>
          </div>
          {userRole && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${ROLE_COLORS[userRole] ?? ""}`}
            >
              {ROLE_LABELS[userRole]}
            </span>
          )}
        </div>

        <Image src="/settings.png" alt="Banner" width={800} height={200} className="w-auto max-w-full h-auto rounded-xl object-contain max-h-[200px]" />

        {/* Clan Info (read-only) */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-metallic-gold">Información del Clan</CardTitle>
              <p className="text-xs text-clash-dimmed mt-0.5">Datos del clan obtenidos de la API de Clash Royale (solo lectura)</p>
            </div>
            <Settings size={16} className="text-metallic-gold" />
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-clash-dimmed">Nombre del Clan</label>
              <Input value={clan.name} readOnly className="opacity-70" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-clash-dimmed">Tag</label>
              <Input value={clan.tag} readOnly className="opacity-70" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-clash-dimmed">Copas totales</label>
              <Input value={clan.stats.clanScore.toLocaleString()} readOnly className="opacity-70" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-clash-dimmed">Trofeos de guerra</label>
              <Input value={clan.stats.clanWarTrophies.toLocaleString()} readOnly className="opacity-70" />
            </div>
          </div>
        </Card>

        {profileLoading && !profile ? (
          <Loading text="Vinculando tu perfil..." className="py-12" />
        ) : (
          <>
            {/* War Position Editor (leader/coleader only) */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="text-metallic-gold">Posición de Guerra</CardTitle>
                  <p className="text-xs text-clash-dimmed mt-0.5">
                    {isAllowed
                      ? "Edita la posición y trofeos de guerra del clan"
                      : "Solo líder y colíder pueden editar — vista de solo lectura"}
                  </p>
                </div>
                <Target size={16} className="text-metallic-gold" />
              </CardHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-clash-dimmed">Posición actual (ranking local)</label>
                  <Input
                    type="number"
                    value={warRank}
                    onChange={(e) => setWarRank(Number(e.target.value))}
                    readOnly={!isAllowed}
                    className={!isAllowed ? "opacity-70" : ""}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-clash-dimmed">Cambio de posición (+ sube, - baja)</label>
                  <Input
                    type="number"
                    value={warRankChange}
                    onChange={(e) => setWarRankChange(Number(e.target.value))}
                    readOnly={!isAllowed}
                    className={!isAllowed ? "opacity-70" : ""}
                  />
                </div>
              </div>
              {isAllowed && (
                <div className="mt-4 flex justify-end">
                  <Button
                    size="sm"
                    variant="metal"
                    onClick={() => saveSettings({ warRank, warRankChange })}
                  >
                    <Save size={14} />
                    Guardar posición
                  </Button>
                </div>
              )}
            </Card>

            {/* Clan Scaling Editor (leader/coleader only) */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="text-metallic-gold">Escalado del Clan</CardTitle>
                  <p className="text-xs text-clash-muted mt-0.5">
                    {isAllowed
                      ? "Configura los requisitos y límites del clan"
                      : "Solo líder y colíder pueden editar"}
                  </p>
                </div>
                <Gauge size={16} className="text-metallic-gold" />
              </CardHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-clash-muted">Días de inactividad antes de alertar</label>
                  <Input
                    type="number"
                    value={scaling.inactivityDays}
                    onChange={(e) => setScaling({ ...scaling, inactivityDays: Number(e.target.value) })}
                    readOnly={!isAllowed}
                    className={!isAllowed ? "opacity-70" : ""}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-clash-muted">Donaciones mínimas semanales</label>
                  <Input
                    type="number"
                    value={scaling.minDonationsWeekly}
                    onChange={(e) => setScaling({ ...scaling, minDonationsWeekly: Number(e.target.value) })}
                    readOnly={!isAllowed}
                    className={!isAllowed ? "opacity-70" : ""}
                  />
                </div>
              </div>
              {isAllowed && (
                <div className="mt-4 flex justify-end">
                  <Button
                    size="sm"
                    variant="metal"
                    onClick={() => saveSettings({ scaling })}
                  >
                    <Save size={14} />
                    Guardar escalado
                  </Button>
                </div>
              )}
            </Card>

            {/* Ruleta Control (leader only) */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="text-metallic-gold">Control de Ruleta</CardTitle>
                  <p className="text-xs text-clash-muted mt-0.5">
                    {isAllowed ? "Activa/desactiva eventos de la ruleta y monitorea ganadores" : "Solo el líder puede controlar la ruleta"}
                  </p>
                </div>
                <Trophy size={16} className="text-metallic-gold" />
              </CardHeader>
              <RuletaControl isAllowed={isAllowed} />
            </Card>

            {/* Vinculaciones (solo leader) */}
            {userRole === "leader" && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="text-metallic-gold">Vinculaciones</CardTitle>
                  <p className="text-xs text-clash-dimmed mt-0.5">
                    Perfiles vinculados a miembros del clan
                  </p>
                </div>
                <UserCircle size={16} className="text-metallic-gold" />
              </CardHeader>
              <div className="space-y-3">
                {linkedProfilesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <p className="text-xs text-clash-muted">Cargando...</p>
                  </div>
                ) : linkedProfiles.length === 0 ? (
                  <div className="flex items-center justify-center py-4">
                    <p className="text-xs text-clash-muted">No hay vinculaciones</p>
                  </div>
                ) : (
                  linkedProfiles.map((lp) => {
                    const linkedMember = members.find((m) => m.uid === lp.linkedMemberId);
                    return (
                      <div key={lp.uid} className="flex items-center justify-between p-3 rounded-lg bg-glass border border-clash-border">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#b8860b] to-[#ffd700] flex items-center justify-center text-xs font-bold text-black shrink-0">
                            {linkedMember?.displayName?.slice(0, 2).toUpperCase() ?? "??"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-clash-text truncate">
                              {linkedMember?.displayName ?? "Miembro desconocido"}
                            </p>
                            <p className="text-xs text-clash-dimmed truncate">
                              {lp.email || lp.uid}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (!lp.linkedMemberId) return;
                            unlinkProfile(lp.uid, lp.linkedMemberId);
                          }}
                          disabled={!lp.linkedMemberId}
                          className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-40"
                          title="Desvincular"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
            )}

            {/* Uso de IA (visible para leader/coleader) */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="text-metallic-gold">Uso de IA</CardTitle>
                  <p className="text-xs text-clash-muted mt-0.5">Solicitudes restantes de la inteligencia artificial por minuto</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchRateLimits}
                    disabled={rateLimitLoading}
                    className="p-1.5 rounded-lg bg-glass border border-white/20 text-clash-text hover:text-metallic-gold transition-colors disabled:opacity-50"
                    title="Actualizar estado"
                  >
                    <svg className={`w-3.5 h-3.5 ${rateLimitLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </CardHeader>
              <div className="space-y-3">
                {rateLimits.length === 0 ? (
                  <div className="flex items-center justify-center py-4">
                      <button
                        onClick={fetchRateLimits}
                        className="px-3 py-1.5 rounded-lg bg-glass border border-white/20 text-xs text-clash-muted hover:text-metallic-gold transition-colors"
                      >
                      {rateLimitLoading ? "Cargando..." : "Consultar estado"}
                    </button>
                  </div>
                ) : (
                  rateLimits.map((rl) => {
                    const pct = rl.remaining / 10 * 100;
                    const resetSecs = Math.ceil(rl.resetIn / 1000);
                    const label: Record<string, string> = {
                      "analyze-decks": "Analizar Mazos",
                      "suggest-decks": "Sugerir Mazos",
                      "how-to-play": "Cómo Jugar",
                    };
                    return (
                      <div key={rl.route} className="flex items-center justify-between p-3 rounded-lg bg-glass">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-clash-text">{label[rl.route] || rl.route}</p>
                          <p className="text-xs text-clash-dimmed mt-0.5">
                            {rl.remaining}/10 restantes · Reinicia en {resetSecs}s
                          </p>
                        </div>
                        <div className="w-20 h-1.5 bg-glass rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct > 50 ? "bg-green-500" : pct > 20 ? "bg-yellow-500" : "bg-red-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="text-metallic-gold">Historial de Actividad</CardTitle>
                  <p className="text-xs text-clash-muted mt-0.5">Registro de acciones de gestión del clan</p>
                </div>
                <Webhook size={16} className="text-metallic-gold" />
              </CardHeader>
              <div className="space-y-2">
                {logs.map((log) => {
                  const actorName = members.find((m) => m.uid === log.actorId)?.displayName ?? log.actorId;
                  const targetName = members.find((m) => m.uid === log.targetId)?.displayName ?? log.targetId;
                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-2 p-2 rounded-lg hover:bg-glass transition-colors"
                    >
                      <Badge
                        variant={
                          log.type === "promotion"
                            ? "success"
                            : log.type === "kick"
                              ? "danger"
                              : "warning"
                        }
                        size="sm"
                      >
                        {log.type === "promotion"
                          ? "⬆"
                          : log.type === "kick"
                            ? "🚫"
                            : "⚠️"}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-clash-text break-words">
                          <strong>{actorName}</strong> {log.action}{" "}
                          <strong>{targetName}</strong> — {log.details}
                        </p>
                        <p className="text-[10px] text-clash-muted mt-0.5">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}
      </div>
    </RoleGuard>
  );
}
