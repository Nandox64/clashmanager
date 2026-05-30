import type {
  Member,
  Clan,
  War,
  WeeklyClanStats,
  Recruit,
  Achievement,
  LogEntry,
  UserProfile,
  AutomationRule,
  ClanEvent,
} from "@clashmanager/shared";

export const mockUser: UserProfile = {
  uid: "leader-001",
  displayName: "Nando",
  email: "nando@clashmanager.app",
  photoURL: "",
  createdAt: Date.now() - 90 * 86400000,
  clans: { "clan-001": "leader" },
  playerTags: ["#8Y2L0GJRU"],
};

export const mockClan: Clan = {
  id: "clan-001",
  name: "Los Inmortales ⚔️",
  tag: "#L0V3R8",
  description: "Clan competitivo buscando jugadores activos +6000 copas",
  badgeId: 8,
  type: "invite",
  requiredTrophies: 6000,
  createdAt: Date.now() - 365 * 86400000,
  settings: {
    inactivityDays: 5,
    expulsionDays: 10,
    minDonationsWeekly: 200,
    warRequired: true,
    autoPromote: false,
  },
  stats: { clanScore: 48500, clanWarTrophies: 3200, averageTrophies: 6400 },
  healthScore: 78,
  memberCount: 45,
};

export const mockMembers: Member[] = [
  { uid: "member-001", displayName: "Nando", email: "nando@email.com", photoURL: "", role: "leader", playerTag: "#8Y2L0GJRU", joinedAt: Date.now() - 180 * 86400000, lastActiveAt: Date.now() - 2 * 3600000, status: "active", trophies: 7800, bestTrophies: 8100, level: 58, warDayWins: 320, cardsCollected: 12500, donations: 15400, donationsReceived: 8900, clanPoints: 2500, xp: 1800, weeklyStats: { trophiesGained: 280, donationsGiven: 650, warParticipation: 100, activityDays: 7 }, totalWars: 10, warsParticipated: 10 },
  { uid: "member-002", displayName: "DarkKnight", email: "dark@email.com", photoURL: "", role: "coleader", playerTag: "#9X3M5HJK2", joinedAt: Date.now() - 150 * 86400000, lastActiveAt: Date.now() - 5 * 3600000, status: "active", trophies: 7600, bestTrophies: 7900, level: 55, warDayWins: 280, cardsCollected: 11200, donations: 13200, donationsReceived: 7600, clanPoints: 2200, xp: 1600, weeklyStats: { trophiesGained: 320, donationsGiven: 720, warParticipation: 100, activityDays: 7 }, totalWars: 8, warsParticipated: 8 },
  { uid: "member-003", displayName: "StormBreaker", email: "storm@email.com", photoURL: "", role: "coleader", playerTag: "#7W4N6BGT1", joinedAt: Date.now() - 120 * 86400000, lastActiveAt: Date.now() - 8 * 3600000, status: "active", trophies: 7400, bestTrophies: 7700, level: 53, warDayWins: 250, cardsCollected: 10800, donations: 14800, donationsReceived: 7200, clanPoints: 2100, xp: 1500, weeklyStats: { trophiesGained: 190, donationsGiven: 850, warParticipation: 100, activityDays: 7 }, totalWars: 9, warsParticipated: 9 },
  { uid: "member-004", displayName: "IcePhoenix", email: "ice@email.com", photoURL: "", role: "veteran", playerTag: "#2R8P9LQW3", joinedAt: Date.now() - 90 * 86400000, lastActiveAt: Date.now() - 24 * 3600000, status: "active", trophies: 7100, bestTrophies: 7400, level: 51, warDayWins: 210, cardsCollected: 9800, donations: 11200, donationsReceived: 6800, clanPoints: 1800, xp: 1300, weeklyStats: { trophiesGained: 150, donationsGiven: 500, warParticipation: 80, activityDays: 6 }, totalWars: 7, warsParticipated: 6 },
  { uid: "member-005", displayName: "ThunderWolf", email: "thunder@email.com", photoURL: "", role: "veteran", playerTag: "#5H1K7MNB4", joinedAt: Date.now() - 60 * 86400000, lastActiveAt: Date.now() - 12 * 3600000, status: "active", trophies: 6800, bestTrophies: 7200, level: 49, warDayWins: 180, cardsCollected: 9100, donations: 9800, donationsReceived: 6400, clanPoints: 1600, xp: 1100, weeklyStats: { trophiesGained: 210, donationsGiven: 420, warParticipation: 90, activityDays: 6 }, totalWars: 6, warsParticipated: 5 },
  { uid: "member-006", displayName: "ShadowStrike", email: "shadow@email.com", photoURL: "", role: "member", playerTag: "#3C6V8XZQ5", joinedAt: Date.now() - 45 * 86400000, lastActiveAt: Date.now() - 6 * 3600, status: "active", trophies: 6500, bestTrophies: 6800, level: 47, warDayWins: 140, cardsCollected: 8200, donations: 8500, donationsReceived: 5900, clanPoints: 1400, xp: 900, weeklyStats: { trophiesGained: 180, donationsGiven: 380, warParticipation: 70, activityDays: 5 }, totalWars: 5, warsParticipated: 4 },
  { uid: "member-007", displayName: "BlazeFury", email: "blaze@email.com", photoURL: "", role: "member", playerTag: "#6Y9N1HGT2", joinedAt: Date.now() - 30 * 86400000, lastActiveAt: Date.now() - 72 * 3600, status: "risk", trophies: 6200, bestTrophies: 6500, level: 45, warDayWins: 100, cardsCollected: 7500, donations: 6200, donationsReceived: 5100, clanPoints: 1100, xp: 700, weeklyStats: { trophiesGained: 80, donationsGiven: 150, warParticipation: 40, activityDays: 3 }, totalWars: 5, warsParticipated: 2 },
  { uid: "member-008", displayName: "FrostMage", email: "frost@email.com", photoURL: "", role: "member", playerTag: "#4Q2W8PLK7", joinedAt: Date.now() - 20 * 86400000, lastActiveAt: Date.now() - 48 * 3600, status: "inactive", trophies: 5900, bestTrophies: 6200, level: 43, warDayWins: 80, cardsCollected: 6800, donations: 4500, donationsReceived: 4800, clanPoints: 800, xp: 500, weeklyStats: { trophiesGained: 30, donationsGiven: 80, warParticipation: 20, activityDays: 1 }, totalWars: 4, warsParticipated: 1 },
  { uid: "member-009", displayName: "NovaBlast", email: "nova@email.com", photoURL: "", role: "member", playerTag: "#1P5W8JKL3", joinedAt: Date.now() - 10 * 86400000, lastActiveAt: Date.now() - 96 * 3600, status: "inactive", trophies: 5700, bestTrophies: 6000, level: 42, warDayWins: 60, cardsCollected: 6200, donations: 3200, donationsReceived: 4500, clanPoints: 600, xp: 350, weeklyStats: { trophiesGained: -50, donationsGiven: 40, warParticipation: 0, activityDays: 0 }, totalWars: 3, warsParticipated: 0 },
  { uid: "member-010", displayName: "CrimsonTide", email: "crimson@email.com", photoURL: "", role: "member", playerTag: "#8K3M2NXZ9", joinedAt: Date.now() - 75 * 86400000, lastActiveAt: Date.now() - 3600000, status: "active", trophies: 7000, bestTrophies: 7300, level: 50, warDayWins: 200, cardsCollected: 10500, donations: 12000, donationsReceived: 7000, clanPoints: 1900, xp: 1400, weeklyStats: { trophiesGained: 250, donationsGiven: 600, warParticipation: 90, activityDays: 6 }, totalWars: 8, warsParticipated: 7 },
];

