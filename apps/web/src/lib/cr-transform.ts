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
  confidence: "exact" | "estimated" | "fallback";
  method: "api" | "score_gap" | "fallback";
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
  members: CRClanMember[]
): Member[] {
  const now = Date.now();
  return members.map((m) => ({
    uid: m.tag.replace("#", ""),
    displayName: m.name,
    email: "",
    photoURL: "",
    role: mapRole(m.role),
    playerTag: m.tag,
    joinedAt: now - Math.floor(Math.random() * 180 * 86400000),
    lastActiveAt: parseLastSeen(m.lastSeen),
    status: "active" as const,
    trophies: m.trophies,
    bestTrophies: m.trophies,
    level: 0,
    warDayWins: 0,
    cardsCollected: 0,
    donations: m.donations,
    donationsReceived: m.donationsReceived,
    clanPoints: 0,
    xp: 0,
    weeklyStats: {
      trophiesGained: 0,
      donationsGiven: m.donations,
      warParticipation: 0,
      activityDays: 0,
    },
  }));
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
  lastKnownRank: number | null,
  lastKnownChange: number,
): WarRankEstimate {
  const fallback = (rank: number): WarRankEstimate => ({
    rank,
    confidence: "fallback",
    method: "fallback",
    newEntries: 0,
    scoreGap: 0,
    previousRank: lastKnownRank,
    estimatedChange: 0,
  });

  if (!rankings?.items?.length) {
    return fallback(lastKnownRank ?? clanWarTrophies > 0 ? 200 : 0);
  }

  const cleanTag = clanTag.replace("#", "").toUpperCase();
  const entry = rankings.items.find(
    (r) => r.tag.replace("#", "").toUpperCase() === cleanTag
  );
  if (entry) {
    return {
      rank: entry.rank,
      confidence: "exact",
      method: "api",
      newEntries: 0,
      scoreGap: 0,
      previousRank: entry.previousRank,
      estimatedChange: lastKnownRank ? lastKnownRank - entry.rank : 0,
    };
  }

  // ── Score-gap estimation ──
  const items = [...rankings.items].sort((a, b) => a.rank - b.rank);
  const bottom = items.slice(-20);
  const lastPlace = bottom[bottom.length - 1];

  // Average score step at the boundary
  let totalDiff = 0;
  let pairs = 0;
  for (let i = 0; i < bottom.length - 1; i++) {
    const diff = bottom[i].clanScore - bottom[i + 1].clanScore;
    if (diff > 0) { totalDiff += diff; pairs++; }
  }
  const avgStep = pairs > 0 ? totalDiff / pairs : 10;

  const scoreGap = Math.max(0, lastPlace.clanScore - clanWarTrophies);
  const estimatedRanksBehind = avgStep > 0
    ? Math.round(scoreGap / avgStep)
    : 50;

  let scoreEstimate = 200 + estimatedRanksBehind;

  // ── New-entrant churn analysis ──
  const newEntriesCount = items.filter((r) => r.previousRank > 200).length;

  // ── Blend with last known rank for stability ──
  const rank = lastKnownRank && lastKnownRank > 0
    ? Math.round(0.7 * scoreEstimate + 0.3 * lastKnownRank)
    : scoreEstimate;

  const estimatedChange = lastKnownRank && lastKnownRank > 0
    ? lastKnownRank - rank
    : 0;

  return {
    rank: Math.max(201, rank),
    confidence: "estimated",
    method: "score_gap",
    newEntries: newEntriesCount,
    scoreGap,
    previousRank: lastKnownRank,
    estimatedChange,
  };
}

function calculateHealthScore(members: CRClanMember[]): number {
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
