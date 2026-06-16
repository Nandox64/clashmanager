import { NextResponse } from "next/server";
import { getPlayer } from "@/lib/cr-api";
import { deduplicateCards, findCard } from "@/lib/cards";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const playerTag = searchParams.get("playerTag");
  if (!playerTag) {
    return NextResponse.json({ error: "Falta playerTag" }, { status: 400 });
  }

  try {
    // Obtener información del jugador (incluye todas sus cartas)
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
    const cardMap = new Map(allCards.map((c) => [c.name, c]));

    const topCardNames = allCards
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 8)
      .map((c) => c.name);

    function enrichCards(cardNames: string[]) {
      return cardNames.map((name) => {
        const pc = cardMap.get(name);
        return pc
          ? { name: pc.name, maxLevel: pc.maxLevel, isEvolved: pc.isEvolved }
          : { name };
      });
    }

    const elixirSum = topCardNames.reduce((sum, name) => {
      const info = findCard(name);
      return sum + (info?.elixir ?? 0);
    }, 0);

    const deck = {
      name: "Camino de Trofeos",
      cards: enrichCards(topCardNames),
      elixirAvg: parseFloat((elixirSum / topCardNames.length).toFixed(1)),
      description: "Mazo sugerido para subir de trofeos",
      isAI: false,
    };

    return NextResponse.json({ decks: [deck] });
  } catch (e) {
    console.error("Error en trophy-path-deck endpoint:", e);
    return NextResponse.json({ error: "Error interno al generar mazo de trofeos" }, { status: 500 });
  }
}
