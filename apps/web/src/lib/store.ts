import { create } from "zustand";
import type { Member, Clan } from "@clashmanager/shared";

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
  selectedMember: Member | null;
  localWarRank: number | null;
  localWarRankChange: number;
  warRankConfidence: "exact" | "estimated" | "fallback" | "seed";
  warRankMethod: string;
  warRankNewEntries: number;
  loaded: boolean;
  setClan: (clan: Clan) => void;
  setMembers: (members: Member[]) => void;
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
  selectedMember: null,
  localWarRank: null,
  localWarRankChange: 0,
  warRankConfidence: "fallback",
  warRankMethod: "",
  warRankNewEntries: 0,
  loaded: false,
  setClan: (clan) => set({ clan }),
  setMembers: (members) => set({ members }),
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
