"use client";

import { useEffect, useRef } from "react";
import { useClanStore } from "@/lib/store";
import {
  loadClanCache,
  loadClanCacheIgnoreTTL,
  saveClanCache,
  getClanCacheAge,
} from "@/lib/clan-cache";

const POLL_INTERVAL = 60_000;
const FETCH_TIMEOUT = 120_000;

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
    localWarRank: (data.localWarRank as number) ?? null,
    localWarRankChange: (data.localWarRankChange as number) ?? 0,
    localWarTrophies: (data.localWarTrophies as number) ?? null,
    warRankConfidence: ((data.warRankConfidence as string) ?? "fallback"),
    warRankMethod: ((data.warRankMethod as string) ?? ""),
    warRankNewEntries: ((data.warRankNewEntries as number) ?? 0),
  });

  // Ya no es caché — datos frescos
  s.setFromCache(false, null);
}

const fetchingRef = { current: false };
const lastFetchTimeRef = { current: 0 };

async function fetchFromApi(force = false) {
  if (fetchingRef.current) return;
  fetchingRef.current = true;

  const s = useClanStore.getState();
  useClanStore.setState({ loading: true, error: null });

  useClanStore.setState({ progressPhase: "loading-api" });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const url = force ? "/api/firebase/load?force=1" : "/api/firebase/load";

    useClanStore.setState({ progressPhase: "syncing" });

    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Error desconocido" }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();

    applyApiData(data);

    useClanStore.setState({ progressPhase: "ready" });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Error al conectar";
    useClanStore.setState({ error: errorMsg });

    // Si ya teníamos datos (del caché), no borrarlos — seguir mostrándolos
    if (!useClanStore.getState().loaded) {
      useClanStore.setState({ progressPhase: "error" });
    }
    // Si sí hay datos cargados, dejamos progressPhase como estaba (ready o lo que sea)
  } finally {
    clearTimeout(timeout);
    useClanStore.setState({ loading: false, loaded: true });
    lastFetchTimeRef.current = Date.now();
    fetchingRef.current = false;
  }
}

export function startPolling(): () => void {
  const hydrated = hydrateFromCache();

  if (hydrated) {
    fetchFromApi(false);
  } else {
    useClanStore.setState({ progressPhase: "loading-api" });
    fetchFromApi(false);
  }

  const intervalId = setInterval(() => {
    if (typeof document !== "undefined" && document.hidden) return;
    fetchFromApi(false);
  }, POLL_INTERVAL);

  const handleVisibility = () => {
    if (!document.hidden) {
      const timeSinceLastFetch = Date.now() - lastFetchTimeRef.current;
      if (timeSinceLastFetch >= POLL_INTERVAL) {
        fetchFromApi(false);
      }
    }
  };

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", handleVisibility);
  }

  return () => {
    clearInterval(intervalId);
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", handleVisibility);
    }
  };
}

export function refetchData() { fetchFromApi(false); }
export function forceSyncData() { fetchFromApi(true); }

export function useClanData() {
  const loading = useClanStore((s) => s.loading);
  const error = useClanStore((s) => s.error);
  const progressPhase = useClanStore((s) => s.progressPhase);
  const fromCache = useClanStore((s) => s.fromCache);

  useEffect(() => {
    const cleanup = startPolling();
    return () => { if (cleanup) cleanup(); };
  }, []);

  return { loading, error, progressPhase, fromCache, refetch: refetchData, forceSync: forceSyncData };
}

