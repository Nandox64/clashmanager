import { NextResponse } from "next/server";
import { clearRuletaWinners, clearRuletaSpins, saveRuletaConfig } from "@/lib/firestore-service";
import { getUserUid } from "@/lib/api-utils";

const DEFAULT_CONFIG = {
  eventActive: false,
  eventName: "",
  maxWinners: 3,
  prizeCounts: { "oro-1k": 0, "oro-10k": 0, "gemas-500": 0, "gemas-1200": 0, pass: 0 },
  passAwarded: false,
  eventStartedAt: null,
};

export async function POST(request: Request) {
  const clanTag = process.env.CLAN_TAG;
  if (!clanTag) return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 400 });

  const uid = await getUserUid(request);
  if (!uid) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  await Promise.all([
    clearRuletaWinners(clanTag),
    clearRuletaSpins(clanTag),
    saveRuletaConfig(clanTag, DEFAULT_CONFIG),
  ]);

  return NextResponse.json({ ok: true });
}
