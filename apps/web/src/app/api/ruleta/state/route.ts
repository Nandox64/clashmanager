import { NextResponse } from "next/server";
import { getRuletaConfig, getRuletaSpin } from "@/lib/firestore-service";
import { getUserUid } from "@/lib/api-utils";

export async function GET(request: Request) {
  const clanTag = process.env.CLAN_TAG;
  if (!clanTag) return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 400 });

  const uid = await getUserUid(request);
  if (!uid) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const [config, spin] = await Promise.all([
    getRuletaConfig(clanTag),
    getRuletaSpin(clanTag, uid),
  ]);
  const eventActive = config?.eventActive ?? false;

  let spinsRemaining = 0;
  let won = false;
  let prize: string | null = null;

  if (!eventActive) {
    spinsRemaining = -1; // free mode: unlimited
  } else if (spin) {
    if (spin.eventStartedAt !== config?.eventStartedAt) {
      // new event, reset
      spinsRemaining = 2;
      won = false;
      prize = null;
    } else {
      won = spin.won;
      prize = spin.prize;
      spinsRemaining = spin.won ? 0 : Math.max(0, 2 - spin.spinsUsed);
    }
  } else {
    spinsRemaining = 2;
  }

  return NextResponse.json({ eventActive, spinsRemaining, won, prize });
}
