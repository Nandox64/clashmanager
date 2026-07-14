import { NextResponse } from "next/server";
import { getClanFull, CRApiClientError } from "@/lib/cr-api";
import { syncClanData } from "@/lib/clan-sync";
import { getClanFromFirestore, getMembersFromFirestore, getAchievements, getWeeklyStats, getClanWarSettings, getLastRaceKey } from "@/lib/firestore-service";
import type { Member, Achievement } from "@clashmanager/shared";
import { computeAchievements } from "@/lib/achievements";
import { adminDb } from "@/lib/firebase-admin";

const CACHE_FRESH_MS = 5 * 60 * 1000;

async function readFromFirestore(clanTag: string) {
  const [clan, members, warSettings, storedAchievements, weeklyStats] = await Promise.all([
    getClanFromFirestore(clanTag),
    getMembersFromFirestore(clanTag),
    getClanWarSettings(clanTag),
    getAchievements(clanTag),
    getWeeklyStats(clanTag),
  ]);
  if (!clan) return null;

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
  return { clan, members, achievements, weeklyStats, localWarRank: warSettings.localWarRank, localWarRankChange: warSettings.localWarRankChange };
}

export async function GET(request: Request) {
  const clanTag = process.env.CLAN_TAG;
  if (!clanTag) {
    return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "1";
  const useCache = searchParams.get("use_cache") === "1";

  // Leer caché primero (sin iniciar CR API aún)
  const cachePromise = adminDb ? readFromFirestore(clanTag) : Promise.resolve(null);

  // Lazy getters: solo inician las promesas CR cuando se accede a ellas
  let crApiPromise: ReturnType<typeof getClanFull> | null = null;
  let storedMembersPromise: Promise<Member[]> | null = null;
  let existingAchievementsPromise: Promise<Achievement[]> | null = null;
  let lastRaceKeyPromise: Promise<string | null> | null = null;

  function getCrApiPromise() {
    if (!crApiPromise) crApiPromise = getClanFull();
    return crApiPromise;
  }
  function getStoredMembersPromise() {
    if (!storedMembersPromise) storedMembersPromise = adminDb ? getMembersFromFirestore(clanTag!).catch((e) => { console.error("load: getMembersFromFirestore failed:", e); return []; }) : Promise.resolve([]);
    return storedMembersPromise;
  }
  function getExistingAchievementsPromise() {
    if (!existingAchievementsPromise) existingAchievementsPromise = adminDb ? getAchievements(clanTag!).catch((e) => { console.error("load: getAchievements failed:", e); return []; }) : Promise.resolve([]);
    return existingAchievementsPromise;
  }
  function getLastRaceKeyPromise() {
    if (!lastRaceKeyPromise) lastRaceKeyPromise = adminDb ? getLastRaceKey(clanTag!).catch((e) => { console.error("load: getLastRaceKey failed:", e); return null; }) : Promise.resolve(null);
    return lastRaceKeyPromise;
  }

  function makePreloaded() {
    return {
      crApiPromise: getCrApiPromise(),
      storedMembersPromise: getStoredMembersPromise(),
      existingAchievementsPromise: getExistingAchievementsPromise(),
      lastRaceKeyPromise: getLastRaceKeyPromise(),
    };
  }

  if (force) {
    try {
      const result = await syncClanData({
        clanTag,
        awaitPersist: true,
        preloaded: makePreloaded(),
      });
      return NextResponse.json(result);
    } catch (err) {
      if (err instanceof CRApiClientError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      return NextResponse.json({ error: "Error en sync forzado" }, { status: 500 });
    }
  }

  const cached = await cachePromise;

  if (cached) {
    const updatedAt = (cached.clan as { updatedAt?: number })?.updatedAt ?? 0;
    const fresh = Date.now() - updatedAt < CACHE_FRESH_MS;

    if (useCache) {
      if (!fresh) {
        syncClanData({ clanTag, awaitPersist: false, preloaded: makePreloaded() }).catch((e) => console.error("load: background sync (stale) failed:", e));
      }
      return NextResponse.json({ ...cached, cached: true, stale: !fresh });
    }

    if (fresh) {
      return NextResponse.json({ ...cached, cached: true, stale: false });
    } else {
      syncClanData({ clanTag, awaitPersist: false, preloaded: makePreloaded() }).catch((e) => console.error("load: background sync (expired) failed:", e));
      return NextResponse.json({ ...cached, cached: true, stale: true });
    }
  }

  // No hay caché en Firestore — sync completo (espera a Firestore)
  try {
    const result = await syncClanData({
      clanTag,
      awaitPersist: true,
      preloaded: makePreloaded(),
    });
    return NextResponse.json(result);
  } catch (err) {
    if (adminDb) {
      const cached = await readFromFirestore(clanTag);
      if (cached) {
        return NextResponse.json({ ...cached, cached: true });
      }
    }
    if (err instanceof CRApiClientError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Error al sincronizar" }, { status: 500 });
  }
}
