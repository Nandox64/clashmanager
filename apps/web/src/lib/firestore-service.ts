import "server-only";

import { adminDb } from "./firebase-admin";
import type { Clan, Member, Achievement, Recruit, AutomationRule, ClanEvent, LogEntry, WeeklyClanStats } from "@clashmanager/shared";

const CLANS_COLLECTION = "clans";

function getClanDocRef(clanTag: string) {
  if (!adminDb) throw new Error("Firebase Admin no inicializado");
  return adminDb.collection(CLANS_COLLECTION).doc(clanTag.replace("#", ""));
}

export async function saveClan(clan: Clan) {
  const ref = getClanDocRef(clan.tag);
  await ref.set(
    {
      ...clan,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
  return ref.id;
}

export async function saveMembers(clanTag: string, members: Member[]) {
  const ref = getClanDocRef(clanTag);
  const membersRef = ref.collection("members");
  const batch = adminDb!.batch();

  const existingSnap = await membersRef.select().get();
  const currentUids = new Set(members.map(m => m.uid));
  existingSnap.docs.forEach(doc => {
    if (!currentUids.has(doc.id)) {
      batch.delete(doc.ref);
    }
  });

  members.forEach((member) => {
    const memberRef = membersRef.doc(member.uid);
    batch.set(memberRef, { ...member, updatedAt: Date.now() }, { merge: true });
  });

  await batch.commit();
}

export async function getClanFromFirestore(
  clanTag: string
): Promise<Clan | null> {
  try {
    const ref = getClanDocRef(clanTag);
    const snap = await ref.get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as Clan;
  } catch {
    return null;
  }
}

export async function getMembersFromFirestore(
  clanTag: string
): Promise<Member[]> {
  try {
    const ref = getClanDocRef(clanTag);
    const snap = await ref.collection("members").orderBy("trophies", "desc").get();
    return snap.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: doc.id,
        ...data,
        totalWars: data.totalWars ?? 0,
        warsParticipated: data.warsParticipated ?? 0,
        weeklyStats: data.weeklyStats ?? {
          trophiesGained: 0,
          donationsGiven: data.donations ?? 0,
          warParticipation: 0,
          activityDays: 0,
        },
      } as Member;
    });
  } catch {
    return [];
  }
}

export async function saveRiverRaceData(
  clanTag: string,
  currentRace: unknown
) {
  const ref = getClanDocRef(clanTag);
  await ref.update({ currentRiverRace: currentRace, updatedAt: Date.now() });
}

export async function saveLocalWarRank(clanTag: string, rank: number | null) {
  const ref = getClanDocRef(clanTag);
  await ref.update({ localWarRank: rank, updatedAt: Date.now() });
}

export async function saveWarRankPrediction(
  clanTag: string,
  data: {
    rank: number | null;
    confidence: string;
    method: string;
    newEntries: number;
    scoreGap: number;
    estimatedChange: number;
  }
) {
  const ref = getClanDocRef(clanTag);
  await ref.set(
    {
      warRankPrediction: data,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}

export async function getClanUpdatedAt(clanTag: string): Promise<number | null> {
  try {
    const ref = getClanDocRef(clanTag);
    const snap = await ref.get();
    if (!snap.exists) return null;
    return snap.data()?.updatedAt ?? null;
  } catch {
    return null;
  }
}

export async function getLocalWarRank(clanTag: string): Promise<number | null> {
  try {
    const ref = getClanDocRef(clanTag);
    const snap = await ref.get();
    if (!snap.exists) return null;
    return snap.data()?.localWarRank ?? null;
  } catch {
    return null;
  }
}

export async function saveAchievements(clanTag: string, achievements: Achievement[]) {
  const ref = getClanDocRef(clanTag);
  const achievementsRef = ref.collection("achievements");
  const batch = adminDb!.batch();

  const existingSnap = await achievementsRef.select().get();
  const currentIds = new Set(achievements.map(a => a.id));
  existingSnap.docs.forEach(doc => {
    if (!currentIds.has(doc.id)) {
      batch.delete(doc.ref);
    }
  });

  achievements.forEach((achievement) => {
    const achRef = achievementsRef.doc(achievement.id);
    batch.set(achRef, { ...achievement, updatedAt: Date.now() }, { merge: true });
  });

  await batch.commit();
}

export async function getAchievements(clanTag: string): Promise<Achievement[]> {
  try {
    const ref = getClanDocRef(clanTag);
    const snap = await ref.collection("achievements").orderBy("awardedAt", "desc").get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Achievement));
  } catch {
    return [];
  }
}

export async function saveLocalWarTrophies(clanTag: string, trophies: number | null) {
  const ref = getClanDocRef(clanTag);
  await ref.update({ localWarTrophies: trophies, updatedAt: Date.now() });
}

export async function getLocalWarTrophies(clanTag: string): Promise<number | null> {
  try {
    const ref = getClanDocRef(clanTag);
    const snap = await ref.get();
    if (!snap.exists) return null;
    return snap.data()?.localWarTrophies ?? null;
  } catch {
    return null;
  }
}

