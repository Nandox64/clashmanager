import { NextResponse } from "next/server";
import { getLinkedProfiles, getMemberByUid, getProfile, getFirebaseUidByMember, batchWrite } from "@/lib/firestore-service";
import { getUserUid } from "@/lib/api-utils";
import type { BatchOperation } from "@/lib/firestore-service";

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
    const memberUid = url.searchParams.get("memberUid");
    
    const [profile, linkedMember] = await Promise.all([
      getProfile(clanTag, uid),
      memberUid ? getMemberByUid(clanTag, memberUid) : (async () => {
        const p = await getProfile(clanTag, uid);
        return p?.linkedMemberId ? getMemberByUid(clanTag, p.linkedMemberId) : null;
      })()
    ]);

    if (!profile?.linkedMemberId) {
      return NextResponse.json({ error: "No vinculado" }, { status: 403 });
    }
    if (!linkedMember || linkedMember.role !== "leader") {
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

    let existingFirebaseUid: string | null = null;
    if (nextLinkedMemberId) {
      existingFirebaseUid = await getFirebaseUidByMember(clanTag, nextLinkedMemberId);
      if (existingFirebaseUid && existingFirebaseUid !== uid) {
        return NextResponse.json({ error: "Ese miembro ya está vinculado a otro perfil" }, { status: 409 });
      }
    }

    const profile: import("@/lib/firestore-service").UserProfileDoc = {
      uid,
      displayName: body.displayName || existing?.displayName || "",
      photoURL: body.photoURL || existing?.photoURL || "",
      linkedMemberId: nextLinkedMemberId,
      linkedAt: nextLinkedMemberId ? (existing?.linkedMemberId === nextLinkedMemberId ? existing?.linkedAt ?? Date.now() : Date.now()) : Date.now(),
      firstName: body.firstName || existing?.firstName || null,
      lastName: body.lastName || existing?.lastName || null,
      phone: body.phone || existing?.phone || null,
      email: body.email || existing?.email || null,
    };

    const operations: import("@/lib/firestore-service").BatchOperation[] = [
      { type: "set", collection: "profiles", docId: uid, data: profile },
    ];
    if (nextLinkedMemberId) {
      operations.push({ type: "set", collection: "memberLinks", docId: nextLinkedMemberId, data: { firebaseUid: uid, linkedAt: Date.now() } });
    }
    await batchWrite(clanTag, operations);

    return NextResponse.json({ profile });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
