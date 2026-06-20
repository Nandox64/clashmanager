import type { MemberRole } from "../types";

export const ROLE_HIERARCHY: Record<MemberRole, number> = {
  leader: 100,
  coleader: 80,
  veteran: 50,
  member: 10,
};

export const ROLE_LABELS: Record<MemberRole, string> = {
  leader: "Líder",
  coleader: "Colíder",
  veteran: "Veterano",
  member: "Miembro",
};

export const STATUS_LABELS = {
  active: "Activo",
  inactive: "Inactivo",
  risk: "En riesgo",
  trial: "Período de prueba",
};

export const STATUS_COLORS = {
  active: "text-green-400",
  inactive: "text-red-400",
  risk: "text-orange-400",
  trial: "text-yellow-400",
} as const;

export const AVATAR_COLORS = [
  "from-red-500 to-orange-500",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-emerald-500",
  "from-purple-500 to-pink-500",
  "from-yellow-500 to-amber-500",
  "from-teal-500 to-cyan-500",
  "from-pink-500 to-rose-500",
  "from-indigo-500 to-purple-500",
] as const;

export const DEFAULT_CLAN_SETTINGS = {
  inactivityDays: 5,
  minDonationsWeekly: 200,
};

export const MEDALS = [
  {
    id: "war_legend",
    name: "Leyenda de la Guerra",
    icon: "🏆",
    requirement: "10 guerras con 100% de participación",
  },
  {
    id: "clan_heart",
    name: "Corazón del Clan",
    icon: "❤️",
    requirement: "Top donador de la semana",
  },
  {
    id: "unstoppable",
    name: "Imparable",
    icon: "⚡",
    requirement: "+500 copas en una semana",
  },
  {
    id: "guardian",
    name: "Guardián",
    icon: "🛡️",
    requirement: "Donó 3x lo que recibió 3 semanas seguidas",
  },
  {
    id: "sharpshooter",
    name: "Francotirador",
    icon: "🎯",
    requirement: "MVP de guerra 3 veces seguidas",
  },
  {
    id: "diamond",
    name: "Diamante en Bruto",
    icon: "💎",
    requirement: "Mejor ratio de mejora de copas/día",
  },
  {
    id: "on_fire",
    name: "En Llamas",
    icon: "🔥",
    requirement: "Donó 500+ y ganó 100+ copas en la semana",
  },
  {
    id: "strategist",
    name: "Estratega",
    icon: "🧠",
    requirement: "80%+ participación en 5+ guerras",
  },
] as const;

export const XP_LEVELS = [
  { level: 1, minXp: 0, title: "Recluta" },
  { level: 2, minXp: 100, title: "Guerrero" },
  { level: 3, minXp: 300, title: "Élite" },
  { level: 4, minXp: 700, title: "Leyenda" },
  { level: 5, minXp: 1500, title: "Inmortal" },
] as const;

export const WEEKLY_EVENTS = [
  { id: "donation_monday", name: "Donation King", day: 1, icon: "🎁" },
  { id: "war_wednesday", name: "War Ready", day: 3, icon: "⚔️" },
  { id: "push_friday", name: "Push Friday", day: 5, icon: "🚀" },
  { id: "mvp_sunday", name: "MVP de la Semana", day: 0, icon: "⭐" },
] as const;
