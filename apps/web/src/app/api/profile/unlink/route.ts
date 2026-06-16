import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { deleteMemberLink, getMemberByUid, getProfile, unlinkProfileMember } from "@/lib/firestore-service";

async function getUserUid(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    if (token === "mock-mode" || token.startsWith("mock-")) return token.replace("mock-", "");
    if (adminAuth) {
      try { return (await adminAuth.verifyIdToken(token)).uid; } catch { return null; }
    }
  }
  return null;
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
    const profile = await getProfile(clanTag, uid);
    const linkedMember = profile?.linkedMemberId ? await getMemberByUid(clanTag, profile.linkedMemberId) : null;
    if (linkedMember?.role !== "leader") {
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
