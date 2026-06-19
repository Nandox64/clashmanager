import { NextResponse } from "next/server";
import { getClanFromFirestore, getMembersFromFirestore, getAchievements, getWeeklyStats, getClanWarSettings, saveAchievements } from "@/lib/firestore-service";
import { computeAchievements } from "@/lib/achievements";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  const clanTag = process.env.CLAN_TAG;
  if (!clanTag) {
    return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 400 });
  }

  if (!adminDb) {
    return NextResponse.json({ error: "Firebase no disponible" }, { status: 503 });
  }

  const [clan, members, warSettings, storedAchievements, weeklyStats] = await Promise.all([
    getClanFromFirestore(clanTag),
    getMembersFromFirestore(clanTag),
    getClanWarSettings(clanTag),
    getAchievements(clanTag),
    getWeeklyStats(clanTag),
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
  }

  const achievements = computeAchievements(members, storedAchievements);
  saveAchievements(clanTag, achievements).catch(() => {});

  return NextResponse.json({
    clan,
    members,
    achievements,
    weeklyStats,
    localWarRank: warSettings.localWarRank,
    localWarRankChange: warSettings.localWarRankChange,
    localWarTrophies: warSettings.localWarTrophies,
  });
}
