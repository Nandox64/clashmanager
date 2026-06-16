import type { Member, Achievement } from "@clashmanager/shared";

const MEDAL_CHECKERS: {
  medalId: string;
  name: string;
  icon: string;
  check: (m: Member, allMembers: Member[]) => boolean;
}[] = [
  {
    medalId: "war_legend",
    name: "Leyenda de la Guerra",
    icon: "🏆",
    check: (m) => {
      const pct = m.totalWars > 0 ? (m.warsParticipated / m.totalWars) * 100 : 0;
      return m.totalWars >= 10 && pct >= 90;
    },
  },
  {
    medalId: "clan_heart",
    name: "Corazón del Clan",
    icon: "❤️",
    check: (m) => (m.donations ?? 0) >= 500,
  },
  {
    medalId: "unstoppable",
    name: "Imparable",
    icon: "⚡",
    check: (m) => (m.weeklyStats?.trophiesGained ?? 0) >= 500,
  },
  {
    medalId: "guardian",
    name: "Guardián",
    icon: "🛡️",
    check: (m, allMembers) => {
      const maxDonations = Math.max(...allMembers.map((x) => x.donations ?? 0));
      return maxDonations > 0 && (m.donations ?? 0) === maxDonations;
    },
  },
  {
    medalId: "on_fire",
    name: "En Llamas",
    icon: "🔥",
    check: (m) => (m.weeklyStats?.activityDays ?? 0) >= 5,
  },
  {
    medalId: "diamond",
    name: "Diamante en Bruto",
    icon: "💎",
    check: (m) => {
      const days = m.weeklyStats?.activityDays ?? 0;
      const gained = m.weeklyStats?.trophiesGained ?? 0;
      return days > 0 && gained / days >= 20;
    },
  },
  {
    medalId: "sharpshooter",
    name: "Francotirador",
    icon: "🎯",
    check: () => false,
  },
  {
    medalId: "strategist",
    name: "Estratega",
    icon: "🧠",
    check: () => false,
  },
];

export function computeAchievements(
  members: Member[],
  existingAchievements: Achievement[]
): Achievement[] {
  const newAchievements: Achievement[] = [];
  const existingSet = new Set(
    existingAchievements.map((a) => `${a.memberId}_${a.type}`)
  );

  for (const member of members) {
    for (const medal of MEDAL_CHECKERS) {
      const key = `${member.uid}_${medal.medalId}`;
      if (existingSet.has(key)) continue;
      if (!medal.check(member, members)) continue;

      newAchievements.push({
        id: `${member.uid}_${medal.medalId}_${Date.now()}`,
        memberId: member.uid,
        type: medal.medalId,
        name: medal.name,
        icon: medal.icon,
        awardedAt: Date.now(),
      });
    }
  }

  return [...existingAchievements, ...newAchievements];
}
