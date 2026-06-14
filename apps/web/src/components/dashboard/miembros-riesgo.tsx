"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useClanStore } from "@/lib/store";
import { daysAgo, getActivityColor } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import type { Member } from "@clashmanager/shared";

const MIN_WAR_PCT = 50;

type ReasonTag = "inactivity" | "donations" | "war";

interface RiskMember {
  member: Member;
  primary: ReasonTag;
  daysSinceActive: number;
  severity: "inactive" | "risk" | null;
}

interface Section {
  key: ReasonTag;
  title: string;
  icon: string;
}

const SECTIONS: Section[] = [
  { key: "inactivity", title: "Inactividad (+5 días)",               icon: "🔴" },
  { key: "donations",  title: "Donaciones Bajas",                    icon: "🟡" },
  { key: "war",        title: "Poca Participación en Guerra",         icon: "⚪" },
];

function classifyMember(m: Member, minDonations: number, now: number): RiskMember | null {
  const daysSinceActive = Math.max(0, Math.floor((now - m.lastActiveAt) / 86400000));
  let severity: "inactive" | "risk" | null = null;
  if (m.status === "inactive") severity = "inactive";
  else if (m.status === "risk") severity = "risk";

  if (!severity && daysSinceActive >= 3 && (m.weeklyStats?.donationsGiven ?? 0) < minDonations) {
    return { member: m, primary: "donations", daysSinceActive, severity: null };
  }
  if (!severity && (m.weeklyStats?.warParticipation ?? 0) < MIN_WAR_PCT) {
    return { member: m, primary: "war", daysSinceActive, severity: null };
  }
  if (severity) {
    return { member: m, primary: "inactivity", daysSinceActive, severity };
  }
  return null;
}

export function MiembrosRiesgo() {
  const members = useClanStore((s) => s.members);
  const minDonations = useClanStore((s) => s.clanScaling.minDonationsWeekly);
  const now = Date.now();

  const grouped: Record<ReasonTag, RiskMember[]> = { inactivity: [], donations: [], war: [] };
  for (const m of members) {
    const r = classifyMember(m, minDonations, now);
    if (r) grouped[r.primary].push(r);
  }

  for (const key of Object.keys(grouped) as ReasonTag[]) {
    grouped[key].sort((a, b) => a.member.lastActiveAt - b.member.lastActiveAt);
  }

  const total = Object.values(grouped).reduce((s, arr) => s + arr.length, 0);
  if (total === 0) {
    return (
      <Card className="relative">
        <CardHeader>
          <div>
            <CardTitle>Miembros en Riesgo</CardTitle>
            <p className="text-xs text-clash-muted mt-0.5">Jugadores que requieren atención</p>
          </div>
          <AlertTriangle size={16} className="text-green-400" />
        </CardHeader>
        <p className="text-sm text-clash-muted text-center py-6">Sin miembros en riesgo ✅</p>
        <img src="/lanza.png" alt="" className="absolute bottom-2 right-2 w-10 h-auto object-contain opacity-30 pointer-events-none" />
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div>
          <CardTitle>Miembros en Riesgo</CardTitle>
          <p className="text-xs text-clash-muted mt-0.5">
            Inactivos, donaciones bajas o poca participación en guerra
          </p>
        </div>
        <AlertTriangle size={16} className="text-red-400" />
      </CardHeader>
      <img src="/lanza.png" alt="" className="absolute inset-x-0 bottom-0 top-16 h-40 object-cover opacity-5 pointer-events-none" />
      <div className="relative z-10 space-y-4">
        {SECTIONS.map((section) => {
          const items = grouped[section.key];
          if (items.length === 0) return null;
          return (
            <div key={section.key}>
              <h4 className="text-xs font-semibold text-clash-muted px-1 mb-1.5 flex items-center gap-1.5">
                <span>{section.icon}</span>
                {section.title}
                <span className="text-clash-muted/50 font-normal ml-auto">{items.length}</span>
              </h4>
              <div className="space-y-1">
                {items.slice(0, 4).map(({ member, daysSinceActive, severity }) => {
                  const badgeVariant = severity === "inactive" ? "danger" : section.key === "donations" ? "warning" : "default";
                  const badgeLabel = severity === "inactive" ? "Inactivo" : severity === "risk" ? "Inactividad" : section.key === "donations" ? "Donaciones" : "Guerra";
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
                        <p className="text-xs text-clash-muted">
                          Don.: {member.weeklyStats?.donationsGiven ?? 0} · Guerra:{" "}
                          {member.weeklyStats?.warParticipation ?? 0}%
                          {daysSinceActive > 0 && (
                            <span className={`ml-1.5 ${getActivityColor(daysSinceActive)}`}>
                              · {daysAgo(member.lastActiveAt)}
                            </span>
                          )}
                        </p>
                      </div>
                      <Badge variant={badgeVariant} size="sm">
                        {badgeLabel}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
