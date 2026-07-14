import { NextResponse } from "next/server";
import { getPlayer } from "@/lib/cr-api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tag: string }> }
) {
  try {
    const { tag } = await params;
    const cleanTag = tag.startsWith("#") ? tag : `#${tag.toUpperCase()}`;
    const player = await getPlayer(cleanTag);
    return NextResponse.json({
      expLevel: player.expLevel,
      name: player.name,
      trophies: player.trophies,
      bestTrophies: player.bestTrophies,
      donations: player.donations,
      donationsReceived: player.donationsReceived,
      warDayWins: player.warDayWins,
      clan: player.clan,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al obtener jugador" },
      { status: 500 }
    );
  }
}
