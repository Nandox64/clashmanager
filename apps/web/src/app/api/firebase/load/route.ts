import { NextResponse } from "next/server";
import { getClanFull, CRApiClientError } from "@/lib/cr-api";
import {
  transformClan,
  transformMembers,
  estimateWarRank,
  type WarRankEstimate,
} from "@/lib/cr-transform";
import type { Achievement, Member, Clan, WeeklyClanStats } from "@clashmanager/shared";
import {
  saveClan,
  saveMembers,
  saveRiverRaceData,
  saveLocalWarRank,
  saveLocalWarTrophies,
  saveWarRankPrediction,
  saveAchievements,
  saveWeeklyStats,
  getClanFromFirestore,
  getMembersFromFirestore,
  getAchievements,
  getWeeklyStats,
  getClanUpdatedAt,
  getLocalWarRank,
  getLastRaceKey,
  saveLastRaceKey,
  extractWarHistory,
} from "@/lib/firestore-service";
import { computeAchievements } from "@/lib/achievements";
import { transformToWeeklyStats } from "@/lib/cr-transform";
import { adminDb } from "@/lib/firebase-admin";

const CACHE_FRESH_MS = 5 * 60 * 1000;

let backgroundSyncInFlight = false;

async function readFromFirestore(clanTag: string) {
  const [clan, members, rank, storedAchievements, weeklyStats] = await Promise.all([
    getClanFromFirestore(clanTag),
    getMembersFromFirestore(clanTag),
    getLocalWarRank(clanTag),
    getAchievements(clanTag),
    getWeeklyStats(clanTag),
  ]);
  if (!clan) return null;

  const now = Date.now();
  for (const m of members) {
    if (m.totalWars > 0) {
      m.weeklyStats.warParticipation = Math.round((m.warsParticipated / m.totalWars) * 100);
    }
    const daysSinceActive = (now - m.lastActiveAt) / 86400000;
    m.status = daysSinceActive > 10 ? "inactive" : daysSinceActive > 5 ? "risk" : "active";
  }

  const achievements = computeAchievements(members, storedAchievements);
  return { clan, members, achievements, weeklyStats, localWarRank: rank, localWarRankChange: 0 };
}

