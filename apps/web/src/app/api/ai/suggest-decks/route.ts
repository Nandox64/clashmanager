import { NextResponse } from "next/server";
import { getPlayer } from "@/lib/cr-api";
import { deduplicateCards, stripEvolution, findCard } from "@/lib/cards";
import { getAIDecks } from "@/lib/ai-client";
import { findBestDecks } from "@/lib/archetype-matcher";
import { CRApiClientError } from "@/lib/cr-api";

export async function POST(req: Request) {
  try {
    const { playerTag } = await req.json();
    if (!playerTag) {
      return NextResponse.json({ error: "playerTag requerido" }, { status: 400 });
    }

    const player = await getPlayer(playerTag);

    const allCards = deduplicateCards(player.cards);

    const topCards = [...allCards]
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 10);

    const playerCards = allCards.map((c) => ({
      name: c.name,
      level: c.level,
      maxLevel: c.maxLevel,
      elixir: c.elixir,
      rarity: c.rarity,
    }));

    const aiDecks = await getAIDecks(playerCards);

    if (aiDecks && aiDecks.length > 0) {
      return NextResponse.json({
        decks: aiDecks.map((d) => ({
          ...d,
          isAI: true,
        })),
        topCards,
      });
    }

    const bestLocal = findBestDecks(
      playerCards.map((c) => ({ name: c.name, level: c.level, maxLevel: c.maxLevel })),
      4
    );

    return NextResponse.json({
      decks: bestLocal.map((d) => ({
        name: d.archetype.name,
        description: d.archetype.description,
        cards: d.filledDeck,
        elixirAvg: parseFloat(d.elixirAvg.toFixed(1)),
        isAI: false,
      })),
      topCards,
    });
  } catch (err) {
    if (err instanceof CRApiClientError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const msg = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
