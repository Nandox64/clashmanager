import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, slug, userRole } = body;

    if (!type || !["mobile", "pc", "qr"].includes(type)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }
    if (!slug) {
      return NextResponse.json({ error: "slug requerido" }, { status: 400 });
    }
    if (userRole !== "leader") {
      return NextResponse.json({ error: "Solo el líder puede eliminar archivos" }, { status: 403 });
    }

    const dir = path.join(process.cwd(), "public", "uploads", type);

    // Find and delete image file and metadata
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
