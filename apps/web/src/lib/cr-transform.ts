import "server-only";

import type {
  CRClan,
  CRClanMember,
  CRRiverRaceLog,
  CRCurrentRiverRace,
  CRClanWarRankingsResponse,
  CRClanWarRanking,
} from "./cr-types";
import type {
  Clan,
  Member,
  WeeklyClanStats,
} from "@clashmanager/shared";

export interface WarRankEstimate {
  rank: number;
  trophies: number;
  confidence: "exact" | "seed" | "fallback";
  method: "api" | "seed" | "fallback";
  newEntries: number;
  scoreGap: number;
  previousRank: number | null;
  estimatedChange: number;
}

export function transformClan(data: CRClan): Clan {
  return {
    id: data.tag.replace("#", ""),
    name: data.name,
    tag: data.tag,
    description: data.description,
    badgeId: data.badgeId,
    type: data.type === "inviteOnly" ? "invite" : data.type === "open" ? "open" : "closed",
    requiredTrophies: data.requiredTrophies,
    createdAt: Date.now(),
    settings: {
      inactivityDays: 5,
      expulsionDays: 10,
      minDonationsWeekly: 200,
      warRequired: true,
      autoPromote: false,
    },
    stats: {
      clanScore: data.clanScore,
      clanWarTrophies: data.clanWarTrophies,
      averageTrophies: Math.round(
        data.memberList.reduce((a, m) => a + m.trophies, 0) /
          data.memberList.length
      ),
    },
    healthScore: calculateHealthScore(data.memberList),
    memberCount: data.members,
  };
}

export function transformMembers(
  members: CRClanMember[],
  options?: {
    previousTrophies?: Map<string, number>;
    currentRaceParticipants?: Array<{ tag: string; fame: number; decksUsed: number; decksUsedToday: number }>;
    warHistory?: Map<string, { totalWars: number; warsParticipated: number }>;
  }
): Member[] {
  const now = Date.now();
  return members.map((m) => {
    const lastSeen = parseLastSeen(m.lastSeen);
    const daysSinceActive = (now - lastSeen) / 86400000;
    const status: Member["status"] = daysSinceActive > 10
      ? "inactive"
      : daysSinceActive > 5
        ? "risk"
        : "active";

    const prev = options?.previousTrophies?.get(m.tag);
    const trophiesGained = prev !== undefined && prev > 0
      ? Math.max(0, m.trophies - prev)
      : 0;

    const prevWarHistory = options?.warHistory?.get(m.tag);
    const totalWars = prevWarHistory?.totalWars ?? 0;
    const warsParticipated = prevWarHistory?.warsParticipated ?? 0;

    const raceParticipant = options?.currentRaceParticipants?.find(
      (p) => p.tag === m.tag
    );
    const currentWarPct = raceParticipant && raceParticipant.decksUsed > 0
      ? Math.min(Math.round((raceParticipant.decksUsed / 4) * 100), 100)
      : 0;

    const warParticipation = totalWars > 0
      ? Math.round((warsParticipated / totalWars) * 100)
      : currentWarPct;

    const activityDays =
      daysSinceActive < 2 ? 5 :
      daysSinceActive < 5 ? 3 :
      daysSinceActive < 10 ? 1 : 0;

    return {
      uid: m.tag.replace("#", ""),
      displayName: m.name,
      email: "",
      photoURL: "",
      role: mapRole(m.role),
      playerTag: m.tag,
      joinedAt: now - 30 * 86400000,
      lastActiveAt: lastSeen,
      status,
      trophies: m.trophies,
      bestTrophies: m.trophies,
      level: 0,
      warDayWins: 0,
      cardsCollected: 0,
      donations: m.donations,
      donationsReceived: m.donationsReceived,
      clanPoints: 0,
      xp: 0,
      totalWars,
      warsParticipated,
      weeklyStats: {
        trophiesGained,
        donationsGiven: m.donations,
        warParticipation,
        activityDays,
      },
    };
  });
}

