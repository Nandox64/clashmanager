import { NextResponse } from 'next/server';
import { getUserUid, getRateLimitStatus } from "@/lib/api-utils";

const ROUTES = ["analyze-decks", "suggest-decks", "how-to-play"];

export async function GET(req: Request) {
  const uid = await getUserUid(req);
  if (!uid) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const limits = ROUTES.map((route) => ({
    route,
    ...getRateLimitStatus(uid, route),
  }));

  return NextResponse.json({ limits });
}
