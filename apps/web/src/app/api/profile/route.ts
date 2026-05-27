import { NextResponse } from "next/server";
import { getProfile, saveProfile } from "@/lib/firestore-service";
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

    const profile: UserProfileDoc = {
      uid,
      displayName: body.displayName ?? existing?.displayName ?? "",
      photoURL: body.photoURL ?? existing?.photoURL ?? "",
      linkedMemberId:
        body.linkedMemberId !== undefined
          ? body.linkedMemberId
          : (existing?.linkedMemberId ?? null),
      linkedAt: existing?.linkedAt ?? Date.now(),
      firstName: body.firstName !== undefined ? body.firstName : existing?.firstName,
      lastName: body.lastName !== undefined ? body.lastName : existing?.lastName,
      phone: body.phone !== undefined ? body.phone : existing?.phone,
      email: body.email !== undefined ? body.email : existing?.email,
    };

    await saveProfile(clanTag, profile);
    return NextResponse.json({ profile });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