// ── War History (Cumulative) ──

export async function getLastRaceKey(clanTag: string): Promise<string | null> {
  try {
    const ref = getClanDocRef(clanTag);
    const snap = await ref.get();
    if (!snap.exists) return null;
    return snap.data()?.lastRaceKey ?? null;
  } catch {
    return null;
  }
}

export async function saveLastRaceKey(clanTag: string, key: string) {
  const ref = getClanDocRef(clanTag);
  await ref.set({ lastRaceKey: key, updatedAt: Date.now() }, { merge: true });
}

export function extractWarHistory(
  members: Member[]
): Map<string, { totalWars: number; warsParticipated: number }> {
  const map = new Map<string, { totalWars: number; warsParticipated: number }>();
  for (const m of members) {
    map.set(m.playerTag, {
      totalWars: m.totalWars ?? 0,
      warsParticipated: m.warsParticipated ?? 0,
    });
  }
  return map;
}

// ── Recruits ──

export async function saveRecruits(clanTag: string, recruits: Recruit[]) {
  const ref = getClanDocRef(clanTag);
  const recruitsRef = ref.collection("recruits");
  const batch = adminDb!.batch();

  const existingSnap = await recruitsRef.select().get();
  const currentIds = new Set(recruits.map(r => r.id));
  existingSnap.docs.forEach(doc => {
    if (!currentIds.has(doc.id)) {
      batch.delete(doc.ref);
    }
  });

  recruits.forEach((recruit) => {
    const recruitRef = recruitsRef.doc(recruit.id);
    batch.set(recruitRef, { ...recruit, updatedAt: Date.now() }, { merge: true });
  });

  await batch.commit();
}

export async function getRecruits(clanTag: string): Promise<Recruit[]> {
  try {
    const ref = getClanDocRef(clanTag);
    const snap = await ref.collection("recruits").orderBy("appliedAt", "desc").get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Recruit));
  } catch {
    return [];
  }
}

// ── Automation Rules ──

export async function saveRules(clanTag: string, rules: AutomationRule[]) {
  const ref = getClanDocRef(clanTag);
  const rulesRef = ref.collection("rules");
  const batch = adminDb!.batch();

  const existingSnap = await rulesRef.select().get();
  const currentIds = new Set(rules.map(r => r.id));
  existingSnap.docs.forEach(doc => {
    if (!currentIds.has(doc.id)) {
      batch.delete(doc.ref);
    }
  });

  rules.forEach((rule) => {
    const ruleRef = rulesRef.doc(rule.id);
    batch.set(ruleRef, { ...rule, updatedAt: Date.now() }, { merge: true });
  });

  await batch.commit();
}

export async function getRules(clanTag: string): Promise<AutomationRule[]> {
  try {
    const ref = getClanDocRef(clanTag);
    const snap = await ref.collection("rules").get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AutomationRule));
  } catch {
    return [];
  }
}

// ── Clan Events ──

export async function saveEvents(clanTag: string, events: ClanEvent[]) {
  const ref = getClanDocRef(clanTag);
  const eventsRef = ref.collection("events");
  const batch = adminDb!.batch();

  const existingSnap = await eventsRef.select().get();
  const currentIds = new Set(events.map(e => e.id));
  existingSnap.docs.forEach(doc => {
    if (!currentIds.has(doc.id)) {
      batch.delete(doc.ref);
    }
  });

  events.forEach((event) => {
    const eventRef = eventsRef.doc(event.id);
    batch.set(eventRef, { ...event, updatedAt: Date.now() }, { merge: true });
  });

  await batch.commit();
}

export async function getEvents(clanTag: string): Promise<ClanEvent[]> {
  try {
    const ref = getClanDocRef(clanTag);
    const snap = await ref.collection("events").get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ClanEvent));
  } catch {
    return [];
  }
}

// ── Logs ──

export async function saveLogs(clanTag: string, logs: LogEntry[]) {
  const ref = getClanDocRef(clanTag);
  const logsRef = ref.collection("logs");
  const batch = adminDb!.batch();

  logs.forEach((log) => {
    const logRef = logsRef.doc(log.id);
    batch.set(logRef, { ...log, updatedAt: Date.now() }, { merge: true });
  });

  await batch.commit();
}

export async function getLogs(clanTag: string, limit = 20): Promise<LogEntry[]> {
  try {
    const ref = getClanDocRef(clanTag);
    const snap = await ref.collection("logs").orderBy("timestamp", "desc").limit(limit).get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as LogEntry));
  } catch {
    return [];
  }
}

// ── Weekly Clan Stats ──

