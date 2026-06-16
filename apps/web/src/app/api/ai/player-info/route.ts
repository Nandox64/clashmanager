import { NextRequest, NextResponse } from "next/server";
import { getPlayer } from "@/lib/cr-api";
import { deduplicateCards } from "@/lib/cards";

export async function GET(req: NextRequest) {
  const playerTag = req.nextUrl.searchParams.get("playerTag");

  if (!playerTag) {
    return NextResponse.json(
      { error: "Falta playerTag" },
      { status: 400 }
    );
  }

  try {
    const player = await getPlayer(playerTag);

    const allCards = deduplicateCards(
      player.cards.map((c) => ({
        name: c.name,
        level: c.level,
        maxLevel: c.maxLevel,
        iconUrls: c.iconUrls,
        evolutionLevel: c.evolutionLevel,
      }))
    );

    const topCards = [...allCards]
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 10);

    return NextResponse.json({ topCards });
  } catch (err) {
    console.error("Error fetching player info:", err);
    return NextResponse.json(
      { error: "Error al obtener información del jugador" },
      { status: 500 }
    );
  }
}
