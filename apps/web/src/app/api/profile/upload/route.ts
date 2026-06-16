import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { getUserUid } from "@/lib/api-utils";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTS = ["jpg", "jpeg", "png", "webp", "gif"];
const MAX_SIZE = 1 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const uid = await getUserUid(request);
    if (!uid) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    if (!ALLOWED_EXTS.includes(ext) || !ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Solo imágenes (jpg, png, webp, gif)" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Máximo 1MB por archivo" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${uid}-${Date.now()}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", "profile");

    await writeFile(path.join(dir, filename), buffer);

    const url = `/uploads/profile/${filename}`;

    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 });
  }
}
