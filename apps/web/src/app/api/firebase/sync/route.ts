import { NextResponse } from "next/server";
import { CRApiClientError } from "@/lib/cr-api";
import { syncClanData } from "@/lib/clan-sync";
import { getUserUid } from "@/lib/api-utils";

export async function POST(request: Request) {
  const uid = await getUserUid(request);
  if (!uid) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  try {
    const result = await syncClanData({ clanTag: process.env.CLAN_TAG! });
    return NextResponse.json({
      success: true,
      clan: result.clan.name,
      members: result.members.length,
      localWarRank: result.localWarRank,
      warRankMethod: result.warRankMethod,
      newEntries: result.warRankNewEntries,
    });
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
    const result = await syncClanData({ clanTag: process.env.CLAN_TAG! });
    return NextResponse.json({
      success: true,
      clan: result.clan.name,
      members: result.members.length,
      localWarRank: result.localWarRank,
      warRankMethod: result.warRankMethod,
      newEntries: result.warRankNewEntries,
    });
  } catch (err) {
    if (err instanceof CRApiClientError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const msg = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
