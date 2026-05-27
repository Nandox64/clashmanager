import { NextResponse } from "next/server";
import { getRuletaConfig, saveRuletaConfig } from "@/lib/firestore-service";
import { adminAuth } from "@/lib/firebase-admin";
import type { RuletaConfig } from "@/lib/firestore-service";

const DEFAULT_CONFIG: RuletaConfig = {
  eventActive: false,
  eventStartedAt: null,
  eventName: "",
  maxWinners: 3,
  passAwarded: false,
  prizeCounts: { "oro-1k": 0, "oro-10k": 0, "gemas-500": 0, "gemas-1200": 0, pass: 0 },
};

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
  if (!clanTag) return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 400 });
  let config = await getRuletaConfig(clanTag);
  if (!config) {
    config = { ...DEFAULT_CONFIG };
    await saveRuletaConfig(clanTag, config).catch(() => {});
  }
  return NextResponse.json(config);
}

export async function POST(request: Request) {
  const clanTag = process.env.CLAN_TAG;
  if (!clanTag) return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 400 });

  const uid = await getUserUid(request);
  if (!uid) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const config = await getRuletaConfig(clanTag);
  const merged: RuletaConfig = {
    ...DEFAULT_CONFIG,
    ...(config ?? {}),
    ...body,
    eventStartedAt: body.eventActive === true ? (body.eventStartedAt ?? Date.now()) : (body.eventActive === false ? null : config?.eventStartedAt ?? null),
  };

  if (body.eventActive === false) {
    merged.passAwarded = false;
    merged.prizeCounts = { "oro-1k": 0, "oro-10k": 0, "gemas-500": 0, "gemas-1200": 0, pass: 0 };
  }

  await saveRuletaConfig(clanTag, merged);
  return NextResponse.json(merged);
}
