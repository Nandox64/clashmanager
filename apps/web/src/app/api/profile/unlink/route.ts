import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { deleteMemberLink, getMemberByUid, getProfile, unlinkProfileMember } from "@/lib/firestore-service";
import { getUserUid } from "@/lib/api-utils";

async function findMemberUidByFirebaseUid(clanTag: string, firebaseUid: string): Promise<string | null> {
  try {
    if (!adminDb) return null;
    const snap = await adminDb
      .collection("clans")
      .doc(clanTag.replace("#", ""))
      .collection("memberLinks")
      .where("firebaseUid", "==", firebaseUid)
      .get();
    if (snap.empty) return null;
    return snap.docs[0].id;
  } catch {
    return null;
  }
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
    // Intentar obtener linkedMemberId desde el perfil
    let callerLinkedMemberId: string | null = null;
    const profile = await getProfile(clanTag, uid);
    if (profile?.linkedMemberId) {
      callerLinkedMemberId = profile.linkedMemberId;
    } else {
      // Fallback: buscar en memberLinks si profile no tiene linkedMemberId
      callerLinkedMemberId = await findMemberUidByFirebaseUid(clanTag, uid);
    }

    if (!callerLinkedMemberId) {
      return NextResponse.json({ error: "No vinculado" }, { status: 403 });
    }

    const callerMember = await getMemberByUid(clanTag, callerLinkedMemberId);
    if (callerMember?.role !== "leader") {
      return NextResponse.json({ error: "Solo el líder puede desvincular miembros" }, { status: 403 });
    }

    const body = await request.json();
    const targetUid = typeof body.uid === "string" ? body.uid : null;
    const memberUid = typeof body.memberUid === "string" ? body.memberUid : null;
    if (!targetUid || !memberUid) {
      return NextResponse.json({ error: "uid y memberUid requeridos" }, { status: 400 });
    }

    await unlinkProfileMember(clanTag, targetUid);
    await deleteMemberLink(clanTag, memberUid);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al desvincular" }, { status: 500 });
  }
}
