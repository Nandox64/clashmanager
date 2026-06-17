import { NextResponse } from "next/server";
import { getToken, encodeTag, BASE_URL, getApiCardMap, getApiCardMaxEvolutionLevel } from "@/lib/cr-api";
import { findCard, stripEvolution } from "@/lib/cards";

/**
 * Obtiene los mazos de guerra del jugador desde el battlelog.
 * Solo considera batallas de River Race: riverRacePvP, riverRaceDuelColosseum, boatBattle.
 * Usa la API de cartas (/v1/cards) para traducir ID → nombre inglés → findCard → elixir.
 * Cruza con el perfil del jugador para detectar evoluciones.
 */
const FILTER_OPTIONS = ["all", "war", "boat"] as const;
type DeckFilter = (typeof FILTER_OPTIONS)[number];

function battleTypeMatches(bt: string, filter: DeckFilter): boolean {
  if (filter === "all") return bt === "riverRacePvP" || bt === "riverRaceDuelColosseum" || bt === "boatBattle";
  if (filter === "war") return bt === "riverRacePvP" || bt === "riverRaceDuelColosseum";
  if (filter === "boat") return bt === "boatBattle";
  return false;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const playerTagEncoded = searchParams.get("playerTag");
  if (!playerTagEncoded) {
    return NextResponse.json({ error: "Falta playerTag" }, { status: 400 });
  }
  const playerTag = decodeURIComponent(playerTagEncoded);
  const rawFilter = searchParams.get("type") || "all";
  const filter: DeckFilter = FILTER_OPTIONS.includes(rawFilter as DeckFilter) ? (rawFilter as DeckFilter) : "all";
  const token = getToken();
  const isDev = process.env.NODE_ENV === "development";

  const labelFilter = filter === "war" ? "Guerra" : filter === "boat" ? "Barco" : "Guerra y Barco";

  try {
    const apiCardMap = await getApiCardMap();

    // Fetch player profile (secuencial para evitar rate limiting)
    let player = null;
    try {
      const profileRes = await fetch(`${BASE_URL}/players/${encodeTag(playerTag)}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: isDev ? "no-store" : undefined,
        next: isDev ? undefined : { revalidate: 120 },
      });
      if (profileRes.ok) player = await profileRes.json();
      else console.error("Profile fetch failed:", profileRes.status);
    } catch (e) {
      console.error("Error fetching player profile", e);
    }

    // Fetch battlelog
    const battlelogRes = await fetch(`${BASE_URL}/players/${encodeTag(playerTag)}/battlelog`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: isDev ? "no-store" : undefined,
      next: isDev ? undefined : { revalidate: 120 },
    });
    if (!battlelogRes.ok) {
      const err = await battlelogRes.json().catch(() => ({ error: "Error" }));
      console.error("Error fetching battlelog", err);
      return NextResponse.json({ decks: [], debug: { error: "Error fetching battlelog" } }, { status: battlelogRes.status });
    }
    const battlelog = await battlelogRes.json();

    // ── Evoluciones del jugador ──
    const evolvedBaseNames = new Set<string>();
    if (player?.cards) {
      for (const c of player.cards) {
        if (!c.name) continue;
        const playerEvoLevel = c.evolutionLevel ?? 0;
        const maxEvoLevel = getApiCardMaxEvolutionLevel(c.id) ?? 0;
        if (maxEvoLevel > 0 && playerEvoLevel > 0) {
          evolvedBaseNames.add(c.name.toLowerCase());
        }
      }
    }

    const debug = {
      profileFetched: !!player,
      evolvedCards: [...evolvedBaseNames],
      totalPlayerCards: player?.cards?.length ?? 0,
      filter,
      totalBattlesScanned: battlelog.length,
    };

    const seen = new Set<string>();
    const warDecks: any[] = [];

    for (const b of battlelog) {
      if (warDecks.length >= 4) break;
      if (!battleTypeMatches(b.type, filter)) continue;

      let deckCards: any[] = [];
      if (b.team?.[0]?.cards) deckCards = b.team[0].cards;
      else continue;
      if (!deckCards?.length) continue;

      const makeCardsData = (cards: any[]) =>
        cards.map((c: any) => {
          const englishName = apiCardMap.get(c.id);
          const info = englishName ? findCard(englishName) : findCard(c.name);
          const baseName = englishName ? stripEvolution(englishName) : stripEvolution(c.name);
          const isEvolved = evolvedBaseNames.has(baseName.toLowerCase());

          return {
            name: c.name,
            id: c.id,
            maxLevel: c.maxLevel,
            elixir: info?.elixir,
            rarity: info?.rarity,
            iconUrl: c.iconUrls?.medium || c.iconUrls?.default || null,
            isEvolved,
          };
        });

      // Duelo coliseo
      if (b.type === "riverRaceDuelColosseum") {
        const roundSize = 8;
        const rounds = [];
        for (let i = 0; i < deckCards.length; i += roundSize) {
          const chunk = deckCards.slice(i, i + roundSize);
          if (chunk.length === 8) rounds.push(chunk);
        }
        for (const round of rounds) {
          const cardsData = makeCardsData(round);
          const key = cardsData.map((c: any) => c.name).sort().join(",");
          if (seen.has(key)) continue;
          seen.add(key);
          const elixirSum = cardsData.reduce((sum: number, c: any) => sum + (c.elixir ?? 0), 0);
          warDecks.push({
            name: `Duelo Ronda ${warDecks.length + 1}`,
            cards: cardsData,
            elixirAvg: parseFloat((elixirSum / cardsData.length).toFixed(1)),
            description: "Mazo de duelo coliseo",
            isAI: false,
          });
          if (warDecks.length >= 4) break;
        }
      } else {
        // riverRacePvP o boatBattle
        if (deckCards.length !== 8) continue;
        const cardsData = makeCardsData(deckCards);
        const key = cardsData.map((c: any) => c.name).sort().join(",");
        if (seen.has(key)) continue;
        seen.add(key);
        const label = b.type === "boatBattle" ? "Mazo de Barco" : "Mazo de Guerra (1v1)";
        const elixirSum = cardsData.reduce((sum: number, c: any) => sum + (c.elixir ?? 0), 0);
        warDecks.push({
          name: `${label} ${warDecks.length + 1}`,
          cards: cardsData,
          elixirAvg: parseFloat((elixirSum / cardsData.length).toFixed(1)),
          description: "Mazo de guerra del jugador (histórico)",
          isAI: false,
        });
      }
    }

    return NextResponse.json({ decks: warDecks, debug });
  } catch (e) {
    console.error("Unexpected error in load-war-decks endpoint", e);
    return NextResponse.json({ decks: [] }, { status: 500 });
  }
}
