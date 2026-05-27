import { NextResponse } from "next/server";
import { getClanFull } from "@/lib/cr-api";
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
  saveWarRankPrediction,
  getLocalWarRank,
} from "@/lib/firestore-service";
import { CRApiClientError } from "@/lib/cr-api";

async function sync() {
  const { clan, riverRaceLog, currentRiverRace, localWarRanking } = await getClanFull();

  const transformedClan = transformClan(clan);
  const transformedMembers = transformMembers(clan.memberList);

  const storedRank = await getLocalWarRank(clan.tag).catch(() => null);

  const estimate: WarRankEstimate = estimateWarRank(
    localWarRanking,
    clan.tag,
    clan.clanWarTrophies,
    storedRank ?? (Number(process.env.CLAN_WAR_RANK_FALLBACK) || null),
    0
  );

  await saveClan(transformedClan);
  await saveMembers(clan.tag, transformedMembers);
  await saveRiverRaceData(clan.tag, currentRiverRace);
  await saveLocalWarRank(clan.tag, estimate.rank);
  await saveWarRankPrediction(clan.tag, estimate);

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
