import { NextResponse } from "next/server";
import { getRuletaConfig, getRuletaSpin, getUserWins, batchWrite } from "@/lib/firestore-service";
import { getUserUid } from "@/lib/api-utils";
import { pickPrize, PRIZE_LABELS } from "@/lib/ruleta-prize";
import type { RuletaSpin } from "@/lib/firestore-service";

export async function POST(request: Request) {
  const clanTag = process.env.CLAN_TAG;
  if (!clanTag) return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 400 });

  const uid = await getUserUid(request);
  if (!uid) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const displayName = body.displayName || "Anónimo";

  const [rawConfig, prev, userWins] = await Promise.all([
    getRuletaConfig(clanTag),
    getRuletaSpin(clanTag, uid),
    getUserWins(clanTag, uid),
  ]);

  let config = rawConfig;
  if (!config) {
    // Default config for free mode — no event active
    config = { eventActive: false, eventName: "", maxWinners: 3, prizeCounts: { "oro-1k": 0, "oro-10k": 0, "gemas-500": 0, "gemas-1200": 0, pass: 0 }, passAwarded: false, eventStartedAt: null };
  }
  const isNewEvent = !prev || prev.eventStartedAt !== config.eventStartedAt;

  if (config.eventActive) {
    const spinsUsed = isNewEvent ? 0 : prev.spinsUsed;
    const alreadyWon = !isNewEvent && prev.won;
    if (alreadyWon) return NextResponse.json({ error: "Ya ganaste un premio en este evento" }, { status: 400 });
    if (spinsUsed >= 2) return NextResponse.json({ error: "Ya usaste tus 2 tiros" }, { status: 400 });
  }

  // Check global max winners
  const totalWinners = Object.values(config.prizeCounts).reduce((a, b) => a + b, 0);
  if (config.eventActive && totalWinners >= config.maxWinners) {
    return NextResponse.json({ prize: "no-ganar", label: "No ganaste", segmentIndex: 0 });
  }

  const result = pickPrize(config);
  const isWin = result.prize !== "no-ganar";

  // Save spin
  const spin: RuletaSpin = {
    displayName,
    eventStartedAt: config.eventStartedAt,
    won: isWin,
    prize: isWin ? result.prize : null,
    spinsUsed: isNewEvent ? 1 : prev.spinsUsed + 1,
    lastSpinAt: Date.now(),
  };

  const operations: import("@/lib/firestore-service").BatchOperation[] = [
    { type: "set", collection: "ruletaSpins", docId: uid, data: spin },
  ];

  if (isWin) {
    const outOfCompetition = !config.eventActive;

    // If user already has 3 wins, delete the oldest to make room
    if (userWins.length >= 3) {
      const sorted = [...userWins].sort((a, b) => a.awardedAt - b.awardedAt);
      const toRemove = sorted.slice(0, sorted.length - 2);
      for (const old of toRemove) {
        if (old.id) {
          operations.push(
            { type: "delete", collection: "ruletaWinners", docId: old.id }
          );
        }
      }
    }

    if (config.eventActive) {
      const counts = { ...config.prizeCounts };
      if (result.prize === "pass") {
        config.passAwarded = true;
      }
      const pKey = result.prize as keyof typeof counts;
      counts[pKey] = (counts[pKey] || 0) + 1;
      config.prizeCounts = counts;

      operations.push(
        { type: "set", collection: "settings", docId: "ruleta", data: config },
      );
    }

    operations.push(
      { type: "set", collection: "ruletaWinners", docId: `${uid}_${Date.now()}`, data: { uid, displayName, prize: result.prize, awardedAt: Date.now(), outOfCompetition } }
    );
  }

  await batchWrite(clanTag, operations);

  return NextResponse.json({
    prize: result.prize,
    label: isWin ? (PRIZE_LABELS[result.prize] || result.prize) : "No ganaste",
    segmentIndex: result.segmentIndex,
    won: isWin,
  });
}
