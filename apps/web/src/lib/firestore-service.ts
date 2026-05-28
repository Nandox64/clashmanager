import "server-only";

import { adminDb } from "./firebase-admin";
import type { Clan, Member, Achievement } from "@clashmanager/shared";

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
