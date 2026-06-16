import "server-only";

import { getProfile } from "./firestore-service";
import type { MemberRole } from "@clashmanager/shared";

export async function getUserRole(
  clanTag: string,
  firebaseUid: string
): Promise<MemberRole | null> {
  try {
    const profile = await getProfile(clanTag, firebaseUid);
    if (!profile?.linkedMemberId) return null;

    const { adminDb } = await import("./firebase-admin");
    if (!adminDb) return null;

    const ref = adminDb
      .collection("clans")
      .doc(clanTag.replace("#", ""))
      .collection("members")
      .doc(profile.linkedMemberId);

    const snap = await ref.get();
    if (!snap.exists) return null;

    return (snap.data()?.role as MemberRole) ?? null;
  } catch {
    return null;
  }
}

export async function requireRole(
  clanTag: string,
  firebaseUid: string,
  allowedRoles: MemberRole[]
): Promise<{ allowed: boolean; role: MemberRole | null }> {
  const role = await getUserRole(clanTag, firebaseUid);
  if (!role) return { allowed: false, role: null };
  return { allowed: allowedRoles.includes(role), role };
}
