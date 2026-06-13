import { NextResponse } from "next/server";
import { getPlayer } from "@/lib/cr-api";
import { deduplicateCards } from "@/lib/cards";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const playerTag = searchParams.get("playerTag");
  if (!playerTag) {
    return NextResponse.json({ error: "Falta playerTag" }, { status: 400 });
  }

  try {
    // Obtener información del jugador (incluye todas sus cartas)
    const player = await getPlayer(playerTag);
    const allCards = deduplicateCards(player.cards);
    // Ordenar por ratio (eficacia) y tomar las 8 mejores
    const topCards = allCards
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 8)
      .map((c) => c.name);

    const deck = {
      name: "Camino de Trofeos",
      cards: topCards,
      elixirAvg: 0,
      description: "Mazo sugerido para subir de trofeos",
      isAI: false,
    };

    return NextResponse.json({ decks: [deck] });
  } catch (e) {
    console.error("Error en trophy-path-deck endpoint:", e);
    return NextResponse.json({ error: "Error interno al generar mazo de trofeos" }, { status: 500 });
  }
}