export const mockWeeklyStats: WeeklyClanStats[] = Array.from(
  { length: 8 },
  (_, i) => ({
    id: `week-${i}`,
    weekStart: Date.now() - (7 - i) * 7 * 86400000,
    weekEnd: Date.now() - (6 - i) * 7 * 86400000,
    totalTrophies: 44000 + i * 600 + Math.floor(Math.random() * 400),
    avgTrophies: 5800 + i * 80 + Math.floor(Math.random() * 100),
    totalDonations: 12000 + i * 800 + Math.floor(Math.random() * 500),
    warTrophies: 2800 + i * 60 + Math.floor(Math.random() * 80),
  })
);

export const mockWars: War[] = Array.from({ length: 5 }, (_, i) => ({
  id: `war-${i}`,
  warDate: Date.now() - (4 - i) * 7 * 86400000,
  participants: 42 + Math.floor(Math.random() * 6),
  battlesPlayed: 18 + Math.floor(Math.random() * 4),
  wins: 12 + Math.floor(Math.random() * 6),
  collectionDayWins: 85 + Math.floor(Math.random() * 20),
  warTrophies: 3100 + i * 30 + Math.floor(Math.random() * 50),
  mvpId: `member-00${1 + Math.floor(Math.random() * 5)}`,
}));

