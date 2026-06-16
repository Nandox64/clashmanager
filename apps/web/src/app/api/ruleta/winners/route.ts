import { NextResponse } from "next/server";
import { getRuletaWinners } from "@/lib/firestore-service";

export async function GET() {
  const clanTag = process.env.CLAN_TAG;
  if (!clanTag) return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 400 });
  const winners = await getRuletaWinners(clanTag);
  return NextResponse.json(winners);
}
