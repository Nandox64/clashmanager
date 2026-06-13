import { NextResponse } from "next/server";
import { getLinkedProfiles, getMemberByUid, getProfile, getProfileByLinkedMember, saveProfile, saveMemberLink } from "@/lib/firestore-service";
import { adminAuth } from "@/lib/firebase-admin";
import type { UserProfileDoc } from "@/lib/firestore-service";

async function getUserUid(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    if (token === "mock-mode" || token.startsWith("mock-")) {
      return token.replace("mock-", "");
    }
    if (adminAuth) {
      try {
        const decoded = await adminAuth.verifyIdToken(token);
        return decoded.uid;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export async function GET(request: Request) {
  const clanTag = process.env.CLAN_TAG;
  if (!clanTag) {
    return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 400 });
  }

  const uid = await getUserUid(request);
  if (!uid) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const url = new URL(request.url);
  if (url.searchParams.get("linked") === "1") {
    const profile = await getProfile(clanTag, uid);
    if (!profile?.linkedMemberId) {
      return NextResponse.json({ error: "No vinculado" }, { status: 403 });
    }
    const linkedMember = await getMemberByUid(clanTag, profile.linkedMemberId);
    if (linkedMember?.role !== "leader") {
      return NextResponse.json({ error: "Solo el líder puede ver vinculaciones" }, { status: 403 });
    }
    return NextResponse.json({ profiles: await getLinkedProfiles(clanTag) });
  }

  const profile = await getProfile(clanTag, uid);
  return NextResponse.json({ profile: profile ?? null });
}

export async function POST(request: Request) {
  const clanTag = process.env.CLAN_TAG;
  if (!clanTag) {
    return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 400 });
  }

  const uid = await getUserUid(request);
  if (!uid) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const existing = await getProfile(clanTag, uid);
    const nextLinkedMemberId =
      body.linkedMemberId !== undefined
        ? body.linkedMemberId
        : (existing?.linkedMemberId ?? null);

    if (nextLinkedMemberId) {
      const linkedProfile = await getProfileByLinkedMember(clanTag, nextLinkedMemberId);
      if (linkedProfile && linkedProfile.uid !== uid) {
        return NextResponse.json({ error: "Ese miembro ya está vinculado a otro perfil" }, { status: 409 });
      }
    }

    const profile: UserProfileDoc = {
      uid,
      displayName: body.displayName ?? existing?.displayName ?? "",
      photoURL: body.photoURL ?? existing?.photoURL ?? "",
      linkedMemberId: nextLinkedMemberId,
      linkedAt: nextLinkedMemberId ? (existing?.linkedMemberId === nextLinkedMemberId ? existing?.linkedAt ?? Date.now() : Date.now()) : Date.now(),
      firstName: body.firstName !== undefined ? body.firstName : existing?.firstName,
      lastName: body.lastName !== undefined ? body.lastName : existing?.lastName,
      phone: body.phone !== undefined ? body.phone : existing?.phone,
      email: body.email !== undefined ? body.email : existing?.email,
    };

    await saveProfile(clanTag, profile);
    if (nextLinkedMemberId) await saveMemberLink(clanTag, nextLinkedMemberId, uid);
    return NextResponse.json({ profile });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
