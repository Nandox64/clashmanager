// apps/web/src/app/api/ai/check-token/route.ts
import { NextResponse } from "next/server";
import { getToken } from "@/lib/cr-api";

/**
 * Simple endpoint to verify that the CR_API_TOKEN stored in .env.local is valid.
 * It performs a minimal request to RoyaleAPI (fetch a known public player).
 * If the token works, it returns { ok: true, message: "Token válido" }.
 * Otherwise it returns a JSON error with the HTTP status code (e.g., 401, 403).
 */
export async function GET() {
  try {
    const token = getToken(); // throws if missing
    // Use a tiny request that always succeeds with a valid token.
    // "#2PP" is a known public player tag; we only need the response status.
    const url = `https://proxy.royaleapi.dev/v1/players/%232PP`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      // Try to extract the API error message.
      let errorMsg = `Error ${res.status}`;
      try {
        const json = (await res.json()) as { message?: string; reason?: string };
        errorMsg = json.message || json.reason || errorMsg;
      } catch {}
      return NextResponse.json({ ok: false, error: errorMsg }, { status: res.status });
    }

    return NextResponse.json({ ok: true, message: "Token válido" });
  } catch (e) {
    // Missing token or other unexpected error.
    const errMsg = (e as Error).message ?? "Error inesperado";
    return NextResponse.json({ ok: false, error: errMsg }, { status: 500 });
  }
}
