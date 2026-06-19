import { create } from "zustand";
import type { Member, Clan, Achievement, WeeklyClanStats, Recruit, LogEntry } from "@clashmanager/shared";

const emptyClan: Clan = {
  id: "",
  name: "",
  tag: "",
  description: "",
  badgeId: 0,
  type: "open",
  requiredTrophies: 0,
  createdAt: 0,
  settings: {
    inactivityDays: 5,
    minDonationsWeekly: 200,
  },
  stats: {
    clanScore: 0,
    clanWarTrophies: 0,
    averageTrophies: 0,
  },
  healthScore: 0,
  memberCount: 0,
};

export interface ClanScaling {
  inactivityDays: number;
  minDonationsWeekly: number;
}

const defaultScaling: ClanScaling = {
  inactivityDays: 5,
  minDonationsWeekly: 200,
};

/**
 * Fases de progreso de carga.
 * El componente LoadingProgress muestra mensajes distintos según la fase.
 */
export type ProgressPhase =
  | "idle"
  | "checking-cache"
  | "loading-api"
  | "syncing"
  | "ready"
  | "error";

interface ClanState {
  clan: Clan;
  members: Member[];
  achievements: Achievement[];
  weeklyStats: WeeklyClanStats[];
  recruits: Recruit[];
  logs: LogEntry[];
  localWarRank: number | null;
  localWarRankChange: number;
  localWarTrophies: number | null;
  warRankConfidence: "exact" | "estimated" | "fallback" | "seed";
  warRankMethod: string;
  warRankNewEntries: number;
  clanScaling: ClanScaling;
  loaded: boolean;
  loading: boolean;
  error: string | null;

  /** Fase actual de carga — alimenta LoadingProgress */
  progressPhase: ProgressPhase;
  /** true cuando los datos visibles provienen del caché localStorage */
  fromCache: boolean;
  /** Edad del caché en ms (null si no hay caché activo) */
  cacheAge: number | null;

  setClan: (clan: Clan) => void;
  setMembers: (members: Member[]) => void;
  setAchievements: (achievements: Achievement[]) => void;
  setWeeklyStats: (stats: WeeklyClanStats[]) => void;
  setRecruits: (recruits: Recruit[]) => void;
  setLogs: (logs: LogEntry[]) => void;

  setLocalWarRank: (rank: number | null) => void;
  setLocalWarRankChange: (change: number) => void;
  setLocalWarTrophies: (trophies: number | null) => void;
  setWarRankMeta: (meta: {
    confidence: "exact" | "estimated" | "fallback" | "seed";
    method: string;
    newEntries: number;
  }) => void;
  setClanScaling: (scaling: ClanScaling) => void;
  setLoaded: (loaded: boolean) => void;
  setProgressPhase: (phase: ProgressPhase) => void;
  setFromCache: (fromCache: boolean, cacheAge?: number | null) => void;

  /** Timestamp de la última actualización exitosa */
  lastFetchedAt: number | null;
  setLastFetchedAt: (ts: number) => void;
}

export const useClanStore = create<ClanState>((set) => ({
  clan: emptyClan,
  members: [],
  achievements: [],
  weeklyStats: [],
  recruits: [],
  logs: [],
  localWarRank: null,
  localWarRankChange: 0,
  localWarTrophies: null,
  warRankConfidence: "fallback",
  warRankMethod: "",
  warRankNewEntries: 0,
  clanScaling: defaultScaling,
  loaded: false,
  loading: true,
  error: null,
  progressPhase: "idle",
  fromCache: false,
  cacheAge: null,
  lastFetchedAt: null,
  setLastFetchedAt: (ts) => set({ lastFetchedAt: ts }),
  setClan: (clan) => set({ clan }),
  setMembers: (members) => set({ members }),
  setAchievements: (achievements) => set({ achievements }),
  setWeeklyStats: (stats) => set({ weeklyStats: stats }),
  setRecruits: (recruits) => set({ recruits }),
  setLogs: (logs) => set({ logs }),

  setLocalWarRank: (rank) => set({ localWarRank: rank }),
  setLocalWarRankChange: (change) => set({ localWarRankChange: change }),
  setLocalWarTrophies: (trophies) => set({ localWarTrophies: trophies }),
  setWarRankMeta: (meta) =>
    set({
      warRankConfidence: meta.confidence,
      warRankMethod: meta.method,
      warRankNewEntries: meta.newEntries,
    }),
  setClanScaling: (scaling) => set({ clanScaling: scaling }),
  setLoaded: (loaded) => set({ loaded }),
  setProgressPhase: (phase) => set({ progressPhase: phase }),
  setFromCache: (fromCache, cacheAge = null) => set({ fromCache, cacheAge }),
}));
