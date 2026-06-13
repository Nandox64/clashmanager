import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { adminAuth } from "@/lib/firebase-admin";
import { getProfile, getMemberByUid } from "@/lib/firestore-service";

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
  try {
    const uid = await getUserUid(request);
    if (!uid) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const clanTag = process.env.CLAN_TAG;
    if (!clanTag) {
      return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 500 });
    }

    const body = await request.json();
    const { type, slug } = body;

    if (!type || !["mobile", "pc", "qr"].includes(type)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }
    if (!slug) {
      return NextResponse.json({ error: "slug requerido" }, { status: 400 });
    }

    const profile = await getProfile(clanTag, uid);
    const linkedMemberId = profile?.linkedMemberId ?? null;
    const member = linkedMemberId ? await getMemberByUid(clanTag, linkedMemberId) : null;
    const userRole = member?.role ?? null;

    if (userRole !== "leader") {
      return NextResponse.json({ error: "Solo el líder puede eliminar archivos" }, { status: 403 });
    }

    const dir = path.join(process.cwd(), "public", "uploads", type);

    const { readdir } = await import("fs/promises");
    const files = await readdir(dir);
    const imageFile = files.find((f) => f.startsWith(slug) && !f.endsWith(".meta.json"));
    const metaFile = files.find((f) => f === `${slug}.meta.json`);

    if (imageFile) await unlink(path.join(dir, imageFile));
    if (metaFile) await unlink(path.join(dir, metaFile));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}