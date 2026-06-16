import { NextResponse } from "next/server";
import { getClanFull, CRApiClientError } from "@/lib/cr-api";
import { syncClanData } from "@/lib/clan-sync";
import { getClanFromFirestore, getMembersFromFirestore, getAchievements, getWeeklyStats, getLocalWarRank, getLastRaceKey } from "@/lib/firestore-service";
import { computeAchievements } from "@/lib/achievements";
import { adminDb } from "@/lib/firebase-admin";

const CACHE_FRESH_MS = 5 * 60 * 1000;

let backgroundSyncInFlight = false;

async function readFromFirestore(clanTag: string) {
  const [clan, members, rank, storedAchievements, weeklyStats] = await Promise.all([
    getClanFromFirestore(clanTag),
    getMembersFromFirestore(clanTag),
    getLocalWarRank(clanTag),
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
  }

  const achievements = computeAchievements(members, storedAchievements);
  return { clan, members, achievements, weeklyStats, localWarRank: rank, localWarRankChange: 0 };
}

export async function GET(request: Request) {
  const clanTag = process.env.CLAN_TAG;
  if (!clanTag) {
    return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "1";
  const useCache = searchParams.get("use_cache") === "1";

  // Iniciar promesas en paralelo con la lectura de caché
  const cachePromise = adminDb ? readFromFirestore(clanTag) : Promise.resolve(null);
  const crApiPromise = getClanFull();
  const storedMembersPromise = adminDb ? getMembersFromFirestore(clanTag).catch(() => []) : Promise.resolve([]);
  const existingAchievementsPromise = adminDb ? getAchievements(clanTag).catch(() => []) : Promise.resolve([]);
  const lastRaceKeyPromise = adminDb ? getLastRaceKey(clanTag).catch(() => null) : Promise.resolve(null);

  if (force) {
    try {
      const result = await syncClanData({
        clanTag,
        awaitPersist: false,
        preloaded: { crApiPromise, storedMembersPromise, existingAchievementsPromise, lastRaceKeyPromise },
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
      if (!fresh && !backgroundSyncInFlight) {
        backgroundSyncInFlight = true;
        syncClanData({ clanTag, awaitPersist: false, preloaded: { crApiPromise, storedMembersPromise, existingAchievementsPromise, lastRaceKeyPromise } })
          .catch(() => {}).finally(() => { backgroundSyncInFlight = false; });
      }
      return NextResponse.json({ ...cached, cached: true, stale: !fresh });
    }

    if (fresh) {
      return NextResponse.json({ ...cached, cached: true, stale: false });
    } else {
      if (!backgroundSyncInFlight) {
        backgroundSyncInFlight = true;
        syncClanData({ clanTag, awaitPersist: false, preloaded: { crApiPromise, storedMembersPromise, existingAchievementsPromise, lastRaceKeyPromise } })
          .catch(() => {}).finally(() => { backgroundSyncInFlight = false; });
      }
      return NextResponse.json({ ...cached, cached: true, stale: true });
    }
  }

  // No hay caché en Firestore — sync completo
  try {
    const result = await syncClanData({
      clanTag,
      awaitPersist: false,
      preloaded: { crApiPromise, storedMembersPromise, existingAchievementsPromise, lastRaceKeyPromise },
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
