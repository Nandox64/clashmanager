import { NextResponse } from "next/server";
import { getClanFromFirestore, getMembersFromFirestore, getAchievements, getWeeklyStats, getWeeklySnapshots, getClanWarSettings, saveAchievements } from "@/lib/firestore-service";
import { computeAchievements } from "@/lib/achievements";
import { adminDb } from "@/lib/firebase-admin";
import { syncClanData } from "@/lib/clan-sync";

/** Si la data en Firestore tiene más de 30 min, se refresca en background */
const STALE_MS = 30 * 60 * 1000;

export async function GET() {
  try {
    const clanTag = process.env.CLAN_TAG;
    if (!clanTag) {
      return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Firebase no disponible" }, { status: 503 });
    }

    const [clan, members, warSettings, storedAchievements, weeklyStats, weeklySnapshots] = await Promise.all([
      getClanFromFirestore(clanTag),
      getMembersFromFirestore(clanTag),
      getClanWarSettings(clanTag),
      getAchievements(clanTag),
      getWeeklyStats(clanTag),
      getWeeklySnapshots(clanTag),
    ]);

    if (!clan) {
      return NextResponse.json({ error: "No hay datos en caché. Usa force sync." }, { status: 404 });
    }

    const now = Date.now();
    for (const m of members) {
      if (m.totalWars > 0) {
        m.weeklyStats.warParticipation = Math.round((m.warsParticipated / m.totalWars) * 100);
      }
      const daysSinceActive = (now - m.lastActiveAt) / 86400000;
      m.status = daysSinceActive > 10 ? "inactive" : daysSinceActive > 5 ? "risk" : "active";
      m.weeklyStats.donationsGiven = m.donations;
    }

    const achievements = computeAchievements(members, storedAchievements);
    saveAchievements(clanTag, achievements).catch((e) => console.error("init: saveAchievements failed:", e));

    // ── Refrescar en background si data está stale ──
    const updatedAt = (clan as { updatedAt?: number })?.updatedAt ?? 0;
    const stale = now - updatedAt > STALE_MS;

    if (stale && adminDb) {
      syncClanData({ clanTag, awaitPersist: false }).catch((e) =>
        console.error("init: background sync failed:", e)
      );
    }

    return NextResponse.json({
      clan,
      members,
      achievements,
      weeklyStats,
      weeklySnapshots,
      localWarRank: warSettings.localWarRank,
      localWarRankChange: warSettings.localWarRankChange,
      localWarTrophies: warSettings.localWarTrophies,
      stale,
    });
  } catch (err) {
    console.error("init: unhandled error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}
