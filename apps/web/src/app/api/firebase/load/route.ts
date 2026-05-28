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
  getClanFromFirestore,
  getMembersFromFirestore,
  getAchievements,
  getClanUpdatedAt,
  getLocalWarRank,
  getLocalWarTrophies,
} from "@/lib/firestore-service";
import { computeAchievements } from "@/lib/achievements";
import { adminDb } from "@/lib/firebase-admin";

const STALE_AFTER_MS = 60 * 60 * 1000;

async function readFromFirestore(clanTag: string) {
  const [clan, members, rank, achievements] = await Promise.all([
    getClanFromFirestore(clanTag),
    getMembersFromFirestore(clanTag),
    getLocalWarRank(clanTag),
    getAchievements(clanTag),
  ]);
  return clan
    ? { clan, members, achievements, localWarRank: rank, localWarRankChange: 0 }
    : null;
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
    const { clan, currentRiverRace, localWarRanking } = await getClanFull();

    const transformedClan = transformClan(clan);

    // Read stored members for delta computation
    const storedMembers = adminDb ? await getMembersFromFirestore(clan.tag).catch(() => []) : [];
    const prevTrophies = new Map(storedMembers.map(m => [m.playerTag, m.trophies]));
    const transformedMembers = transformMembers(clan.memberList, {
      previousTrophies: prevTrophies,
      currentRaceParticipants: currentRiverRace?.participants,
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

    let achievements: Achievement[] = [];
    if (adminDb) {
      const existingAchievements = await getAchievements(clan.tag).catch(() => []);
      achievements = computeAchievements(transformedMembers, existingAchievements);

      await Promise.all([
        saveClan(transformedClan).catch(() => {}),
        saveMembers(clan.tag, transformedMembers).catch(() => {}),
        saveRiverRaceData(clan.tag, currentRiverRace).catch(() => {}),
        saveLocalWarRank(clan.tag, estimate.rank).catch(() => {}),
        saveLocalWarTrophies(clan.tag, clan.clanWarTrophies).catch(() => {}),
        saveWarRankPrediction(clan.tag, estimate).catch(() => {}),
        saveAchievements(clan.tag, achievements).catch(() => {}),
      ]);
    }

    return NextResponse.json({
      clan: transformedClan,
      members: transformedMembers,
      achievements,
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
