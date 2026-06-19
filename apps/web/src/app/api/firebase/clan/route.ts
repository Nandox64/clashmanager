import { NextResponse } from "next/server";
import {
  getClanFromFirestore,
  getMembersFromFirestore,
  getClanWarSettings,
} from "@/lib/firestore-service";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  const clanTag = process.env.CLAN_TAG;
  if (!clanTag) {
    return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 400 });
  }

  if (!adminDb) {
    return NextResponse.json({ error: "Firebase Admin no inicializado" }, { status: 500 });
  }

  const [clan, members, warSettings] = await Promise.all([
    getClanFromFirestore(clanTag),
    getMembersFromFirestore(clanTag),
    getClanWarSettings(clanTag),
  ]);

  if (!clan) {
    return NextResponse.json(
      {
        error: `Clan ${clanTag} no encontrado en Firestore. Haz POST a /api/firebase/sync primero`,
        debug: { clanTag, adminDbReady: !!adminDb },
      },
      { status: 404 }
    );
  }

  return NextResponse.json({ clan, members, localWarRank: warSettings.localWarRank });
}
