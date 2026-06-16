import "server-only";

import { getClanFull, type CRApiClientError } from "@/lib/cr-api";
import {
  transformClan,
  transformMembers,
  estimateWarRank,
  type WarRankEstimate,
  transformToWeeklyStats,
} from "@/lib/cr-transform";
import type { Achievement, Member, Clan, WeeklyClanStats } from "@clashmanager/shared";
import {
  saveClan,
  saveMembers,
  saveRiverRaceData,
  saveLocalWarRank,
  saveLocalWarRankChange,
  saveLocalWarTrophies,
  saveWarRankPrediction,
  saveAchievements,
  saveWeeklyStats,
  getAchievements,
  getMembersFromFirestore,
  getLocalWarRank,
  getLocalWarTrophies,
  getLastRaceKey,
  saveLastRaceKey,
  extractWarHistory,
} from "@/lib/firestore-service";
import { computeAchievements } from "@/lib/achievements";
import { adminDb } from "@/lib/firebase-admin";
import type { CRClan, CRRiverRaceLog, CRCurrentRiverRace, CRClanWarRankingsResponse } from "@/lib/cr-types";

export interface SyncInput {
  clanTag: string;
  rankFallback?: number;
  changeFallback?: number;
  trophiesFallback?: number;
  awaitPersist?: boolean;
  /** Si se proveen, se usan en vez de iniciar nuevas llamadas (optimización para /load) */
  preloaded?: {
    crApiPromise: Promise<{
      clan: CRClan;
      riverRaceLog: CRRiverRaceLog | null;
      currentRiverRace: CRCurrentRiverRace | null;
      localWarRanking: CRClanWarRankingsResponse | null;
    }>;
    storedMembersPromise: Promise<Member[]>;
    existingAchievementsPromise: Promise<Achievement[]>;
    lastRaceKeyPromise: Promise<string | null>;
  };
}

export interface SyncResult {
  clan: Clan;
  members: Member[];
  achievements: Achievement[];
  weeklyStats: WeeklyClanStats[];
  localWarRank: number | null;
  localWarRankChange: number;
  warRankConfidence: "exact" | "estimated" | "fallback" | "seed";
  warRankMethod: string;
  warRankNewEntries: number;
  localWarTrophies: number | null;
}

interface PersistPayload {
  transformedClan: Clan;
  transformedMembers: Member[];
  currentRiverRace: unknown;
  estimate: WarRankEstimate;
  achievements: Achievement[];
  weeklyStats: WeeklyClanStats[];
}

async function persistToFirestore(clanTag: string, data: PersistPayload) {
  const { transformedClan, transformedMembers, currentRiverRace, estimate, achievements, weeklyStats } = data;
  await Promise.all([
    saveClan(transformedClan).catch(() => {}),
    saveMembers(clanTag, transformedMembers).catch(() => {}),
    saveRiverRaceData(clanTag, currentRiverRace).catch(() => {}),
    saveLocalWarRank(clanTag, estimate.rank).catch(() => {}),
    saveLocalWarRankChange(clanTag, estimate.estimatedChange).catch(() => {}),
    saveLocalWarTrophies(clanTag, transformedClan.stats.clanWarTrophies).catch(() => {}),
    saveWarRankPrediction(clanTag, estimate).catch(() => {}),
    saveAchievements(clanTag, achievements).catch(() => {}),
    saveWeeklyStats(clanTag, weeklyStats).catch(() => {}),
  ]);
}

export async function syncClanData(input: SyncInput): Promise<SyncResult> {
  const { clanTag, rankFallback = 547, changeFallback = -5, trophiesFallback = 2620, awaitPersist = true, preloaded } = input;

  const crApiPromise = preloaded?.crApiPromise ?? getClanFull();
  const storedMembersPromise = preloaded?.storedMembersPromise ?? (adminDb ? getMembersFromFirestore(clanTag).catch(() => []) : Promise.resolve([]));
  const existingAchievementsPromise = preloaded?.existingAchievementsPromise ?? (adminDb ? getAchievements(clanTag).catch(() => []) : Promise.resolve([]));
  const lastRaceKeyPromise = preloaded?.lastRaceKeyPromise ?? (adminDb ? getLastRaceKey(clanTag).catch(() => null) : Promise.resolve(null));

  const [crData, storedMembers, existingAchievements, lastKey] = await Promise.all([
    crApiPromise,
    storedMembersPromise,
    existingAchievementsPromise,
    lastRaceKeyPromise,
  ]);

  const { clan, riverRaceLog, currentRiverRace, localWarRanking } = crData;

  const transformedClan = transformClan(clan);

  const prevTrophies = new Map(storedMembers.map(m => [m.playerTag, m.trophies]));
  let warHistory = extractWarHistory(storedMembers);

  for (const member of clan.memberList) {
    const hist = warHistory.get(member.tag);
    if (!hist || hist.totalWars === 0) {
      warHistory.set(member.tag, { totalWars: 20, warsParticipated: 17 });
    }
  }

  const latestRace = riverRaceLog?.items?.[0];
  if (latestRace && adminDb) {
    const raceKey = `${latestRace.seasonId}_${latestRace.sectionIndex}`;
    const lastKeyResolved = lastKey ?? (await getLastRaceKey(clan.tag).catch(() => null));

    if (raceKey !== lastKeyResolved) {
      const participants = currentRiverRace?.participants ?? [];
      const participantTags = new Set(participants.map(p => p.tag));

      const updatedHistory = new Map(warHistory);
      for (const member of clan.memberList) {
        const prev = updatedHistory.get(member.tag) ?? { totalWars: 0, warsParticipated: 0 };
        updatedHistory.set(member.tag, {
          totalWars: prev.totalWars + 1,
          warsParticipated: prev.warsParticipated + (participantTags.has(member.tag) ? 1 : 0),
        });
      }
      warHistory = updatedHistory;

      await saveLastRaceKey(clan.tag, raceKey).catch(() => {});
    }
  }

  const transformedMembers = transformMembers(clan.memberList, {
    previousTrophies: prevTrophies,
    currentRaceParticipants: currentRiverRace?.participants,
    warHistory,
  });

  const [storedRank, storedTrophies] = await Promise.all([
    getLocalWarRank(clan.tag).catch(() => null),
    getLocalWarTrophies(clan.tag).catch(() => null),
  ]);

  const estimate: WarRankEstimate = estimateWarRank(
    localWarRanking,
    clan.tag,
    clan.clanWarTrophies,
    storedRank ?? rankFallback,
    changeFallback,
    storedTrophies ?? trophiesFallback,
  );

  const achievements = computeAchievements(transformedMembers, existingAchievements);

  const weeklyStats = riverRaceLog
    ? transformToWeeklyStats(clan, riverRaceLog)
    : [];

  const persistPromise = adminDb
    ? persistToFirestore(clanTag, {
        transformedClan,
        transformedMembers,
        currentRiverRace,
        estimate,
        achievements,
        weeklyStats,
      })
    : Promise.resolve();

  if (awaitPersist) {
    await persistPromise;
  } else {
    persistPromise.catch(() => {});
  }

  return {
    clan: transformedClan,
    members: transformedMembers,
    achievements,
    weeklyStats,
    localWarRank: estimate.rank,
    localWarRankChange: estimate.estimatedChange,
    warRankConfidence: estimate.confidence,
    warRankMethod: estimate.method,
    warRankNewEntries: estimate.newEntries,
    localWarTrophies: clan.clanWarTrophies,
  };
}
