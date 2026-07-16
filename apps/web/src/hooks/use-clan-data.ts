"use client";

import { useRef, useEffect } from "react";
import { useClanStore } from "@/lib/store";
import {
  loadClanCache,
  loadClanCacheIgnoreTTL,
  saveClanCache,
  getClanCacheAge,
} from "@/lib/clan-cache";

const FETCH_TIMEOUT = 60_000;

/** TTL del caché cliente: 1 hora */
const CLIENT_CACHE_TTL = 60 * 60 * 1000;

/**
 * Intenta hidratar el store desde localStorage.
 * Si hay caché fresco (<TTL), lo muestra inmediatamente y marca fromCache=true.
 * Si hay caché expirado, lo muestra igualmente como fallback (mejor stale que nada).
 * Devuelve true si se hidrató algo (el caller puede decidir si llamar a la API bloqueante o no).
 */
function hydrateFromCache(): boolean {
  const s = useClanStore.getState();
  s.setProgressPhase("checking-cache");

  // Intentar caché fresco primero
  let cached = loadClanCache(CLIENT_CACHE_TTL);
  let isStale = false;

  // Si no hay fresco, intentar stale como fallback
  if (!cached) {
    cached = loadClanCacheIgnoreTTL();
    isStale = true;
  }

  if (!cached) {
    // Sin caché — nada que hidratar
    return false;
  }

  // Hidratar store con los datos cacheados
  s.setClan(cached.clan as Parameters<typeof s.setClan>[0]);
  s.setMembers(cached.members as Parameters<typeof s.setMembers>[0]);
  s.setAchievements(cached.achievements as Parameters<typeof s.setAchievements>[0]);
  s.setWeeklyStats(cached.weeklyStats as Parameters<typeof s.setWeeklyStats>[0]);
  s.setWeeklySnapshots((cached.weeklySnapshots ?? []) as Parameters<typeof s.setWeeklySnapshots>[0]);
  s.setLocalWarRank(cached.localWarRank);
  s.setLocalWarRankChange(cached.localWarRankChange);
  s.setLocalWarTrophies(cached.localWarTrophies ?? null);
  s.setWarRankMeta({
    confidence: (cached.warRankConfidence as "exact" | "estimated" | "fallback" | "seed") ?? "fallback",
    method: cached.warRankMethod ?? "",
    newEntries: cached.warRankNewEntries ?? 0,
  });

  const age = getClanCacheAge();
  s.setFromCache(true, age);
  s.setLoaded(true);
  s.setProgressPhase(isStale ? "loading-api" : "ready");

  return true;
}

/**
 * Aplica datos de la API al store y los guarda en localStorage.
 */
function applyApiData(data: Record<string, unknown>) {
  const s = useClanStore.getState();
  s.setClan(data.clan as Parameters<typeof s.setClan>[0]);
  s.setMembers(data.members as Parameters<typeof s.setMembers>[0]);
  s.setAchievements((data.achievements ?? []) as Parameters<typeof s.setAchievements>[0]);
  s.setWeeklyStats((data.weeklyStats ?? []) as Parameters<typeof s.setWeeklyStats>[0]);
  s.setWeeklySnapshots((data.weeklySnapshots ?? []) as Parameters<typeof s.setWeeklySnapshots>[0]);
  s.setLocalWarRank((data.localWarRank as number) ?? null);
  s.setLocalWarRankChange((data.localWarRankChange as number) ?? 0);
  s.setLocalWarTrophies((data.localWarTrophies as number) ?? null);
  s.setWarRankMeta({
    confidence: (data.warRankConfidence as "exact" | "estimated" | "fallback" | "seed") ?? "fallback",
    method: (data.warRankMethod as string) ?? "",
    newEntries: (data.warRankNewEntries as number) ?? 0,
  });

  // Guardar en localStorage para la próxima recarga
  saveClanCache({
    clan: data.clan,
    members: data.members,
    achievements: data.achievements ?? [],
    weeklyStats: data.weeklyStats ?? [],
    weeklySnapshots: data.weeklySnapshots ?? [],
    localWarRank: (data.localWarRank as number) ?? null,
    localWarRankChange: (data.localWarRankChange as number) ?? 0,
    localWarTrophies: (data.localWarTrophies as number) ?? null,
    warRankConfidence: ((data.warRankConfidence as string) ?? "fallback"),
    warRankMethod: ((data.warRankMethod as string) ?? ""),
    warRankNewEntries: ((data.warRankNewEntries as number) ?? 0),
  });

  // Ya no es caché — datos frescos
  s.setFromCache(false, null);
  s.setLastFetchedAt(Date.now());
}

const POLL_INTERVAL = 5 * 60 * 1000;

async function fetchFromApi(
  isFetching: { current: boolean },
  force = false
) {
  if (isFetching.current) return;
  isFetching.current = true;

  const s = useClanStore.getState();
  useClanStore.setState({ loading: true, error: null });

  useClanStore.setState({ progressPhase: "loading-api" });

  let controller = new AbortController();
  let timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const url = force ? "/api/firebase/load?force=1" : "/api/firebase/load";

    if (force) {
      useClanStore.setState({ progressPhase: "syncing" });
    }

    const res = await fetch(url, { signal: controller.signal });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Error desconocido" }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();

    applyApiData(data);

    useClanStore.setState({ progressPhase: "ready" });
  } catch (err) {
    const isAbort = err instanceof DOMException && err.name === "AbortError";
    const errorMsg = isAbort
      ? "La solicitud tardó demasiado — los datos se muestran desde caché"
      : err instanceof Error ? err.message : "Error al conectar";
    useClanStore.setState({ error: isAbort && useClanStore.getState().loaded ? null : errorMsg });

    if (!useClanStore.getState().loaded) {
      useClanStore.setState({ progressPhase: "error" });
    }
  } finally {
    clearTimeout(timeout);
    useClanStore.setState({ loading: false, loaded: true });
    isFetching.current = false;
  }
}

function handlePoll(isFetching: { current: boolean }) {
  if (!document.hidden) {
    fetchFromApi(isFetching, false);
  }
}

export function useClanDataLoader() {
  const hydratedOnce = useRef(false);
  const isFetching = useRef(false);
  const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (hydratedOnce.current) return;
    hydratedOnce.current = true;

    const hydrated = hydrateFromCache();

    if (hydrated) {
      fetchFromApi(isFetching, false);
    } else {
      useClanStore.setState({ progressPhase: "loading-api" });
      fetchFromApi(isFetching, false);
    }

    pollingInterval.current = setInterval(() => handlePoll(isFetching), POLL_INTERVAL);
    document.addEventListener("visibilitychange", () => handlePoll(isFetching));

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
      document.removeEventListener("visibilitychange", () => handlePoll(isFetching));
    };
  }, []);
}

export function refetchData() {
  const isFetching = { current: false };
  fetchFromApi(isFetching, false);
}

export function forceSyncData() {
  const isFetching = { current: false };
  fetchFromApi(isFetching, true);
}

export function useClanData() {
  const loading = useClanStore((s) => s.loading);
  const error = useClanStore((s) => s.error);
  const progressPhase = useClanStore((s) => s.progressPhase);
  const fromCache = useClanStore((s) => s.fromCache);
  const lastFetchedAt = useClanStore((s) => s.lastFetchedAt);

  return { loading, error, progressPhase, fromCache, lastFetchedAt, refetch: refetchData, forceSync: forceSyncData };
}

export { refetchData as refetchClanData, forceSyncData as forceSyncClanData };

