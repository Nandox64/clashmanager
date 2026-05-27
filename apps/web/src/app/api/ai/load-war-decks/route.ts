import { NextResponse } from "next/server";

const BASE_URL = "https://proxy.royaleapi.dev/v1";

function getToken(): string {
  const token = process.env.CR_API_TOKEN;
  if (!token) throw new Error("CR_API_TOKEN no configurado en .env.local");
  return token;
}

function encodeTag(tag: string): string {
  return "%23" + tag.replace("#", "");
}

/**
 * Intenta obtener los mazos de guerra actuales del jugador mediante la API de clan war.
 * Si falla (jugador sin clan, guerra no activa, error de red...), recurre a los mazos
 * únicos del battlelog (guerras pasadas) como fallback.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const playerTagEncoded = searchParams.get("playerTag");
  if (!playerTagEncoded) {
    return NextResponse.json({ error: "Falta playerTag" }, { status: 400 });
  }
  // Decode the URL-encoded tag (e.g., "%23ABC") to raw tag "#ABC"
  const playerTag = decodeURIComponent(playerTagEncoded);

  const token = getToken();

  // ----------- 1️⃣ Intentar vía Clan War ------------
  try {
    // Obtener datos del jugador para saber a qué clan pertenece
    const playerRes = await fetch(`${BASE_URL}/players/${encodeTag(playerTag)}`,
      { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 300 } });
    if (!playerRes.ok) throw new Error("player fetch error");
    const playerData = await playerRes.json();
    const clanTag: string | undefined = playerData.clan?.tag;

    if (clanTag) {
      const warRes = await fetch(`${BASE_URL}/clans/${encodeTag(clanTag)}/war`,
        { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 300 } });
      if (warRes.ok) {
        const warData = await warRes.json();
        // Sólo consideramos guerras activas
        if (warData.state && warData.state.toLowerCase() === "inwar") {
          const member = (warData.clan?.members ?? []).find((m: any) =>
            m.tag?.replace("#", "") === playerTag.replace("#", "")
          );
          if (member && member.warDeck?.cards?.length) {
            const deck = {
              name: "Mazo de guerra actual",
              cards: member.warDeck.cards.map((c: any) => c.name),
              elixirAvg: 0,
              description: "Mazo de guerra del jugador (actual)",
              isAI: false,
            };
            return NextResponse.json({ decks: [deck] });
          }
        }
      }
    }
  } catch (e) {
    console.error("Error obteniendo mazos de guerra actuales", e);
    // Continuamos al fallback sin abortar
  }

  // ----------- 2️⃣ Fallback: Battlelog (guerras pasadas) ------------
  try {
    const battlelogRes = await fetch(`${BASE_URL}/players/${encodeTag(playerTag)}/battlelog`,
      { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 300 } });
    if (!battlelogRes.ok) {
      const err = await battlelogRes.json().catch(() => ({ error: "Error" }));
      console.error("Error fetching battlelog", err);
      return NextResponse.json({ decks: [] }, { status: battlelogRes.status });
    }
    const battlelog = await battlelogRes.json();
    const seen = new Set<string>();
    const warDecks: any[] = [];
    for (const b of battlelog) {
      let deckCards: any[] = [];
      if (b.deck?.cards) deckCards = b.deck.cards;
      else if (b.team?.[0]?.deck?.cards) deckCards = b.team[0].deck.cards;
      else if (b.opponent?.deck?.cards) deckCards = b.opponent.deck.cards;
      if (!deckCards?.length) continue;
      const names = deckCards.map((c: any) => c.name);
      const key = names.sort().join(",");
      if (seen.has(key)) continue;
      seen.add(key);
      warDecks.push({
        name: `Mazo ${warDecks.length + 1}`,
        cards: names,
        elixirAvg: 0,
        description: "Mazo de guerra del jugador (histórico)",
        isAI: false,
      });
      if (warDecks.length >= 4) break;
    }
    return NextResponse.json({ decks: warDecks });
  } catch (e) {
    console.error("Unexpected error in load-war-decks endpoint", e);
    return NextResponse.json({ decks: [] }, { status: 500 });
  }
}
