import { NextResponse } from "next/server";
import { getRecruits, saveRecruits } from "@/lib/firestore-service";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  const clanTag = process.env.CLAN_TAG;
  if (!clanTag) {
    return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 400 });
  }
  try {
    const recruits = await getRecruits(clanTag);
    return NextResponse.json({ recruits });
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
    const current = await getRecruits(clanTag);
    const updated = body.recruits as typeof current;
    await saveRecruits(clanTag, updated);
    return NextResponse.json({ success: true, recruits: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
