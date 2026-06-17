import { NextResponse } from "next/server";
import { getPlayer } from "@/lib/cr-api";
import { deduplicateCards, stripEvolution, findCard, CARDS } from "@/lib/cards";
import { getAIDecks, type DeckGenType } from "@/lib/ai-client";
import { findBestDecks } from "@/lib/archetype-matcher";
import { CRApiClientError } from "@/lib/cr-api";
import { getUserUid, checkRateLimit } from "@/lib/api-utils";

export const maxDuration = 30;

function parseCount(text: string): number | null {
  const numberMatch = text.match(/(\d+)\s*(mazo|deck)/i);
  if (numberMatch) {
    const n = parseInt(numberMatch[1], 10);
    if (n >= 1 && n <= 4) return n;
  }
  if (/\bun\s+(mazo|deck)\b/i.test(text) || /\buna\s+(mazo|deck)\b/i.test(text)) return 1;
  return null;
}

function findCardNames(text: string): string[] {
  const lower = text.toLowerCase();
  return CARDS.filter((c) => lower.includes(c.name.toLowerCase())).map((c) => c.name);
}

export async function POST(req: Request) {
  try {
    const uid = await getUserUid(req);
    if (uid) {
      const rateCheck = checkRateLimit(uid, "suggest-decks");
      if (!rateCheck.allowed) {
        const seconds = Math.ceil(rateCheck.resetIn / 1000);
        return NextResponse.json({
          error: `Has excedido el límite de solicitudes. Espera ${seconds} segundos.`,
        }, { status: 429 });
      }
    }

    const { playerTag, type: rawType, userInstructions } = await req.json();
    if (!playerTag) {
      return NextResponse.json({ error: "playerTag requerido" }, { status: 400 });
    }

    const type: DeckGenType = ["war", "trophy", "boat"].includes(rawType) ? rawType : "war";
    const parsedCount = userInstructions ? parseCount(userInstructions) : null;
    const forceCards = userInstructions ? findCardNames(userInstructions) : undefined;
    const requestedCount = parsedCount ?? (forceCards?.length ? 1 : type === "trophy" ? 1 : 4);

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

    const cardMap = new Map(allCards.map((c) => [c.name, c]));
    const playerCards = allCards.map((c) => ({
      name: c.name,
      level: c.level,
      maxLevel: c.maxLevel,
      elixir: c.elixir,
      rarity: c.rarity,
    }));

    function enrichCards(cardNames: string[]) {
      return cardNames.map((name) => {
        const pc = cardMap.get(name);
        return pc
          ? { name: pc.name, maxLevel: pc.maxLevel, isEvolved: pc.isEvolved }
          : { name };
      });
    }

    const aiDecks = await getAIDecks(playerCards, type, userInstructions, requestedCount, forceCards);

    if (aiDecks && aiDecks.length > 0) {
      return NextResponse.json({
        type,
        decks: aiDecks.map((d) => ({
          ...d,
          cards: enrichCards(d.cards),
          isAI: true,
        })),
        topCards,
      });
    }

    if (type === "trophy") {
      return NextResponse.json({ type, decks: [], topCards });
    }

    const bestLocal = findBestDecks(
      playerCards.map((c) => ({ name: c.name, level: c.level, maxLevel: c.maxLevel })),
      requestedCount
    );

    return NextResponse.json({
      type,
      decks: bestLocal.map((d) => ({
        name: d.archetype.name,
        description: d.archetype.description,
        cards: enrichCards(d.filledDeck),
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
