export type MemberRole = "leader" | "coleader" | "veteran" | "member";

export type MemberStatus = "active" | "inactive" | "risk" | "trial";

export type RecruitStatus = "pending" | "trial" | "accepted" | "rejected";

export type LogType =
  | "promotion"
  | "demotion"
  | "kick"
  | "invite"
  | "warning"
  | "system";

export interface ClanSettings {
  inactivityDays: number;
  minDonationsWeekly: number;
}

export interface Member {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: MemberRole;
  playerTag: string;
  joinedAt: number;
  lastActiveAt: number;
  status: MemberStatus;
  trophies: number;
  bestTrophies: number;
  level: number;
  warDayWins: number;
  cardsCollected: number;
  donations: number;
  donationsReceived: number;
  clanPoints: number;
  xp: number;
  weeklyStats: WeeklyStats;
  totalWars: number;
  warsParticipated: number;
}

export interface WeeklyStats {
  trophiesGained: number;
  donationsGiven: number;
  warParticipation: number;
  activityDays: number;
}

export interface Clan {
  id: string;
  name: string;
  tag: string;
  description: string;
  badgeId: number;
  type: "open" | "invite" | "closed";
  requiredTrophies: number;
  createdAt: number;
  settings: ClanSettings;
  stats: ClanStats;
  healthScore: number;
  memberCount: number;
}

export interface ClanStats {
  clanScore: number;
  clanWarTrophies: number;
  averageTrophies: number;
}

export interface War {
  id: string;
  warDate: number;
  participants: number;
  battlesPlayed: number;
  wins: number;
  collectionDayWins: number;
  warTrophies: number;
  mvpId: string;
}

export interface WeeklyClanStats {
  id: string;
  weekStart: number;
  weekEnd: number;
  totalTrophies: number;
  avgTrophies: number;
  totalDonations: number;
  warTrophies: number;
}

export interface Recruit {
  id: string;
  playerTag: string;
  displayName: string;
  trophies: number;
  level: number;
  score: number;
  status: RecruitStatus;
  appliedAt: number;
  trialStart: number;
  trialEnd: number;
}

export interface Achievement {
  id: string;
  memberId: string;
  type: string;
  name: string;
  icon: string;
  awardedAt: number;
}

export interface LogEntry {
  id: string;
  action: string;
  actorId: string;
  targetId: string;
  details: string;
  timestamp: number;
  type: LogType;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: number;
  clans: Record<string, MemberRole>;
  playerTags: string[];
}

