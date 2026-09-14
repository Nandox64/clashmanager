import { NextRequest, NextResponse } from "next/server";
import { getPlayer } from "@/lib/cr-api";

export async function GET(request: NextRequest) {
  try {
    const tags = request.nextUrl.searchParams.get("tags");
    if (!tags) {
      return NextResponse.json({ error: "tags query param required" }, { status: 400 });
    }

    const tagList = tags.split(",").map((t) => t.trim().toUpperCase());
    const results: Record<string, { expLevel: number; name: string; trophies: number; bestTrophies: number; donations: number; donationsReceived: number; warDayWins: number }> = {};

    await Promise.all(
      tagList.map(async (tag) => {
        try {
          const player = await getPlayer(`#${tag}`);
          results[tag] = {
            expLevel: player.expLevel,
            name: player.name,
            trophies: player.trophies,
            bestTrophies: player.bestTrophies,
            donations: player.donations,
            donationsReceived: player.donationsReceived,
            warDayWins: player.warDayWins,
          };
        } catch {
          results[tag] = { expLevel: 0, name: "", trophies: 0, bestTrophies: 0, donations: 0, donationsReceived: 0, warDayWins: 0 };
        }
      })
    );

    return NextResponse.json(results);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}