export async function saveWeeklyStats(clanTag: string, stats: WeeklyClanStats[]) {
  const ref = getClanDocRef(clanTag);
  const statsRef = ref.collection("weeklyStats");
  const batch = adminDb!.batch();

  const existingSnap = await statsRef.select().get();
  const currentIds = new Set(stats.map(s => s.id));
  existingSnap.docs.forEach(doc => {
    if (!currentIds.has(doc.id)) {
      batch.delete(doc.ref);
    }
  });

  stats.forEach((stat) => {
    const statRef = statsRef.doc(stat.id);
    batch.set(statRef, { ...stat, updatedAt: Date.now() }, { merge: true });
  });

  await batch.commit();
}

export async function getWeeklyStats(clanTag: string): Promise<WeeklyClanStats[]> {
  try {
    const ref = getClanDocRef(clanTag);
    const snap = await ref.collection("weeklyStats").orderBy("weekStart", "asc").get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as WeeklyClanStats));
  } catch {
    return [];
  }
}

// ── User Profiles ──

export interface UserProfileDoc {
  uid: string;
  displayName: string;
  photoURL: string;
  linkedMemberId: string | null;
  linkedAt: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

export async function getProfile(clanTag: string, firebaseUid: string): Promise<UserProfileDoc | null> {
  try {
    const ref = getClanDocRef(clanTag);
    const snap = await ref.collection("profiles").doc(firebaseUid).get();
    if (!snap.exists) return null;
    return { uid: snap.id, ...snap.data() } as UserProfileDoc;
  } catch {
    return null;
  }
}

export async function saveProfile(clanTag: string, profile: UserProfileDoc) {
  const ref = getClanDocRef(clanTag);
  await ref.collection("profiles").doc(profile.uid).set(
    { ...profile, updatedAt: Date.now() },
    { merge: true }
  );
}

// ── Clan Settings (war rank + scaling) ──

export interface ClanScalingConfig {
  requiredTrophies: number;
  inactivityDays: number;
  expulsionDays: number;
  minDonationsWeekly: number;
  warRequired: boolean;
  autoPromote: boolean;
}

export async function getClanScaling(clanTag: string): Promise<ClanScalingConfig | null> {
  try {
    const ref = getClanDocRef(clanTag);
    const snap = await ref.get();
    if (!snap.exists) return null;
    return (snap.data()?.scaling as ClanScalingConfig) ?? null;
  } catch {
    return null;
  }
}

export async function saveClanScaling(clanTag: string, config: ClanScalingConfig) {
  const ref = getClanDocRef(clanTag);
  await ref.set({ scaling: config, updatedAt: Date.now() }, { merge: true });
}

// ── Ruleta ──

export interface RuletaConfig {
  eventActive: boolean;
  eventStartedAt: number | null;
  eventName: string;
  maxWinners: number;
  passAwarded: boolean;
  prizeCounts: {
    "oro-1k": number;
    "oro-10k": number;
    "gemas-500": number;
    "gemas-1200": number;
    pass: number;
  };
}

export interface RuletaSpin {
  displayName: string;
  eventStartedAt: number | null;
  won: boolean;
  prize: string | null;
  spinsUsed: number;
  lastSpinAt: number | null;
}

export interface RuletaWinner {
  uid: string;
  displayName: string;
  prize: string;
  awardedAt: number;
}

export async function getRuletaConfig(clanTag: string): Promise<RuletaConfig | null> {
  try {
    const ref = getClanDocRef(clanTag);
    const snap = await ref.collection("settings").doc("ruleta").get();
    if (!snap.exists) return null;
    return snap.data() as RuletaConfig;
  } catch {
    return null;
  }
}

export async function saveRuletaConfig(clanTag: string, config: RuletaConfig) {
  const ref = getClanDocRef(clanTag);
  await ref.collection("settings").doc("ruleta").set(config, { merge: true });
}

export async function getRuletaSpin(clanTag: string, uid: string): Promise<RuletaSpin | null> {
  try {
    const ref = getClanDocRef(clanTag);
    const snap = await ref.collection("ruletaSpins").doc(uid).get();
    if (!snap.exists) return null;
    return snap.data() as RuletaSpin;
  } catch {
    return null;
  }
}

export async function saveRuletaSpin(clanTag: string, uid: string, spin: RuletaSpin) {
  const ref = getClanDocRef(clanTag);
  await ref.collection("ruletaSpins").doc(uid).set(spin, { merge: true });
}

export async function getRuletaWinners(clanTag: string): Promise<RuletaWinner[]> {
  try {
    const ref = getClanDocRef(clanTag);
    const snap = await ref.collection("ruletaWinners").orderBy("awardedAt", "desc").get();
    return snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as RuletaWinner));
  } catch {
    return [];
  }
}

export async function addRuletaWinner(clanTag: string, winner: RuletaWinner) {
  const ref = getClanDocRef(clanTag);
  await ref.collection("ruletaWinners").doc(winner.uid).set(winner);
}

export async function clearRuletaWinners(clanTag: string) {
  const ref = getClanDocRef(clanTag);
  const snap = await ref.collection("ruletaWinners").get();
  const batch = adminDb!.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}
