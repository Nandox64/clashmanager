import { NextResponse } from "next/server";
import { getToken, encodeTag, BASE_URL } from "@/lib/cr-api";

/**
 * Obtiene los mazos de guerra del jugador desde el battlelog.
 * Solo considera batallas de River Race: riverRacePvP, riverRaceDuelColosseum, boatBattle.
 * La CR API no expone el "mazo de guerra actual" como campo dedicado
 * — el currentDeck del perfil es el mazo seleccionado en la UI del juego
 * (clásica 1c1, 2c2, etc.) y no es confiable.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const playerTagEncoded = searchParams.get("playerTag");
  if (!playerTagEncoded) {
    return NextResponse.json({ error: "Falta playerTag" }, { status: 400 });
  }
  const playerTag = decodeURIComponent(playerTagEncoded);
  const token = getToken();

  try {
    const isDev = process.env.NODE_ENV === "development";
    const battlelogRes = await fetch(`${BASE_URL}/players/${encodeTag(playerTag)}/battlelog`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: isDev ? "no-store" : undefined,
      next: isDev ? undefined : { revalidate: 120 },
    });
    if (!battlelogRes.ok) {
      const err = await battlelogRes.json().catch(() => ({ error: "Error" }));
      console.error("Error fetching battlelog", err);
      return NextResponse.json({ decks: [] }, { status: battlelogRes.status });
    }
    const battlelog = await battlelogRes.json();
    const seen = new Set<string>();
    const warDecks: any[] = [];

    for (const b of battlelog) {
      if (warDecks.length >= 4) break;
      if (b.type !== "riverRacePvP" && b.type !== "riverRaceDuelColosseum" && b.type !== "boatBattle") continue;

      let deckCards: any[] = [];
      if (b.team?.[0]?.cards) deckCards = b.team[0].cards;
      else continue;
      if (!deckCards?.length) continue;

      // Duelo coliseo: varias rondas en un mismo battle entry
      if (b.type === "riverRaceDuelColosseum") {
        const roundSize = 8;
        const rounds = [];
        for (let i = 0; i < deckCards.length; i += roundSize) {
          const chunk = deckCards.slice(i, i + roundSize);
          if (chunk.length === 8) rounds.push(chunk);
        }
        for (const round of rounds) {
          const cardsData = round.map((c: any) => ({
            name: c.name,
            id: c.id,
            maxLevel: c.maxLevel,
            iconUrl: c.iconUrls?.medium || c.iconUrls?.default || null,
          }));
          const key = cardsData.map((c: any) => c.name).sort().join(",");
          if (seen.has(key)) continue;
          seen.add(key);
          warDecks.push({
            name: `Duelo Ronda ${warDecks.length + 1}`,
            cards: cardsData,
            elixirAvg: 0,
            description: "Mazo de duelo coliseo",
            isAI: false,
          });
          if (warDecks.length >= 4) break;
        }
      } else {
        // riverRacePvP o boatBattle — exactamente 8 cartas
        if (deckCards.length !== 8) continue;
        const cardsData = deckCards.map((c: any) => ({
          name: c.name,
          id: c.id,
          maxLevel: c.maxLevel,
          iconUrl: c.iconUrls?.medium || c.iconUrls?.default || null,
        }));
        const key = cardsData.map((c: any) => c.name).sort().join(",");
        if (seen.has(key)) continue;
        seen.add(key);
        const label = b.type === "boatBattle" ? "Mazo de Barco" : "Mazo de Guerra (1v1)";
        warDecks.push({
          name: `${label} ${warDecks.length + 1}`,
          cards: cardsData,
          elixirAvg: 0,
          description: "Mazo de guerra del jugador (histórico)",
          isAI: false,
        });
      }
    }
    return NextResponse.json({ decks: warDecks });
  } catch (e) {
    console.error("Unexpected error in load-war-decks endpoint", e);
    return NextResponse.json({ decks: [] }, { status: 500 });
  }
}
