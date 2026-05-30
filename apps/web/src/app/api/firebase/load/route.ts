import { NextResponse } from "next/server";
import { getClanFull, CRApiClientError } from "@/lib/cr-api";
import {
  transformClan,
  transformMembers,
  estimateWarRank,
  type WarRankEstimate,
} from "@/lib/cr-transform";
import type { Achievement } from "@clashmanager/shared";
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
  getLocalWarTrophies,
  getLastRaceKey,
  saveLastRaceKey,
  extractWarHistory,
} from "@/lib/firestore-service";
import { computeAchievements } from "@/lib/achievements";
import { transformToWeeklyStats } from "@/lib/cr-transform";
import type { Member } from "@clashmanager/shared";
import { adminDb } from "@/lib/firebase-admin";

const STALE_AFTER_MS = 60 * 60 * 1000;

async function readFromFirestore(clanTag: string) {
  const [clan, members, rank, storedAchievements, weeklyStats] = await Promise.all([
    getClanFromFirestore(clanTag),
    getMembersFromFirestore(clanTag),
    getLocalWarRank(clanTag),
    getAchievements(clanTag),
    getWeeklyStats(clanTag),
  ]);
  if (!clan) return null;

  // Recompute warParticipation from stored war history in case weeklyStats is stale
  for (const m of members) {
    if (m.totalWars > 0) {
      m.weeklyStats.warParticipation = Math.round((m.warsParticipated / m.totalWars) * 100);
    }
  }

  // Always compute achievements from members, using stored ones as seed
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

  // Check if Firestore has fresh data (skip if force sync)
  if (!force && adminDb) {
    const updatedAt = await getClanUpdatedAt(clanTag);
    if (updatedAt && Date.now() - updatedAt < STALE_AFTER_MS) {
      const cached = await readFromFirestore(clanTag);
      if (cached) {
        return NextResponse.json({ ...cached, cached: true });
      }
    }
  }

  // Fetch fresh data from CR API
  try {
    const { clan, riverRaceLog, currentRiverRace, localWarRanking } = await getClanFull();

    const transformedClan = transformClan(clan);

    // Read stored members for delta + war history
    const storedMembers: Member[] = adminDb ? await getMembersFromFirestore(clan.tag).catch(() => []) : [];
    const prevTrophies = new Map(storedMembers.map(m => [m.playerTag, m.trophies]));
    let warHistory = extractWarHistory(storedMembers);

    // ── Seed initial war history for members without real data ──
    // Si el miembro ya existe en Firestore pero con totalWars=0 (default),
    // también se considera "sin historial real" y se seedea.
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

    // Read last known data from Firestore for the estimator
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

    // Always compute achievements from member data (deterministic)
    const existingAchievements = adminDb ? await getAchievements(clan.tag).catch(() => []) : [];
    const achievements = computeAchievements(transformedMembers, existingAchievements);

    // Compute weekly clan stats from river race log
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

    return NextResponse.json({
      clan: transformedClan,
      members: transformedMembers,
      achievements,
      weeklyStats,
      localWarRank: estimate.rank,
      localWarRankChange: estimate.estimatedChange,
      warRankConfidence: estimate.confidence,
      warRankMethod: estimate.method,
      warRankNewEntries: estimate.newEntries,
    });
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
