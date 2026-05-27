"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockAutomationRules, mockEvents, mockLogs } from "@/lib/mock-data";
import { useClanStore } from "@/lib/store";
import { useClanData } from "@/hooks/use-clan-data";
import { Settings, Bell, Shield, Webhook, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const { loading, error, refetch } = useClanData();
  const clan = useClanStore((s) => s.clan);
  const loaded = useClanStore((s) => s.loaded);
  const rules = mockAutomationRules;

  if (error && !loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <p className="text-sm text-clash-error">{error}</p>
          <button
            onClick={refetch}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-metallic-gold animate-metallic-shimmer text-white border border-clash-border text-xs font-medium hover:brightness-110 disabled:opacity-50"
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
          <img src="/carga4.gif" alt="Cargando..." className="w-24 h-24 mx-auto" />
          <p className="text-sm text-clash-muted">Cargando ajustes...</p>
        </div>
      </div>
    );
  }
  const events = mockEvents;
  const logs = mockLogs.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-clash-text">Ajustes</h1>
        <p className="text-sm text-clash-muted mt-0.5">
          Configuración del clan y automatización
        </p>
      </div>

       <Card>
         <CardHeader>
           <CardTitle className="text-metallic-gold bg-clip-text">Configuración del Clan</CardTitle>
           <Settings size={16} className="text-metallic-gold animate-icon-shine" />
         </CardHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-clash-muted">Nombre del Clan</label>
              <Input defaultValue={clan.name} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-clash-muted">Tag</label>
              <Input defaultValue={clan.tag} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-clash-muted">
                Copas mínimas requeridas
              </label>
              <Input type="number" defaultValue={clan.requiredTrophies} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-clash-muted">Tipo de Clan</label>
              <Input defaultValue={clan.type} />
            </div>
          </div>
          <Button variant="primary">Guardar Cambios</Button>
        </div>
      </Card>

       <Card>
         <CardHeader>
           <CardTitle className="text-metallic-gold bg-clip-text">Reglas de Automatización</CardTitle>
           <Bell size={16} className="text-metallic-silver animate-icon-shine" />
         </CardHeader>
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between p-3 rounded-lg bg-glass"
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
              <Button variant="ghost" size="sm">
                Editar
              </Button>
            </div>
          ))}
        </div>
      </Card>

       <Card>
         <CardHeader>
           <CardTitle className="text-metallic-gold bg-clip-text">Eventos Semanales</CardTitle>
           <Shield size={16} className="text-metallic-silver animate-icon-shine" />
         </CardHeader>
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between p-3 rounded-lg bg-glass"
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

       <Card>
         <CardHeader>
           <CardTitle className="text-metallic-gold bg-clip-text">Historial de Actividad</CardTitle>
           <Webhook size={16} className="text-metallic-silver animate-icon-shine" />
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
    </div>
  );
}
