import { NextResponse } from "next/server";
import { getRuletaConfig, getRuletaSpin, getRuletaWinners, getUserWins } from "@/lib/firestore-service";
import { getUserUid } from "@/lib/api-utils";

export async function GET(request: Request) {
  try {
    const clanTag = process.env.CLAN_TAG;
    if (!clanTag) {
      console.error("[Ruleta] CLAN_TAG no configurado en el servidor");
      return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 400 });
    }

    const uidPromise = getUserUid(request).catch(() => null);

    const [config, winners] = await Promise.all([
      getRuletaConfig(clanTag),
      getRuletaWinners(clanTag),
    ]);

    const uid = await uidPromise;

    let spin = null;
    let spinsRemaining = 0;
    let won = false;
    let prize: string | null = null;
    let myWins: any[] = [];

    if (uid) {
      spin = await getRuletaSpin(clanTag, uid).catch(() => null);
      myWins = await getUserWins(clanTag, uid, 3).catch(() => []);
    }

    const eventActive = config?.eventActive ?? false;

    if (!eventActive) {
      spinsRemaining = -1;
    } else if (spin) {
      if (spin.eventStartedAt !== config?.eventStartedAt) {
        spinsRemaining = 2;
      } else {
        won = spin.won;
        prize = spin.prize;
        spinsRemaining = spin.won ? 0 : Math.max(0, 2 - spin.spinsUsed);
      }
    } else {
      spinsRemaining = 2;
    }

    return NextResponse.json({
      config,
      state: { eventActive, spinsRemaining, won, prize },
      winners,
      myWins,
    });
  } catch (err) {
    console.error("[Ruleta] Error en init route:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
