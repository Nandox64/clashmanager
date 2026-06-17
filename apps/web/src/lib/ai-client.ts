interface AIDeck {
  name: string;
  cards: string[];
  elixirAvg: number;
  description: string;
  howToPlay: string;
}

interface PlayerCardData {
  name: string;
  level: number;
  maxLevel: number;
  elixir: number;
  rarity: string;
}

async function callGemini(prompt: string, maxTokens = 2048, signal?: AbortSignal): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[AI] GEMINI_API_KEY no configurada");
    return null;
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: maxTokens },
        }),
        signal,
      }
    );

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.warn(`[AI] Gemini error ${res.status}: ${err.slice(0, 200)}`);
      return null;
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    if (text) console.log("[AI] Gemini OK");
    return text;
  } catch (err) {
    console.warn("[AI] Gemini exception:", err);
    return null;
  }
}

async function callGroq(prompt: string, systemPrompt?: string, maxTokens = 2048, signal?: AbortSignal): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn("[AI] GROQ_API_KEY no configurada");
    return null;
  }

  try {
    const messages: { role: string; content: string }[] = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
    messages.push({ role: "user", content: prompt });

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages,
        temperature: 0.4,
        max_tokens: maxTokens,
      }),
      signal,
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.warn(`[AI] Groq error ${res.status}: ${err.slice(0, 200)}`);
      return null;
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content ?? null;
    if (text) console.log("[AI] Groq OK");
    return text;
  } catch (err) {
    console.warn("[AI] Groq exception:", err);
    return null;
  }
}

export async function callAI(
  prompt: string,
  options?: { systemPrompt?: string; maxTokens?: number; signal?: AbortSignal }
): Promise<{ text: string; provider: string } | null> {
  const geminiResult = await callGemini(prompt, options?.maxTokens, options?.signal);
  if (geminiResult) return { text: geminiResult, provider: "gemini" };

  if (options?.signal?.aborted) return null;

  const groqResult = await callGroq(prompt, options?.systemPrompt, options?.maxTokens, options?.signal);
  if (groqResult) return { text: groqResult, provider: "groq" };

  return null;
}

export type DeckGenType = "war" | "trophy" | "boat";

function buildPrompt(type: DeckGenType, playerCards: PlayerCardData[], userInstructions?: string, count?: number, forceCards?: string[]): string {
  const cardList = playerCards
    .sort((a, b) => b.level / b.maxLevel - a.level / a.maxLevel)
    .slice(0, 30)
    .map(
      (c) => `${c.name} (nivel ${c.level}/${c.maxLevel}, ${c.elixir} elixir, ${c.rarity})`
    )
    .join("\n");

  const userSection = userInstructions
    ? `\nInstrucciones adicionales del jugador:\n${userInstructions}\n`
    : "";

  const deckCount = count ?? (type === "trophy" ? 1 : 4);
  const isSingle = deckCount === 1;

  const sharedRules = `- Cada mazo debe tener EXACTAMENTE 8 cartas
- Prioriza cartas con nivel más alto
- Costo de elixir balanceado (2.5 a 4.5)
- Sinergia entre cartas
- Nombres de arquetipos conocidos (Hog 2.6, Golem Beatdown, etc.)`;

  const noRepeatRule = isSingle
    ? ""
    : "\nIMPORTANTE: NINGUNA CARTA PUEDE REPETIRSE ENTRE LOS MAZOS. Cada carta del inventario puede aparecer como máximo en un solo mazo.";

  const forceSection = forceCards?.length
    ? `\nIMPORTANTE: Los mazos DEBEN incluir estas cartas: ${forceCards.join(", ")}.\n`
    : "";

  const modeInstructions: Record<DeckGenType, string> = {
    war: `para GUERRA DE CLANES`,
    trophy: `para CAMINO DE TROFEOS (ladder). El mazo debe estar optimizado para la meta actual de ladder y para subir copas eficientemente`,
    boat: `para GUERRA DE BARCOS. Prioriza arquitecturas defensivas sólidas y contraataque, típicas del modo guerra de barcos`,
  };

  const fieldDef = `Para cada mazo incluye UN CAMPO "howToPlay" con una explicación detallada de cómo jugarlo: apertura, ciclo óptimo, sinergias clave, cómo defender contra mazos comunes.`;

  const jsonExample = `Responde SOLO con un JSON array sin marcas de código:
[
  {
    "name": "Nombre del arquetipo",
    "cards": ["Carta1", "Carta2", "Carta3", "Carta4", "Carta5", "Carta6", "Carta7", "Carta8"],
    "elixirAvg": 3.5,
    "description": "Breve descripción del mazo",
    "howToPlay": "Explicación detallada de cómo jugar este mazo"
  }
]`;

  return `Eres un experto en Clash Royale. Sugiere ${deckCount} MAZO${isSingle ? "" : "S"} ${modeInstructions[type]} usando SOLO las cartas que el jugador tiene.${noRepeatRule}
${forceSection}
Cartas del jugador:
${cardList}
${userSection}
REGLAS:
${sharedRules}
${fieldDef}
${jsonExample}`;
}

export async function getAIDecks(
  playerCards: PlayerCardData[],
  type: DeckGenType,
  userInstructions?: string,
  count?: number,
  forceCards?: string[]
): Promise<AIDeck[] | null> {
  const prompt = buildPrompt(type, playerCards, userInstructions, count, forceCards);
  const maxDecks = count ?? (type === "trophy" ? 1 : 4);

  const controller = new AbortController();
  const aiTimeout = setTimeout(() => controller.abort(), 10_000);
  const result = await callAI(prompt, { maxTokens: 2048, signal: controller.signal });
  clearTimeout(aiTimeout);
  if (!result) return null;

  try {
    const cleaned = result.text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const decks: AIDeck[] = JSON.parse(cleaned);
    return decks.filter((d) => d.cards?.length === 8).slice(0, maxDecks);
  } catch {
    return null;
  }
}
