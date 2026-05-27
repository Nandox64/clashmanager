import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const type = formData.get("type");
    const file = formData.get("file") as File | null;
    const uploaderName = (formData.get("uploaderName") as string) || "Anónimo";
    const uploaderUid = (formData.get("uploaderUid") as string) || "";

    if (!type || !["mobile", "pc", "qr"].includes(type as string)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "png";
    const slug = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const filename = `${slug}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", type as string);
    const name = file.name.replace(/\.[^.]+$/, "");
    const url = `/uploads/${type}/${filename}`;

    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);

    const meta = { name, url, slug, uploaderName, uploaderUid, uploadedAt: Date.now() };
    await writeFile(path.join(dir, `${slug}.meta.json`), JSON.stringify(meta, null, 2));

    return NextResponse.json(meta);
  } catch {
    return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 });
  }
}
