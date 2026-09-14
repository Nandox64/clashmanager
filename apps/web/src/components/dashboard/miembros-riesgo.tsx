"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useClanStore } from "@/lib/store";
import { daysAgo } from "@/lib/utils";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import type { Member } from "@clashmanager/shared";

const MIN_WAR_PCT = 50;
const DEFAULT_VISIBLE = 2;

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
  { key: "inactivity", title: "Inactividad (+5 días)", icon: "🔴" },
  { key: "donations", title: "Donaciones Bajas", icon: "🟡" },
  { key: "war", title: "Poca Participación en Guerra", icon: "⚪" },
];

function classifyMember(m: Member, minDonations: number, now: number): RiskMember | null {
  const daysSinceActive = Math.max(0, Math.floor((now - m.lastActiveAt) / 86400000));
  let severity: "inactive" | "risk" | null = null;
  if (m.status === "inactive") severity = "inactive";
  else if (m.status === "risk") severity = "risk";

  if (!severity && daysSinceActive >= 3 && (m.donations ?? 0) < minDonations) {
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

function getBadgeVariant(severity: "inactive" | "risk" | null, primary: ReasonTag) {
  if (severity === "inactive") return "danger";
  if (severity === "risk") return "warning";
  return primary === "donations" ? "warning" : "default";
}

function getBadgeLabel(severity: "inactive" | "risk" | null, primary: ReasonTag) {
  if (severity === "inactive") return "Inactivo";
  if (severity === "risk") return "Inactividad";
  return primary === "donations" ? "Donaciones" : "Guerra";
}

interface RiskRowProps {
  member: Member;
  daysSinceActive: number;
  severity: "inactive" | "risk" | null;
  primary: ReasonTag;
}

function RiskRow({ member, daysSinceActive, severity, primary }: RiskRowProps) {
  const badgeVariant = getBadgeVariant(severity, primary);
  const badgeLabel = getBadgeLabel(severity, primary);
  const donationsVal = member.donations ?? 0;

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-glass/30 transition-colors">
      <Avatar name={member.displayName} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-clash-text drop-shadow-sm">
          {member.displayName}
        </p>
        <p className="text-xs text-clash-muted drop-shadow-sm">
          Don.: {donationsVal} · Guerra:{" "}
          {member.weeklyStats?.warParticipation ?? 0}%
          {member.totalWars > 0 && (
            <span className="text-clash-dimmed ml-1">
              ({member.warsParticipated ?? 0}/{member.totalWars} guerras)
            </span>
          )}
          {daysSinceActive > 0 && (
            <span className={[
              "ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium",
              severity === "inactive" || severity === "risk"
                ? "bg-red-800/70 text-red-100"
                : donationsVal < 200
                  ? "bg-amber-700/60 text-amber-100"
                  : "bg-neutral-700/60 text-neutral-100",
            ].join(" ")}>
              {daysAgo(member.lastActiveAt)}
            </span>
          )}
        </p>
      </div>
      <Badge variant={badgeVariant} size="sm">
        {badgeLabel}
      </Badge>
    </div>
  );
}

export function MiembrosRiesgo() {
  const members = useClanStore((s) => s.members);
  const minDonations = useClanStore((s) => s.clanScaling.minDonationsWeekly);
  const now = Date.now();
  const [expandedSections, setExpandedSections] = useState<Set<ReasonTag>>(new Set());

  const grouped: Record<ReasonTag, RiskMember[]> = { inactivity: [], donations: [], war: [] };
  for (const m of members) {
    const r = classifyMember(m, minDonations, now);
    if (r) grouped[r.primary].push(r);
  }

  for (const key of Object.keys(grouped) as ReasonTag[]) {
    grouped[key].sort((a, b) => a.member.lastActiveAt - b.member.lastActiveAt);
  }

  const total = Object.values(grouped).reduce((s, arr) => s + arr.length, 0);

  const toggleSection = (key: ReasonTag) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (total === 0) {
    return (
      <Card className="relative overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle>Miembros en Riesgo</CardTitle>
            <p className="text-xs text-clash-muted mt-0.5">
              Inactivos, donaciones bajas o poca participación en guerra
            </p>
          </div>
          <AlertTriangle size={16} className="text-green-400" />
        </CardHeader>
        <img src="/lanzadardos1.webp" alt="" className="absolute bottom-0 left-1/2 -translate-x-1/2 h-50 object-cover opacity-75 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-sm text-clash-muted text-center py-6">Sin miembros en riesgo ✅</p>
        </div>
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
        <AlertTriangle size={16} className="text-red-500" />
      </CardHeader>
      <img src="/lanzadardos1.webp" alt="" className="absolute bottom-0 left-1/2 -translate-x-1/2 h-50 object-cover opacity-75 pointer-events-none" />
      <div className="relative z-10 space-y-4">
        {SECTIONS.map((section) => {
          const items = grouped[section.key];
          if (items.length === 0) return null;
          const isExpanded = expandedSections.has(section.key);
          const visible = isExpanded ? items.length : DEFAULT_VISIBLE;

          return (
            <div key={section.key}>
              <div className="flex items-center gap-1 mb-1.5">
                <h4 className="text-xs font-semibold text-clash-muted px-1 flex items-center gap-1.5">
                  <span>{section.icon}</span>
                  {section.title}
                  <span className="text-clash-muted/50 font-normal">({items.length})</span>
                </h4>
                <button
                  onClick={() => toggleSection(section.key)}
                  className="ml-auto text-xs text-clash-gold hover:text-clash-gold/80 transition-colors flex items-center gap-1 px-1 py-0.5 rounded hover:bg-glass/30"
                >
                  {isExpanded ? "Mostrar menos" : "Mostrar todos"}
                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>
              <div className="space-y-1">
                {items.slice(0, visible).map(({ member, daysSinceActive, severity, primary }) => (
                  <RiskRow key={member.uid} member={member} daysSinceActive={daysSinceActive} severity={severity} primary={primary} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