export async function GET(request: Request) {
  const clanTag = process.env.CLAN_TAG;
  if (!clanTag) {
    return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "1";
  const useCache = searchParams.get("use_cache") === "1";

  if (force) {
    return syncFromApi(clanTag);
  }

  // Iniciar en paralelo la lectura de caché y las llamadas a la API/Firestore
  const cachePromise = adminDb ? readFromFirestore(clanTag) : Promise.resolve(null);
  const crApiPromise = getClanFull();
  const storedMembersPromise = adminDb ? getMembersFromFirestore(clanTag).catch(() => []) : Promise.resolve([]);
  const existingAchievementsPromise = adminDb ? getAchievements(clanTag).catch(() => []) : Promise.resolve([]);
  const lastRaceKeyPromise = adminDb ? getLastRaceKey(clanTag).catch(() => null) : Promise.resolve(null);

  const cached = await cachePromise;

  if (cached) {
    const updatedAt = (cached.clan as { updatedAt?: number })?.updatedAt ?? 0;
    const fresh = Date.now() - updatedAt < CACHE_FRESH_MS;

    if (useCache) {
      // ?use_cache=1: devuelve Firestore cache siempre que exista sin importar edad.
      // Dispara sync en background si está stale.
      if (!fresh && !backgroundSyncInFlight) {
        backgroundSyncInFlight = true;
        handleBackgroundSync(clanTag, crApiPromise, storedMembersPromise, existingAchievementsPromise, lastRaceKeyPromise);
      }
      return NextResponse.json({ ...cached, cached: true, stale: !fresh });
    }

    // Comportamiento por defecto (stale-while-revalidate)
    if (fresh) {
      return NextResponse.json({ ...cached, cached: true, stale: false });
    } else {
      if (!backgroundSyncInFlight) {
        backgroundSyncInFlight = true;
        handleBackgroundSync(clanTag, crApiPromise, storedMembersPromise, existingAchievementsPromise, lastRaceKeyPromise);
      }
      return NextResponse.json({ ...cached, cached: true, stale: true });
    }
  }

  // Si no hay caché, realizamos la sincronización en primer plano usando las promesas ya iniciadas
  return syncFromApiWithPromises(clanTag, crApiPromise, storedMembersPromise, existingAchievementsPromise, lastRaceKeyPromise);
}

async function handleBackgroundSync(
  clanTag: string,
  crApiPromise: ReturnType<typeof getClanFull>,
  storedMembersPromise: Promise<Member[]>,
  existingAchievementsPromise: Promise<Achievement[]>,
  lastRaceKeyPromise: Promise<string | null>
) {
  try {
    await syncFromApiWithPromises(
      clanTag,
      crApiPromise,
      storedMembersPromise,
      existingAchievementsPromise,
      lastRaceKeyPromise
    );
  } catch (err) {
    console.error("Error in background sync:", err);
  } finally {
    backgroundSyncInFlight = false;
  }
}

async function syncFromApi(clanTag: string) {
  const crApiPromise = getClanFull();
  const storedMembersPromise = adminDb ? getMembersFromFirestore(clanTag).catch(() => []) : Promise.resolve([]);
  const existingAchievementsPromise = adminDb ? getAchievements(clanTag).catch(() => []) : Promise.resolve([]);
  const lastRaceKeyPromise = adminDb ? getLastRaceKey(clanTag).catch(() => null) : Promise.resolve(null);

  return syncFromApiWithPromises(
    clanTag,
    crApiPromise,
    storedMembersPromise,
    existingAchievementsPromise,
    lastRaceKeyPromise
  );
}

async function syncFromApiWithPromises(
  clanTag: string,
  crApiPromise: ReturnType<typeof getClanFull>,
  storedMembersPromise: Promise<Member[]>,
  existingAchievementsPromise: Promise<Achievement[]>,
  lastRaceKeyPromise: Promise<string | null>
) {
  try {
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

      if (raceKey !== lastKey) {
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

    const estimate: WarRankEstimate = estimateWarRank(
      localWarRanking,
      clan.tag,
      clan.clanWarTrophies,
      Number(process.env.CLAN_WAR_RANK_FALLBACK) || 460,
      Number(process.env.CLAN_WAR_CHANGE_FALLBACK) || -5,
      Number(process.env.CLAN_WAR_TROPHIES_FALLBACK) || 2720,
    );

    const achievements = computeAchievements(transformedMembers, existingAchievements);

    const weeklyStats = riverRaceLog
      ? transformToWeeklyStats(clan, riverRaceLog)
      : [];

    const responseData = {
      clan: transformedClan,
      members: transformedMembers,
      achievements,
      weeklyStats,
      localWarRank: estimate.rank,
      localWarRankChange: estimate.estimatedChange,
      warRankConfidence: estimate.confidence,
      warRankMethod: estimate.method,
      warRankNewEntries: estimate.newEntries,
    };

    // Guardado en Firestore en background
    if (adminDb) {
      persistToFirestore(clanTag, {
        transformedClan,
        transformedMembers,
        currentRiverRace,
        estimate,
        achievements,
        weeklyStats,
      }).catch(() => {});
    }

    return NextResponse.json(responseData);
  } catch (err) {
    if (adminDb) {
      const cached = await readFromFirestore(clanTag);
      if (cached) {
        return NextResponse.json({ ...cached, cached: true });
      }
    }

    if (err instanceof CRApiClientError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const msg = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
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
    saveLocalWarTrophies(clanTag, transformedClan.stats.clanWarTrophies).catch(() => {}),
    saveWarRankPrediction(clanTag, estimate).catch(() => {}),
    saveAchievements(clanTag, achievements).catch(() => {}),
    saveWeeklyStats(clanTag, weeklyStats).catch(() => {}),
  ]);
}
