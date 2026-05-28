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
  getClanFromFirestore,
  getMembersFromFirestore,
  getClanUpdatedAt,
  getLocalWarRank,
  getLocalWarTrophies,
} from "@/lib/firestore-service";
import { adminDb } from "@/lib/firebase-admin";

const STALE_AFTER_MS = 15 * 60 * 1000;

async function readFromFirestore(clanTag: string) {
  const [clan, members, rank] = await Promise.all([
    getClanFromFirestore(clanTag),
    getMembersFromFirestore(clanTag),
    getLocalWarRank(clanTag),
  ]);
  return clan
    ? { clan, members, localWarRank: rank, localWarRankChange: 0 }
    : null;
}

export async function GET() {
  const clanTag = process.env.CLAN_TAG;
  if (!clanTag) {
    return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 400 });
  }

  // Check if Firestore has fresh data
  if (adminDb) {
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
      storedRank ?? (Number(process.env.CLAN_WAR_RANK_FALLBACK) || null),
      Number(process.env.CLAN_WAR_CHANGE_FALLBACK) || 0,
      storedTrophies ?? (Number(process.env.CLAN_WAR_TROPHIES_FALLBACK) || null),
    );

    if (adminDb) {
      await Promise.all([
        saveClan(transformedClan).catch(() => {}),
        saveMembers(clan.tag, transformedMembers).catch(() => {}),
        saveRiverRaceData(clan.tag, currentRiverRace).catch(() => {}),
        saveLocalWarRank(clan.tag, estimate.rank).catch(() => {}),
        saveLocalWarTrophies(clan.tag, clan.clanWarTrophies).catch(() => {}),
        saveWarRankPrediction(clan.tag, estimate).catch(() => {}),
      ]);
    }

    return NextResponse.json({
      clan: transformedClan,
      members: transformedMembers,
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
