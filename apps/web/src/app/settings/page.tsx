"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useClanStore } from "@/lib/store";
import { useClanData } from "@/hooks/use-clan-data";
import { useProfile } from "@/hooks/use-profile";
import { ROLE_LABELS, ROLE_HIERARCHY } from "@clashmanager/shared";
import { IdentificationBanner } from "@/components/onboarding/identification-banner";
import { Settings, Bell, Shield, Webhook, Save, Target, Gauge, Trophy, Link2Off, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { AutomationRule, ClanEvent } from "@clashmanager/shared";
import type { ClanScaling } from "@/lib/store";
import { RoleGuard } from "@/components/auth/role-guard";
import { RuletaControl } from "@/components/ruleta/ruleta-control";
import { useAuth } from "@/contexts/AuthContext";

const ALLOWED_ROLES = ["leader", "coleader"];

const ROLE_COLORS: Record<string, string> = {
  leader: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  coleader: "bg-purple-500/20 text-purple-400 border-purple-500/40",
  veteran: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  member: "bg-gray-500/20 text-gray-400 border-gray-500/40",
};

export default function SettingsPage() {
  const { user, isMock, profile: authProfile } = useAuth();
  const { loading: clanLoading, error, refetch } = useClanData();
  const { profile, loading: profileLoading } = useProfile();
  const clan = useClanStore((s) => s.clan);
  const members = useClanStore((s) => s.members);
  const loaded = useClanStore((s) => s.loaded);
  const storeRules = useClanStore((s) => s.rules);
  const setStoreRules = useClanStore((s) => s.setRules);
  const storeEvents = useClanStore((s) => s.events);
  const setStoreEvents = useClanStore((s) => s.setEvents);
  const storeLogs = useClanStore((s) => s.logs);
  const setStoreLogs = useClanStore((s) => s.setLogs);
  const storeScaling = useClanStore((s) => s.clanScaling);
  const setStoreScaling = useClanStore((s) => s.setClanScaling);
  const storeLocalWarRank = useClanStore((s) => s.localWarRank);
  const setStoreLocalWarRank = useClanStore((s) => s.setLocalWarRank);
  const storeLocalWarTrophies = useClanStore((s) => s.localWarTrophies);
  const setStoreLocalWarTrophies = useClanStore((s) => s.setLocalWarTrophies);

  const linkedMember = members.find((m) => m.uid === profile?.linkedMemberId);
  const userRole = linkedMember?.role ?? null;
  const isAllowed = userRole ? ALLOWED_ROLES.includes(userRole) : false;

  const [rules, setRules] = useState<AutomationRule[]>(storeRules);
  const [events, setEvents] = useState<ClanEvent[]>(storeEvents);
  const [logs, setLogs] = useState(storeLogs);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [linkedProfiles, setLinkedProfiles] = useState<Array<{ uid: string; displayName: string; linkedMemberId: string | null; email?: string }>>([]);
  const [unlinkingUid, setUnlinkingUid] = useState<string | null>(null);

  const [warRank, setWarRank] = useState(storeLocalWarRank ?? 0);
  const [warTrophies, setWarTrophies] = useState(storeLocalWarTrophies ?? 0);
  const [scaling, setScaling] = useState<ClanScaling>(storeScaling);

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    if (isMock) return { Authorization: `Bearer mock-${authProfile?.uid ?? "mode"}` };
    const token = await user?.getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    setWarRank(storeLocalWarRank ?? 0);
    setWarTrophies(storeLocalWarTrophies ?? 0);
  }, [storeLocalWarRank, storeLocalWarTrophies]);

  useEffect(() => {
    setScaling(storeScaling);
  }, [storeScaling]);

  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Error al cargar ajustes");
      const data = await res.json();
      setRules(data.rules ?? []);
      setEvents(data.events ?? []);
      setLogs(data.logs ?? []);
      setStoreRules(data.rules ?? []);
      setStoreEvents(data.events ?? []);
      setStoreLogs(data.logs ?? []);
      if (data.warRank) setWarRank(data.warRank);
      if (data.warTrophies) setWarTrophies(data.warTrophies);
      if (data.scaling) {
        setScaling(data.scaling);
        setStoreScaling(data.scaling);
      }
    } catch {
      // Silently fall back to current state
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    if (storeRules.length > 0) {
      setRules(storeRules);
      setEvents(storeEvents);
      setLogs(storeLogs);
    } else if (loaded) {
      fetchSettings();
    }
  }, [loaded]);

  const fetchLinkedProfiles = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/profile?linked=1", { headers });
      if (!res.ok) throw new Error("Error al cargar vinculaciones");
      const data = await res.json();
      setLinkedProfiles(data.profiles ?? []);
    } catch {
      toast.error("Error al cargar vinculaciones");
    }
  };

  useEffect(() => {
    if (userRole === "leader") fetchLinkedProfiles();
  }, [userRole]);

  const unlinkProfile = async (targetUid: string, memberUid: string) => {
    setUnlinkingUid(targetUid);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/profile/unlink", {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ uid: targetUid, memberUid }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Error al desvincular");
      }
      setLinkedProfiles((prev) => prev.filter((p) => p.uid !== targetUid));
      toast.success("Miembro desvinculado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al desvincular");
    } finally {
      setUnlinkingUid(null);
    }
  };

  const saveSettings = async (extra: Record<string, unknown> = {}) => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rules,
          events,
          warRank,
          warTrophies,
          scaling,
          ...extra,
        }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setStoreRules(rules);
      setStoreEvents(events);
      setStoreScaling(scaling);
      setStoreLocalWarRank(warRank);
      setStoreLocalWarTrophies(warTrophies);
      toast.success("Ajustes guardados");
    } catch {
      toast.error("Error al guardar ajustes");
    }
  };

  const toggleRule = async (ruleId: string) => {
    const newRules = rules.map((r) =>
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    );
    setRules(newRules);
    await saveSettings({ rules: newRules });
  };

  const toggleEvent = async (eventId: string) => {
    const newEvents = events.map((e) =>
      e.id === eventId ? { ...e, enabled: !e.enabled } : e
    );
    setEvents(newEvents);
    await saveSettings({ events: newEvents });
  };

  if (error && !loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <p className="text-sm text-clash-error">{error}</p>
          <button
            onClick={refetch}
            disabled={clanLoading}
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
          <p className="text-sm text-clash-muted">Cargando ajustes...</p>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard>
      <div className="space-y-6">
        <IdentificationBanner />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-page-title text-xl">Ajustes</h1>
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
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <img src="/carga4.gif" alt="Cargando..." className="w-24 h-24 mx-auto" />
              <p className="text-sm text-clash-muted">Vinculando tu perfil...</p>
            </div>
          </div>
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
                  <label className="text-xs text-clash-dimmed">Trofeos de guerra</label>
                  <Input
                    type="number"
                    value={warTrophies}
                    onChange={(e) => setWarTrophies(Number(e.target.value))}
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
                    onClick={() => saveSettings({ warRank, warTrophies })}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-clash-muted">Trofeos requeridos para unirse</label>
                  <Input
                    type="number"
                    value={scaling.requiredTrophies}
                    onChange={(e) => setScaling({ ...scaling, requiredTrophies: Number(e.target.value) })}
                    readOnly={!isAllowed}
                    className={!isAllowed ? "opacity-70" : ""}
                  />
                </div>
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
                  <label className="text-xs text-clash-muted">Días para expulsión por inactividad</label>
                  <Input
                    type="number"
                    value={scaling.expulsionDays}
                    onChange={(e) => setScaling({ ...scaling, expulsionDays: Number(e.target.value) })}
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
                <div className="space-y-1.5">
                  <label className="text-xs text-clash-muted">Guerra requerida</label>
                  <select
                    value={scaling.warRequired ? "true" : "false"}
                    onChange={(e) => setScaling({ ...scaling, warRequired: e.target.value === "true" })}
                    disabled={!isAllowed}
                    className="w-full rounded-lg border border-clash-border bg-glass px-3 py-2 text-sm text-clash-text focus:outline-none focus:border-metallic-gold focus:ring-1 focus:ring-metallic-gold transition-colors disabled:opacity-70"
                  >
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-clash-muted">Auto-promover</label>
                  <select
                    value={scaling.autoPromote ? "true" : "false"}
                    onChange={(e) => setScaling({ ...scaling, autoPromote: e.target.value === "true" })}
                    disabled={!isAllowed}
                    className="w-full rounded-lg border border-clash-border bg-glass px-3 py-2 text-sm text-clash-text focus:outline-none focus:border-metallic-gold focus:ring-1 focus:ring-metallic-gold transition-colors disabled:opacity-70"
                  >
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
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

            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="text-metallic-gold">Reglas de Automatización</CardTitle>
                  <p className="text-xs text-clash-muted mt-0.5">
                    {isAllowed
                      ? "Reglas inteligentes para gestión del clan — haz clic en una regla para activarla/desactivarla"
                      : "Vista de solo lectura"}
                  </p>
                </div>
                <Bell size={16} className="text-metallic-gold" />
              </CardHeader>
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-glass cursor-pointer hover:bg-clash-card transition-colors"
                    onClick={() => isAllowed && toggleRule(rule.id)}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-clash-text truncate">
                          {rule.name}
                        </p>
                        <Badge
                          variant={rule.enabled ? "success" : "default"}
                          size="sm"
                        >
                          {rule.enabled ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      <p className="text-xs text-clash-muted mt-0.5">
                        {rule.actions.map((a) => a.message).join(", ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="text-metallic-gold">Eventos Semanales</CardTitle>
                  <p className="text-xs text-clash-muted mt-0.5">
                    {isAllowed
                      ? "Retos automáticos programados por día — haz clic para activar/desactivar"
                      : "Vista de solo lectura"}
                  </p>
                </div>
                <Shield size={16} className="text-metallic-gold" />
              </CardHeader>
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-glass cursor-pointer hover:bg-clash-card transition-colors"
                    onClick={() => isAllowed && toggleEvent(event.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-glass flex items-center justify-center">
                        {event.type === "donation"
                          ? "🎁"
                          : event.type === "war"
                            ? "⚔️"
                            : event.type === "push"
                              ? "🚀"
                              : "⭐"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-clash-text truncate">
                          {event.name}
                        </p>
                        <p className="text-xs text-clash-muted">
                          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][
                            event.dayOfWeek
                          ]}
                        </p>
                      </div>
                    </div>
                    <Badge variant={event.enabled ? "success" : "default"}>
                      {event.enabled ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                ))}
              </div>
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

            {userRole === "leader" && (
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle className="text-metallic-gold">Vinculaciones</CardTitle>
                    <p className="text-xs text-clash-muted mt-0.5">Perfiles conectados a miembros del clan</p>
                  </div>
                  <Users size={16} className="text-metallic-gold" />
                </CardHeader>
                <div className="space-y-2">
                  {linkedProfiles.map((linkedProfile) => {
                    const member = members.find((m) => m.uid === linkedProfile.linkedMemberId);
                    return (
                      <div key={linkedProfile.uid} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-glass">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-clash-text truncate">{member?.displayName ?? linkedProfile.linkedMemberId}</p>
                          <p className="text-xs text-clash-muted truncate">{linkedProfile.email || linkedProfile.displayName || linkedProfile.uid}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={unlinkingUid === linkedProfile.uid || linkedProfile.uid === profile?.uid || !linkedProfile.linkedMemberId}
                          onClick={() => linkedProfile.linkedMemberId && unlinkProfile(linkedProfile.uid, linkedProfile.linkedMemberId)}
                        >
                          <Link2Off size={14} />
                          Desvincular
                        </Button>
                      </div>
                    );
                  })}
                  {linkedProfiles.length === 0 && (
                    <p className="text-xs text-clash-muted text-center py-3">No hay vinculaciones registradas.</p>
                  )}
                </div>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="text-metallic-gold">Historial de Actividad</CardTitle>
                  <p className="text-xs text-clash-muted mt-0.5">Registro de acciones de gestión del clan</p>
                </div>
                <Webhook size={16} className="text-metallic-gold" />
              </CardHeader>
              <div className="space-y-2">
                {logs.map((log) => (
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
                        <strong>{log.actorId}</strong> {log.action}{" "}
                        <strong>{log.targetId}</strong> — {log.details}
                      </p>
                      <p className="text-[10px] text-clash-muted mt-0.5">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </RoleGuard>
  );
}
