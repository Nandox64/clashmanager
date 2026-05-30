import { create } from "zustand";
import type { Member, Clan, Achievement, WeeklyClanStats, Recruit, AutomationRule, ClanEvent, LogEntry } from "@clashmanager/shared";

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
    expulsionDays: 10,
    minDonationsWeekly: 200,
    warRequired: true,
    autoPromote: false,
  },
  stats: {
    clanScore: 0,
    clanWarTrophies: 0,
    averageTrophies: 0,
  },
  healthScore: 0,
  memberCount: 0,
};

interface ClanState {
  clan: Clan;
  members: Member[];
  achievements: Achievement[];
  weeklyStats: WeeklyClanStats[];
  recruits: Recruit[];
  rules: AutomationRule[];
  events: ClanEvent[];
  logs: LogEntry[];
  selectedMember: Member | null;
  localWarRank: number | null;
  localWarRankChange: number;
  warRankConfidence: "exact" | "estimated" | "fallback" | "seed";
  warRankMethod: string;
  warRankNewEntries: number;
  loaded: boolean;
  setClan: (clan: Clan) => void;
  setMembers: (members: Member[]) => void;
  setAchievements: (achievements: Achievement[]) => void;
  setWeeklyStats: (stats: WeeklyClanStats[]) => void;
  setRecruits: (recruits: Recruit[]) => void;
  setRules: (rules: AutomationRule[]) => void;
  setEvents: (events: ClanEvent[]) => void;
  setLogs: (logs: LogEntry[]) => void;
  setSelectedMember: (member: Member | null) => void;
  setLocalWarRank: (rank: number | null) => void;
  setLocalWarRankChange: (change: number) => void;
  setWarRankMeta: (meta: {
    confidence: "exact" | "estimated" | "fallback" | "seed";
    method: string;
    newEntries: number;
  }) => void;
  setLoaded: (loaded: boolean) => void;
}

export const useClanStore = create<ClanState>((set) => ({
  clan: emptyClan,
  members: [],
  achievements: [],
  weeklyStats: [],
  recruits: [],
  rules: [],
  events: [],
  logs: [],
  selectedMember: null,
  localWarRank: null,
  localWarRankChange: 0,
  warRankConfidence: "fallback",
  warRankMethod: "",
  warRankNewEntries: 0,
  loaded: false,
  setClan: (clan) => set({ clan }),
  setMembers: (members) => set({ members }),
  setAchievements: (achievements) => set({ achievements }),
  setWeeklyStats: (stats) => set({ weeklyStats: stats }),
  setRecruits: (recruits) => set({ recruits }),
  setRules: (rules) => set({ rules }),
  setEvents: (events) => set({ events }),
  setLogs: (logs) => set({ logs }),
  setSelectedMember: (member) => set({ selectedMember: member }),
  setLocalWarRank: (rank) => set({ localWarRank: rank }),
  setLocalWarRankChange: (change) => set({ localWarRankChange: change }),
  setWarRankMeta: (meta) =>
    set({
      warRankConfidence: meta.confidence,
      warRankMethod: meta.method,
      warRankNewEntries: meta.newEntries,
    }),
  setLoaded: (loaded) => set({ loaded }),
}));
