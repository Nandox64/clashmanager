interface AIDeck {
  name: string;
  cards: string[];
  elixirAvg: number;
  description: string;
}

interface PlayerCardData {
  name: string;
  level: number;
  maxLevel: number;
  elixir: number;
  rarity: string;
}

function buildPrompt(playerCards: PlayerCardData[]): string {
  const cardList = playerCards
    .sort((a, b) => b.level / b.maxLevel - a.level / a.maxLevel)
    .slice(0, 30)
    .map(
      (c) => `${c.name} (nivel ${c.level}/${c.maxLevel}, ${c.elixir} elixir, ${c.rarity})`
    )
    .join("\n");

  return `Eres un experto en Clash Royale. Sugiere 4 mazos para guerra de clanes usando SOLO las cartas que el jugador tiene.

Cartas del jugador:
${cardList}

REGLAS:
- Cada mazo debe tener EXACTAMENTE 8 cartas
- Prioriza cartas con nivel más alto
- Costo de elixir balanceado (2.5 a 4.5)
- Sinergia entre cartas
- Nombres de arquetipos conocidos (Hog 2.6, Golem Beatdown, etc.)

Responde SOLO con un JSON array sin marcas de código:
[
  {
    "name": "Nombre del arquetipo",
    "cards": ["Carta1", "Carta2", "Carta3", "Carta4", "Carta5", "Carta6", "Carta7", "Carta8"],
    "elixirAvg": 3.5,
    "description": "Breve descripción del mazo"
  }
]`;
}

export async function getAIDecks(
  playerCards: PlayerCardData[]
): Promise<AIDeck[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = buildPrompt(playerCards);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const decks: AIDeck[] = JSON.parse(cleaned);
    return decks.filter((d) => d.cards?.length === 8).slice(0, 4);
  } catch {
    return null;
  }
}
