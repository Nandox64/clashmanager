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
  getAchievements,
  getLocalWarRank,
  getLocalWarTrophies,
  getMembersFromFirestore,
} from "@/lib/firestore-service";
import { computeAchievements } from "@/lib/achievements";
import { adminDb } from "@/lib/firebase-admin";

async function sync() {
  const { clan, riverRaceLog, currentRiverRace, localWarRanking } = await getClanFull();

  const transformedClan = transformClan(clan);

  const storedMembers = adminDb ? await getMembersFromFirestore(clan.tag).catch(() => []) : [];
  const prevTrophies = new Map(storedMembers.map(m => [m.playerTag, m.trophies]));
  const transformedMembers = transformMembers(clan.memberList, {
    previousTrophies: prevTrophies,
    currentRaceParticipants: currentRiverRace?.participants,
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

  if (adminDb) {
    const existingAchievements = await getAchievements(clan.tag).catch(() => []);
    const achievements = computeAchievements(transformedMembers, existingAchievements);

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

  return {
    clan: transformedClan.name,
    members: transformedMembers.length,
    localWarRank: estimate.rank,
    warRankMethod: estimate.method,
    newEntries: estimate.newEntries,
  };
}

export async function POST() {
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

export async function GET() {
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
