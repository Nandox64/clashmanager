import { NextResponse } from "next/server";
import { getRules, getEvents, getLogs, saveRules, saveEvents } from "@/lib/firestore-service";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  const clanTag = process.env.CLAN_TAG;
  if (!clanTag) {
    return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 400 });
  }
  try {
    const [rules, events, logs] = await Promise.all([
      getRules(clanTag),
      getEvents(clanTag),
      getLogs(clanTag),
    ]);
    return NextResponse.json({ rules, events, logs });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!adminDb) {
    return NextResponse.json({ error: "Firebase no disponible" }, { status: 503 });
  }
  const clanTag = process.env.CLAN_TAG;
  if (!clanTag) {
    return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 400 });
  }
  try {
    const body = await request.json();
    if (body.rules) await saveRules(clanTag, body.rules);
    if (body.events) await saveEvents(clanTag, body.events);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
