import { NextResponse } from 'next/server';
import { callAI } from "@/lib/ai-client";
import { getUserUid, checkRateLimit } from "@/lib/api-utils";

export async function POST(req: Request) {
  try {
    const uid = await getUserUid(req);
    if (uid) {
      const rateCheck = checkRateLimit(uid, "how-to-play");
      if (!rateCheck.allowed) {
        const seconds = Math.ceil(rateCheck.resetIn / 1000);
        return NextResponse.json({
          error: `Has excedido el límite de solicitudes. Espera ${seconds} segundos.`,
        }, { status: 429 });
      }
    }

    const body = await req.json();
    const { deckName, cards, question } = body;

    if (!cards || cards.length === 0) {
      return NextResponse.json({ error: "No hay cartas en el mazo" }, { status: 400 });
    }

    const cardList = cards.map((c: any) => typeof c === 'string' ? c : c.name).join(", ");
    const deckInfo = deckName ? `Mazo: "${deckName}"\n` : "";
    const userQuestion = question ? `\nPregunta adicional: ${question}` : "";

    const prompt = `Eres un coach experto de Clash Royale. El jugador tiene este mazo:

${deckInfo}Cartas: ${cardList}

Responde en ESPAÑOL con una guía práctica de cómo jugar este mazo:
1. **Apertura** — ¿qué carta jugar al empezar?
2. **Ciclo óptimo** — ¿cómo ciclar para llegar a las cartas clave?
3. **Ataque** — ¿cuál es el combo de ataque principal?
4. **Defensa** — ¿cómo defender contra mazos comunes?
5. **Errores comunes** — ¿qué evitar?

Además, SUGIERE UN MAZO MEJORADO (8 cartas) optimizando la sinergia y el elixir promedio. El mazo listado arriba es el que el jugador YA USA actualmente. NO devuelvas exactamente el mismo mazo. Cambia al menos 2-3 cartas para mejorarlo. Usa SOLO cartas del juego de las que tiene el jugador o de las disponibles en el juego.

Al final de tu respuesta, incluye el mazo sugerido con este formato EXACTO (sin explicación adicional):
---DECK---
Nombre del Mazo
Carta1, Carta2, Carta3, Carta4, Carta5, Carta6, Carta7, Carta8
---END---

Sé directo, práctico y usa emojis. Formatea con negritas y saltos de línea.

INSTRUCCIÓN IMPORTANTE de formato: Cuando menciones una carta por PRIMERA VEZ dentro de una sección (apertura, ataque, defensa, etc.), pon su nombre entre corchetes al inicio del párrafo con dos puntos después. Ejemplo: [Hog Rider]: Es tu carta de ataque principal. Así el sistema mostrará la imagen de la carta. Solo hazlo UNA VEZ por carta por sección.
${userQuestion}`;

    const result = await callAI(prompt, { maxTokens: 2048 });
    if (!result) {
      const geminiKey = !!process.env.GEMINI_API_KEY;
      const groqKey = !!process.env.GROQ_API_KEY;
      const detail = !geminiKey && !groqKey
        ? "Ninguna API key configurada (GEMINI_API_KEY ni GROQ_API_KEY)."
        : "Ambos proveedores de IA fallaron. Revisa la consola del servidor.";
      return NextResponse.json({ error: `La IA no está disponible. ${detail}` }, { status: 503 });
    }

    const text = result.text;

    let suggestedDeck: { name: string; cards: string[]; elixirAvg: number } | null = null;
    const deckMatch = text.match(/---DECK---\s*\n([\s\S]*?)\n---END---/);
    if (deckMatch) {
      const lines = deckMatch[1].trim().split("\n");
      const deckName = lines[0]?.trim() || "Mazo Sugerido";
      const cardNames = lines[1]?.split(",").map((c: string) => c.trim()).filter(Boolean) || [];
      if (cardNames.length === 8) {
        const { CARDS } = await import("@/lib/cards");
        const totalElixir = cardNames.reduce((sum: number, name: string) => {
          const card = CARDS.find((c: { name: string }) => c.name.toLowerCase() === name.toLowerCase());
          return sum + (card?.elixir ?? 3);
        }, 0);
        suggestedDeck = {
          name: deckName,
          cards: cardNames,
          elixirAvg: Math.round((totalElixir / 8) * 10) / 10,
        };
      }
    }
    const cleanText = text.replace(/---DECK---[\s\S]*?---END---/, "").trim();

    return NextResponse.json({ response: cleanText, suggestedDeck });

  } catch {
    return NextResponse.json({ error: "Error crítico en el servidor" }, { status: 500 });
  }
}
