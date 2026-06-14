import { NextResponse } from "next/server";
import { getClanFull, CRApiClientError } from "@/lib/cr-api";
import {
  transformClan,
  transformMembers,
  estimateWarRank,
  type WarRankEstimate,
} from "@/lib/cr-transform";
import {
  saveClan,
  saveMembers,
  saveRiverRaceData,
  saveLocalWarRank,
  saveLocalWarTrophies,
  saveWarRankPrediction,
  saveAchievements,
  saveWeeklyStats,
  getAchievements,
  getLocalWarRank,
  getLocalWarTrophies,
  getMembersFromFirestore,
  getLastRaceKey,
  saveLastRaceKey,
  extractWarHistory,
} from "@/lib/firestore-service";
import { computeAchievements } from "@/lib/achievements";
import { transformToWeeklyStats } from "@/lib/cr-transform";
import type { Member } from "@clashmanager/shared";
import { adminDb } from "@/lib/firebase-admin";
import { getUserUid } from "@/lib/api-utils";

async function sync() {
  const { clan, riverRaceLog, currentRiverRace, localWarRanking } = await getClanFull();

  const transformedClan = transformClan(clan);

  const storedMembers: Member[] = adminDb ? await getMembersFromFirestore(clan.tag).catch(() => []) : [];
  const prevTrophies = new Map(storedMembers.map(m => [m.playerTag, m.trophies]));
  let warHistory = extractWarHistory(storedMembers);

  // ── Seed initial war history for members without real data ──
  for (const member of clan.memberList) {
    const hist = warHistory.get(member.tag);
    if (!hist || hist.totalWars === 0) {
      warHistory.set(member.tag, { totalWars: 20, warsParticipated: 17 });
    }
  }

  // ── Detect new river race and accumulate war participation ──
  const latestRace = riverRaceLog?.items?.[0];
  if (latestRace && adminDb) {
    const raceKey = `${latestRace.seasonId}_${latestRace.sectionIndex}`;
    const lastKey = await getLastRaceKey(clan.tag).catch(() => null);

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

  const [storedRank, storedTrophies] = await Promise.all([
    getLocalWarRank(clan.tag).catch(() => null),
    getLocalWarTrophies(clan.tag).catch(() => null),
  ]);

  const estimate: WarRankEstimate = estimateWarRank(
    localWarRanking,
    clan.tag,
    clan.clanWarTrophies,
    storedRank ?? (Number(process.env.CLAN_WAR_RANK_FALLBACK) || 547),
    Number(process.env.CLAN_WAR_CHANGE_FALLBACK) || -5,
    storedTrophies ?? (Number(process.env.CLAN_WAR_TROPHIES_FALLBACK) || 2620),
  );

  const existingAchievements = adminDb ? await getAchievements(clan.tag).catch(() => []) : [];
  const achievements = computeAchievements(transformedMembers, existingAchievements);

  const weeklyStats = riverRaceLog
    ? transformToWeeklyStats(clan, riverRaceLog)
    : [];

  if (adminDb) {
    await Promise.all([
      saveClan(transformedClan).catch(() => {}),
      saveMembers(clan.tag, transformedMembers).catch(() => {}),
      saveRiverRaceData(clan.tag, currentRiverRace).catch(() => {}),
      saveLocalWarRank(clan.tag, estimate.rank).catch(() => {}),
      saveLocalWarTrophies(clan.tag, clan.clanWarTrophies).catch(() => {}),
      saveWarRankPrediction(clan.tag, estimate).catch(() => {}),
      saveAchievements(clan.tag, achievements).catch(() => {}),
      saveWeeklyStats(clan.tag, weeklyStats).catch(() => {}),
    ]);
  }

  return {
    clan: transformedClan.name,
    members: transformedMembers.length,
    localWarRank: estimate.rank,
    warRankMethod: estimate.method,
    newEntries: estimate.newEntries,
  };
}

export async function POST(request: Request) {
  const uid = await getUserUid(request);
  if (!uid) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  try {
    const result = await sync();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    if (err instanceof CRApiClientError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const msg = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const uid = await getUserUid(request);
  if (!uid) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  try {
    const result = await sync();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    if (err instanceof CRApiClientError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const msg = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