export const mockRecruits: Recruit[] = [
  {
    id: "recruit-001",
    playerTag: "#1A2B3C4D5",
    displayName: "MegaKnightPro",
    trophies: 7200,
    level: 52,
    score: 85,
    status: "trial",
    appliedAt: Date.now() - 5 * 86400000,
    trialStart: Date.now() - 5 * 86400000,
    trialEnd: Date.now() + 2 * 86400000,
  },
  {
    id: "recruit-002",
    playerTag: "#5E6F7G8H9",
    displayName: "HogRider99",
    trophies: 6800,
    level: 48,
    score: 72,
    status: "pending",
    appliedAt: Date.now() - 86400000,
    trialStart: 0,
    trialEnd: 0,
  },
  {
    id: "recruit-003",
    playerTag: "#2J3K4L5M6",
    displayName: "ElectroWizard",
    trophies: 7500,
    level: 54,
    score: 91,
    status: "accepted",
    appliedAt: Date.now() - 15 * 86400000,
    trialStart: Date.now() - 15 * 86400000,
    trialEnd: Date.now() - 8 * 86400000,
  },
  {
    id: "recruit-004",
    playerTag: "#7N8P9Q0R1",
    displayName: "LogBaitMaster",
    trophies: 6300,
    level: 44,
    score: 58,
    status: "rejected",
    appliedAt: Date.now() - 20 * 86400000,
    trialStart: 0,
    trialEnd: 0,
  },
];

export const mockAchievements: Achievement[] = [
  { id: "ach-001", memberId: "member-001", type: "war_legend", name: "Leyenda de la Guerra", icon: "🏆", awardedAt: Date.now() - 30 * 86400000 },
  { id: "ach-002", memberId: "member-002", type: "clan_heart", name: "Corazón del Clan", icon: "❤️", awardedAt: Date.now() - 45 * 86400000 },
  { id: "ach-003", memberId: "member-003", type: "guardian", name: "Guardián", icon: "🛡️", awardedAt: Date.now() - 60 * 86400000 },
  { id: "ach-004", memberId: "member-010", type: "on_fire", name: "En Llamas", icon: "🔥", awardedAt: Date.now() - 15 * 86400000 },
  { id: "ach-005", memberId: "member-001", type: "unstoppable", name: "Imparable", icon: "⚡", awardedAt: Date.now() - 90 * 86400000 },
  { id: "ach-006", memberId: "member-010", type: "diamond", name: "Diamante en Bruto", icon: "💎", awardedAt: Date.now() - 7 * 86400000 },
];

export const mockLogs: LogEntry[] = [
  { id: "log-001", action: "ascendió a", actorId: "member-001", targetId: "member-004", details: "a Veterano", timestamp: Date.now() - 10 * 86400000, type: "promotion" },
  { id: "log-002", action: "expulsó a", actorId: "member-001", targetId: "unknown", details: "Inactivo 12 días", timestamp: Date.now() - 15 * 86400000, type: "kick" },
  { id: "log-003", action: "advirtió a", actorId: "member-002", targetId: "member-007", details: "Baja actividad en guerra", timestamp: Date.now() - 3 * 86400000, type: "warning" },
  { id: "log-004", action: "ascendió a", actorId: "member-001", targetId: "member-010", details: "a Veterano", timestamp: Date.now() - 20 * 86400000, type: "promotion" },
];

export const mockAutomationRules: AutomationRule[] = [
  {
    id: "rule-001",
    name: "Inactividad temprana",
    type: "inactivity",
    conditions: [{ field: "lastActiveAt", operator: "gt", value: 5, daysWindow: 0 }],
    actions: [{ type: "mark_risk", message: "Marcar como en riesgo" }],
    enabled: true,
  },
  {
    id: "rule-002",
    name: "Expulsión por inactividad",
    type: "inactivity",
    conditions: [{ field: "lastActiveAt", operator: "gt", value: 10, daysWindow: 0 }],
    actions: [{ type: "suggest_expulsion", message: "Sugerir expulsión al líder" }],
    enabled: true,
  },
];

export const mockEvents: ClanEvent[] = [
  { id: "evt-001", name: "Donation King", type: "donation", dayOfWeek: 1, enabled: true },
  { id: "evt-002", name: "War Ready", type: "war", dayOfWeek: 3, enabled: true },
  { id: "evt-003", name: "Push Friday", type: "push", dayOfWeek: 5, enabled: true },
  { id: "evt-004", name: "MVP de la Semana", type: "mvp", dayOfWeek: 0, enabled: true },
];
