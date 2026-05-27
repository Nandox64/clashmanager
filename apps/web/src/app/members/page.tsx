"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClanStore } from "@/lib/store";
import { useClanData } from "@/hooks/use-clan-data";
import { daysAgo, getActivityColor } from "@/lib/utils";
import { ROLE_LABELS, STATUS_LABELS } from "@clashmanager/shared";
import { Search, Filter, MoreVertical, RefreshCw } from "lucide-react";

const roleOrder = ["leader", "coleader", "veteran", "member"];

export default function MembersPage() {
  const { loading, error, refetch } = useClanData();
  const members = useClanStore((s) => s.members);
  const loaded = useClanStore((s) => s.loaded);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

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
         <h1 className="text-xl font-bold text-metallic-gold bg-clip-text">Miembros</h1>
         <p className="text-sm text-clash-muted mt-0.5">
           {members.length} miembros en el clan
         </p>
       </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-clash-muted"
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

      {/* Desktop table */}
      <div className="hidden md:block">
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-clash-border">
                  <th className="text-left text-xs font-medium text-clash-muted p-3">
                    Jugador
                  </th>
                  <th className="text-left text-xs font-medium text-clash-muted p-3">
                    Rol
                  </th>
                  <th className="text-right text-xs font-medium text-clash-muted p-3">
                    Copas
                  </th>
                  <th className="text-right text-xs font-medium text-clash-muted p-3">
                    Donaciones
                  </th>
                  <th className="text-right text-xs font-medium text-clash-muted p-3">
                    Guerra
                  </th>
                  <th className="text-right text-xs font-medium text-clash-muted p-3">
                    Actividad
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-clash-border">
                {filtered.map((member) => {
                  const daysSinceActive = Math.floor(
                    (Date.now() - member.lastActiveAt) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <tr
                      key={member.uid}
                      className="hover:bg-glass transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={member.displayName} size="sm" />
                          <span className="text-sm font-medium text-clash-text">
                            {member.displayName}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            member.role === "leader"
                              ? "info"
                              : member.role === "coleader"
                                ? "warning"
                                : member.role === "veteran"
                                  ? "success"
                                  : "default"
                          }
                        >
                          {ROLE_LABELS[member.role]}
                        </Badge>
                      </td>
                       <td className="p-3 text-right font-mono text-sm text-metallic-gold">
                         {member.trophies.toLocaleString()}
                       </td>
                        <td className="p-3 text-right font-mono text-sm text-metallic-silver">
                          {member.weeklyStats?.donationsGiven ?? 0}
                        </td>
                       <td className="p-3 text-right">
                         <Badge
                           variant={
                             (member.weeklyStats?.warParticipation ?? 0) >= 80
                               ? "success"
                               : (member.weeklyStats?.warParticipation ?? 0) >= 40
                                 ? "warning"
                                 : "danger"
                           }
                         >
                           {member.weeklyStats?.warParticipation ?? 0}%
                         </Badge>
                       </td>
                      <td className="p-3 text-right">
                        <span
                          className={`font-mono text-xs ${getActivityColor(daysSinceActive)}`}
                        >
                          {daysAgo(member.lastActiveAt)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Mobile cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filtered.map((member) => {
          const daysSinceActive = Math.floor(
            (Date.now() - member.lastActiveAt) / (1000 * 60 * 60 * 24)
          );
          return (
            <Card key={member.uid}>
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
                  <div className="flex items-center gap-3 mt-1 text-xs text-clash-muted flex-wrap">
                    <span>🏆 {member.trophies.toLocaleString()}</span>
                    <span>🎁 {member.weeklyStats?.donationsGiven ?? 0}</span>
                    <span>⚔️ {member.weeklyStats?.warParticipation ?? 0}%</span>
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
    </div>
  );
}
