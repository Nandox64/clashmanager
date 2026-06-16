// Tipos de respuesta de la API oficial de Clash Royale

export interface CRApiError {
  reason: string;
  message: string;
  type?: string;
}

// ── Clan ──
export interface CRClan {
  tag: string;
  name: string;
  type: "open" | "inviteOnly" | "closed";
  description: string;
  badgeId: number;
  clanScore: number;
  clanWarTrophies: number;
  location: CRLocation | null;
  requiredTrophies: number;
  donationsPerWeek: number;
  members: number;
  memberList: CRClanMember[];
}

export interface CRClanMember {
  tag: string;
  name: string;
  role: "leader" | "coLeader" | "elder" | "member";
  lastSeen: string;
  trophies: number;
  arena: CRArena;
  clanRank: number;
  previousClanRank: number;
  donations: number;
  donationsReceived: number;
}

export interface CRArena {
  id: number;
  name: string;
}

export interface CRLocation {
  id: number;
  name: string;
  isCountry: boolean;
  countryCode: string;
}

// ── Player ──
export interface CRPlayer {
  tag: string;
  name: string;
  expLevel: number;
  trophies: number;
  bestTrophies: number;
  donations: number;
  donationsReceived: number;
  warDayWins: number;
  clanCardsCollected: number;
  starPoints: number;
  expPoints: number;
  totalDonations: number;
  arena: CRArena;
  badges: CRBadge[];
  currentFavouriteCard: CRCard | null;
  cards: CRCard[];
  currentDeck: CRCard[];
  clan: CRPlayerClan;
  role: string;
}

export interface CRPlayerClan {
  tag: string;
  name: string;
  badgeId: number;
}

export interface CRBadge {
  name: string;
  category: string;
  id: number;
  icon: string;
  progress: number;
}

export interface CRCard {
  name: string;
  id: number;
  level: number;
  maxLevel: number;
  evolutionLevel?: number;
  count: number;
  iconUrls: Record<string, string>;
}

export interface CRAPICard {
  name: string;
  id: number;
  maxLevel: number;
  maxEvolutionLevel?: number;
  iconUrls?: Record<string, string>;
}

// ── River Race ──
export interface CRRiverRaceLog {
  items: CRRiverRaceWeek[];
}

export interface CRRiverRaceWeek {
  seasonId: number;
  sectionIndex: number;
  createdDate: string;
  standings: CRRiverRaceStanding[];
}

export interface CRRiverRaceStanding {
  rank: number;
  trophyChange: number;
  clan: CRRiverRaceClan;
}

export interface CRRiverRaceClan {
  tag: string;
  name: string;
  badgeId: number;
  fame: number;
  repairPoints: number;
  finishTime: string;
  participants: number;
  battlesPlayed: number;
  wins: number;
  crowns: number;
}

export interface CRCurrentRiverRace {
  state: "inactive" | "matchmaking" | "collection" | "war" | "ended";
  clan: CRRiverRaceClan;
  participants: CRRiverRaceParticipant[];
}

export interface CRRiverRaceParticipant {
  tag: string;
  name: string;
  fame: number;
  repairPoints: number;
  boatAttacks: number;
  decksUsed: number;
  decksUsedToday: number;
}

// ── Rankings ──
export interface CRClanWarRanking {
  tag: string;
  name: string;
  rank: number;
  previousRank: number;
  location: CRLocation;
  badgeId: number;
  clanScore: number;
  members: number;
  fame: number;
}

export interface CRClanWarRankingsResponse {
  items: CRClanWarRanking[];
}
