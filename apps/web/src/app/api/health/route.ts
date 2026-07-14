import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getClanFull } from "@/lib/cr-api";

export async function GET() {
  const checks: Record<string, unknown> = {};

  // 1. Firebase Admin SDK
  checks.firebaseAdmin = !!adminDb;

  // 2. Firestore conectividad
  if (adminDb) {
    try {
      const clanTag = process.env.CLAN_TAG;
      if (clanTag) {
        const ref = adminDb.collection("clans").doc(clanTag.replace("#", "").toUpperCase());
        const snap = await ref.get();
        checks.firestoreReachable = true;
        checks.firestoreHasData = snap.exists;
        if (snap.exists) {
          const data = snap.data();
          checks.updatedAt = data?.updatedAt ?? null;
          checks.lastRaceKey = data?.lastRaceKey ?? null;
          checks.memberCount = data?.memberCount ?? null;
        }
      } else {
        checks.firestoreReachable = false;
        checks.firestoreError = "CLAN_TAG no configurado";
      }
    } catch (e) {
      checks.firestoreReachable = false;
      checks.firestoreError = e instanceof Error ? e.message : String(e);
    }
  }

  // 3. CR API token
  checks.crApiTokenConfigured = !!process.env.CR_API_TOKEN;

  // 4. Gemini API
  checks.geminiApiConfigured = !!process.env.GEMINI_API_KEY;

  // 5. Groq API
  checks.groqApiConfigured = !!process.env.GROQ_API_KEY;

  const healthy = checks.firebaseAdmin && checks.firestoreReachable;

  return NextResponse.json({ status: healthy ? "ok" : "degraded", checks, timestamp: Date.now() });
}
