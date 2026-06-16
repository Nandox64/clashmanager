import { NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import path from "path";

export interface UploadedResource {
  name: string;
  url: string;
  slug: string;
  uploaderName: string;
  uploaderUid: string;
  uploadedAt: number;
}

export async function GET() {
  const types = ["mobile", "pc", "qr"];
  const result: Record<string, UploadedResource[]> = {};

  for (const type of types) {
    const dir = path.join(process.cwd(), "public", "uploads", type);
    try {
      const files = await readdir(dir);
      const metaFiles = files.filter((f) => f.endsWith(".meta.json"));
      const items: UploadedResource[] = [];

      for (const metaFile of metaFiles) {
        try {
          const content = await readFile(path.join(dir, metaFile), "utf-8");
          const meta = JSON.parse(content);
          items.push({
            name: meta.name || "Sin nombre",
            url: meta.url || "",
            slug: meta.slug || metaFile.replace(".meta.json", ""),
            uploaderName: meta.uploaderName || "Anónimo",
            uploaderUid: meta.uploaderUid || "",
            uploadedAt: meta.uploadedAt || 0,
          });
        } catch {
          // skip corrupt metadata
        }
      }

      result[type] = items;
    } catch {
      result[type] = [];
    }
  }

  return NextResponse.json(result);
}
