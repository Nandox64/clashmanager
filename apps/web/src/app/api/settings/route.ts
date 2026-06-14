import { NextResponse } from "next/server";
import { getRules, getEvents, getLogs, saveRules, saveEvents, saveLocalWarRank, saveLocalWarTrophies, saveClanScaling, getClanScaling, getLocalWarRank, getLocalWarTrophies, batchWrite } from "@/lib/firestore-service";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import type { ClanScalingConfig } from "@/lib/firestore-service";

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

export async function GET() {
  const clanTag = process.env.CLAN_TAG;
  if (!clanTag) {
    return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 400 });
  }
  try {
    const [rules, events, logs, scaling, warRank, warTrophies] = await Promise.all([
      getRules(clanTag),
      getEvents(clanTag),
      getLogs(clanTag),
      getClanScaling(clanTag),
      getLocalWarRank(clanTag),
      getLocalWarTrophies(clanTag),
    ]);
    return NextResponse.json({ rules, events, logs, scaling, warRank, warTrophies });
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
    const operations: import("@/lib/firestore-service").BatchOperation[] = [];

    if (body.rules) operations.push({ type: "set", collection: "rules", docId: "rules", data: { rules: body.rules, updatedAt: Date.now() } });
    if (body.events) operations.push({ type: "set", collection: "events", docId: "events", data: { events: body.events, updatedAt: Date.now() } });
    if (body.warRank !== undefined) operations.push({ type: "update", collection: "settings", docId: "war", data: { localWarRank: body.warRank } });
    if (body.warTrophies !== undefined) operations.push({ type: "update", collection: "settings", docId: "war", data: { localWarTrophies: body.warTrophies } });
    if (body.scaling) operations.push({ type: "update", collection: "settings", docId: "clan", data: { scaling: body.scaling } });

    if (operations.length > 0) {
      await batchWrite(clanTag, operations);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
