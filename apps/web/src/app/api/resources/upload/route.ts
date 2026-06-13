import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { adminAuth } from "@/lib/firebase-admin";
import { getMemberByUid, getProfile } from "@/lib/firestore-service";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTS = ["jpg", "jpeg", "png", "webp", "gif"];
const MAX_SIZE = 3 * 1024 * 1024;

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

    const profile = await getProfile(clanTag, uid);
    const linkedMemberId = profile?.linkedMemberId ?? null;
    const member = linkedMemberId ? await getMemberByUid(clanTag, linkedMemberId) : null;
    if (!member?.role) {
      return NextResponse.json({ error: "Debes vincularte a un miembro del clan" }, { status: 403 });
    }

    const formData = await request.formData();
    const type = formData.get("type");
    const file = formData.get("file") as File | null;
    const requestedUploaderName = (formData.get("uploaderName") as string) || "";

    if (!type || !["mobile", "pc", "qr"].includes(type as string)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    if (!ALLOWED_EXTS.includes(ext) || !ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Solo imágenes (jpg, png, webp, gif)" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Máximo 3MB por archivo" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const slug = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const filename = `${slug}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", type as string);
    const name = file.name.replace(/\.[^.]+$/, "");
    const url = `/uploads/${type}/${filename}`;

    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);

    const uploaderName = requestedUploaderName && requestedUploaderName !== "Anónimo" ? requestedUploaderName : member.displayName;
    const meta = { name, url, slug, uploaderName, uploaderUid: uid, uploadedAt: Date.now() };
    await writeFile(path.join(dir, `${slug}.meta.json`), JSON.stringify(meta, null, 2));

    return NextResponse.json(meta);
  } catch {
    return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 });
  }
}
