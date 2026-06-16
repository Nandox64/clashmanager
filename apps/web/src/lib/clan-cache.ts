/**
 * clan-cache.ts — Persistencia localStorage para datos del clan.
 *
 * Guarda el estado esencial del store en localStorage para que un F5
 * no signifique 60 s de GIF. Usa un TTL configurable (default 1 h).
 *
 * Datos sensibles (tokens, secrets) NUNCA se guardan aquí.
 */

const CACHE_KEY = "clash-clan-cache";

/** TTL por defecto: 1 hora */
const DEFAULT_TTL_MS = 60 * 60 * 1000;

export interface ClanCachePayload {
  clan: unknown;
  members: unknown;
  achievements: unknown;
  weeklyStats: unknown;
  localWarRank: number | null;
  localWarRankChange: number;
  localWarTrophies: number | null;
  warRankConfidence: string;
  warRankMethod: string;
  warRankNewEntries: number;
  /** Timestamp epoch ms de cuando se guardó */
  savedAt: number;
}

function validateClanCachePayload(data: unknown): data is ClanCachePayload {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.savedAt === "number" &&
    d.clan !== null && typeof d.clan === "object" &&
    Array.isArray(d.members)
  );
}

/**
 * Guarda un snapshot del store en localStorage.
 * Se ejecuta cada vez que llegan datos frescos de la API.
 */
export function saveClanCache(payload: Omit<ClanCachePayload, "savedAt">): void {
  try {
    const data: ClanCachePayload = { ...payload, savedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // localStorage lleno o no disponible — silenciar
  }
}

/**
 * Lee el caché de localStorage.
 * Devuelve null si no existe, si no parsea, o si está expirado (cuando respectTTL=true).
 */
export function loadClanCache(ttlMs: number = DEFAULT_TTL_MS): ClanCachePayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    if (!validateClanCachePayload(data)) return null;

    // Si el TTL expiró, devolvemos null para forzar carga desde API
    if (Date.now() - data.savedAt > ttlMs) return null;

    return data;
  } catch {
    return null;
  }
}

/**
 * Lee el caché sin importar TTL (para mostrar datos stale como fallback).
 */
export function loadClanCacheIgnoreTTL(): ClanCachePayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    if (!validateClanCachePayload(data)) return null;

    return data;
  } catch {
    return null;
  }
}

/**
 * ¿El caché actual todavía es fresco según el TTL?
 */
export function isCacheFresh(ttlMs: number = DEFAULT_TTL_MS): boolean {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return false;

    const data = JSON.parse(raw);
    return typeof data.savedAt === "number" && Date.now() - data.savedAt <= ttlMs;
  } catch {
    return false;
  }
}

/**
 * Borra el caché explícitamente.
 */
export function clearClanCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // silenciar
  }
}

/**
 * Devuelve la edad del caché en ms, o null si no existe.
 */
export function getClanCacheAge(): number | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    if (typeof data.savedAt !== "number") return null;

    return Date.now() - data.savedAt;
  } catch {
    return null;
  }
}
