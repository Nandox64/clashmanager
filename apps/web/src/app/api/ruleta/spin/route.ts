import { NextResponse } from "next/server";
import { getRuletaConfig, getRuletaSpin, batchWrite } from "@/lib/firestore-service";
import { getUserUid } from "@/lib/api-utils";
import type { RuletaSpin, RuletaWinner } from "@/lib/firestore-service";

const SEGMENTS = [
  "no-ganar", "oro-1k", "oro-10k", "gemas-500", "gemas-1200", "pass",
];

const PRIZE_LABELS: Record<string, string> = {
  "oro-1k": "Oro $1,000",
  "oro-10k": "Oro $10,000",
  "gemas-500": "Gemas 500",
  "gemas-1200": "Gemas 1200",
  "pass": "Pass Royale",
};

const FREE_WEIGHTS: Record<string, number> = {
  "oro-1k": 22, "oro-10k": 16, "gemas-500": 12, "gemas-1200": 7, "pass": 3, "no-ganar": 40,
};

const EVENT_WEIGHTS: Record<string, number> = {
  "oro-1k": 6, "oro-10k": 5, "gemas-500": 4, "gemas-1200": 2.5, "pass": 0.5, "no-ganar": 82,
};

function pickPrize(config: { prizeCounts: Record<string, number>; passAwarded: boolean; eventActive: boolean }): { prize: string; segmentIndex: number } {
  const weights = config.eventActive ? { ...EVENT_WEIGHTS } : { ...FREE_WEIGHTS };

  // Remove capped prizes in event mode
  if (config.eventActive) {
    if (config.prizeCounts["oro-1k"] >= 3) delete weights["oro-1k"];
    if (config.prizeCounts["oro-10k"] >= 3) delete weights["oro-10k"];
    if (config.prizeCounts["gemas-500"] >= 3) delete weights["gemas-500"];
    if (config.prizeCounts["gemas-1200"] >= 3) delete weights["gemas-1200"];
    if (config.passAwarded) delete weights["pass"];
  }

  // Build weighted segments list
  const segments: { prize: string; weight: number }[] = [];
  for (const seg of SEGMENTS) {
    if (seg === "no-ganar" || weights[seg] !== undefined) {
      segments.push({ prize: seg, weight: seg === "no-ganar" ? weights["no-ganar"] : weights[seg] });
    } else {
      segments.push({ prize: "no-ganar", weight: weights["no-ganar"] });
    }
  }

  const total = segments.reduce((acc, seg) => acc + seg.weight, 0);
  const r = Math.random() * total;
  let acum = 0;
  for (let i = 0; i < segments.length; i++) {
    acum += segments[i].weight;
    if (r <= acum) return { prize: segments[i].prize, segmentIndex: i };
  }
  return { prize: "no-ganar", segmentIndex: 0 };
}

export async function POST(request: Request) {
  const clanTag = process.env.CLAN_TAG;
  if (!clanTag) return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 400 });

  const uid = await getUserUid(request);
  if (!uid) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const displayName = body.displayName || "Anónimo";

  const [rawConfig, prev] = await Promise.all([
    getRuletaConfig(clanTag),
    getRuletaSpin(clanTag, uid),
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

  if (isWin && config.eventActive) {
    const counts = { ...config.prizeCounts };
    if (result.prize === "pass") {
      config.passAwarded = true;
    }
    const pKey = result.prize as keyof typeof counts;
    counts[pKey] = (counts[pKey] || 0) + 1;
    config.prizeCounts = counts;

    operations.push(
      { type: "set", collection: "settings", docId: "ruleta", data: config },
      { type: "set", collection: "ruletaWinners", docId: uid, data: { uid, displayName, prize: result.prize, awardedAt: Date.now() } }
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