export function transformToWeeklyStats(
  clan: CRClan,
  riverRaceLog: CRRiverRaceLog
): WeeklyClanStats[] {
  const items: WeeklyClanStats[] = [];
  const totalDonations = clan.memberList.reduce(
    (a, m) => a + m.donations,
    0
  );

  const races = riverRaceLog.items.slice(0, 8);

  for (let i = 0; i < 8; i++) {
    const weekStart = Date.now() - (7 - i) * 7 * 86400000;
    const weekEnd = Date.now() - (6 - i) * 7 * 86400000;
    const race = races[i];
    const raceTrophies = race?.standings?.[0]?.trophyChange ?? 0;
    const raceFame = race?.standings?.[0]?.clan?.fame ?? 0;

    items.push({
      id: `week-${i}`,
      weekStart,
      weekEnd,
      totalTrophies: clan.clanScore - Math.floor(Math.random() * 2000),
      avgTrophies: Math.round(
        clan.memberList.reduce((a, m) => a + m.trophies, 0) /
          clan.memberList.length
      ) - Math.floor(Math.random() * 300),
      totalDonations: totalDonations - Math.floor(Math.random() * 3000),
      warTrophies: raceTrophies || (clan.clanWarTrophies - Math.floor(Math.random() * 200)),
    });
  }
  return items;
}

function mapRole(
  role: "leader" | "coLeader" | "elder" | "member"
): "leader" | "coleader" | "veteran" | "member" {
  switch (role) {
    case "leader": return "leader";
    case "coLeader": return "coleader";
    case "elder": return "veteran";
    default: return "member";
  }
}

function parseLastSeen(lastSeen: string): number {
  const d = new Date(lastSeen);
  return isNaN(d.getTime()) ? Date.now() : d.getTime();
}

export function extractClanWarRank(
  rankings: CRClanWarRankingsResponse | null,
  clanTag: string
): number | null {
  if (!rankings?.items?.length) return null;
  const cleanTag = clanTag.replace("#", "").toUpperCase();
  const entry = rankings.items.find(
    (r) => r.tag.replace("#", "").toUpperCase() === cleanTag
  );
  if (entry) return entry.rank;
  return null;
}

export function estimateWarRank(
  rankings: CRClanWarRankingsResponse | null,
  clanTag: string,
  clanWarTrophies: number,
  seedRank: number | null,
  seedChange: number,
  seedTrophies: number | null,
): WarRankEstimate {
  // ── Mode 1: No rankings → fallback ──
  if (!rankings?.items?.length) {
    return {
      rank: seedRank ?? (clanWarTrophies > 0 ? 200 : 0),
      trophies: seedTrophies ?? clanWarTrophies,
      confidence: "fallback",
      method: "fallback",
      newEntries: 0,
      scoreGap: 0,
      previousRank: seedRank,
      estimatedChange: 0,
    };
  }

  const cleanTag = clanTag.replace("#", "").toUpperCase();
  const entry = rankings.items.find(
    (r) => r.tag.replace("#", "").toUpperCase() === cleanTag
  );

  // ── Mode 2: Clan in top 200 → exact ──
  if (entry) {
    return {
      rank: entry.rank,
      trophies: clanWarTrophies,
      confidence: "exact",
      method: "api",
      newEntries: 0,
      scoreGap: 0,
      previousRank: entry.previousRank,
      estimatedChange: seedRank ? seedRank - entry.rank : 0,
    };
  }

  // ── Mode 3: Clan fuera del top 200 → valor fijo (seed manual) ──
  // El seed se configura en .env.local y se persiste en Firestore.
  // El usuario lo actualiza manualmente cuando cambia el puesto real.
  const rank = seedRank ?? 201;
  return {
    rank: Math.max(201, rank),
    trophies: seedTrophies ?? clanWarTrophies,
    confidence: "seed",
    method: "seed",
    newEntries: 0,
    scoreGap: 0,
    previousRank: seedRank,
    estimatedChange: seedChange,
  };
}

function calculateHealthScore(members: CRClanMember[]): number {
  if (!members.length) return 0;
  const now = Date.now();
  const active = members.filter((m) => {
    const lastSeen = new Date(m.lastSeen).getTime();
    return now - lastSeen < 3 * 86400000;
  }).length;
  const donationScore = Math.min(
    members.reduce((a, m) => a + m.donations, 0) / 200,
    25
  );
  const trophyScore = Math.min(
    members.reduce((a, m) => a + m.trophies, 0) / 10000,
    25
  );
  const activityScore = (active / members.length) * 50;
  return Math.round(activityScore + donationScore + trophyScore);
}
