import { NextResponse } from "next/server";
import { getLogs, getClanScaling, getClanWarSettings, saveClanWarSettings, saveClanScaling } from "@/lib/firestore-service";
import { adminDb } from "@/lib/firebase-admin";
import { getUserUid } from "@/lib/api-utils";

export async function GET() {
  const clanTag = process.env.CLAN_TAG;
  if (!clanTag) {
    return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 400 });
  }
  try {
    const [logs, scaling, warSettings] = await Promise.all([
      getLogs(clanTag),
      getClanScaling(clanTag),
      getClanWarSettings(clanTag),
    ]);
    return NextResponse.json({ logs, scaling, warRank: warSettings.localWarRank, warRankChange: warSettings.localWarRankChange });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!adminDb) {
    return NextResponse.json({ error: "Firebase no disponible" }, { status: 503 });
  }
  const uid = await getUserUid(request);
  if (!uid) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const clanTag = process.env.CLAN_TAG;
  if (!clanTag) {
    return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 400 });
  }
  try {
    const body = await request.json();

    if (body.warRank !== undefined || body.warRankChange !== undefined) {
      await saveClanWarSettings(clanTag, {
        localWarRank: body.warRank,
        localWarRankChange: body.warRankChange,
      });
    }
    if (body.scaling) {
      await saveClanScaling(clanTag, body.scaling);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
