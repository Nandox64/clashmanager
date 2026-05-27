import { NextResponse } from "next/server";
import { getRuletaConfig, getRuletaSpin } from "@/lib/firestore-service";
import { adminAuth } from "@/lib/firebase-admin";

async function getUserUid(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    if (token === "mock-mode" || token.startsWith("mock-")) return token.replace("mock-", "");
    if (adminAuth) {
      try { return (await adminAuth.verifyIdToken(token)).uid; } catch { return null; }
    }
  }
  return null;
}

export async function GET(request: Request) {
  const clanTag = process.env.CLAN_TAG;
  if (!clanTag) return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 400 });

  const uid = await getUserUid(request);
  if (!uid) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const config = await getRuletaConfig(clanTag);
  const spin = await getRuletaSpin(clanTag, uid);
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
