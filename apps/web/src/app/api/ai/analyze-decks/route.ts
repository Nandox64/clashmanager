import { NextResponse } from 'next/server';
import { callAI } from "@/lib/ai-client";
import { getUserUid, checkRateLimit } from "@/lib/api-utils";

export async function POST(req: Request) {
  try {
    const uid = await getUserUid(req);
    if (uid) {
      const rateCheck = checkRateLimit(uid, "analyze-decks");
      if (!rateCheck.allowed) {
        const seconds = Math.ceil(rateCheck.resetIn / 1000);
        return NextResponse.json({
          error: `Has excedido el límite de solicitudes. Espera ${seconds} segundos.`,
        }, { status: 429 });
      }
    }

    const body = await req.json();
    const { playerTag, decks, question } = body;

    if (!decks || decks.length === 0) {
      return NextResponse.json({ error: "Faltan mazos para analizar" }, { status: 400 });
    }

    const decksText = decks.map((d: any, i: number) => {
      const cards = Array.isArray(d.cards) 
        ? d.cards.map((c: any) => typeof c === 'string' ? c : c.name).join(", ") 
        : "Sin cartas";
      return `Mazo ${i + 1}: "${d.name || 'Sin nombre'}" — ${cards} (elixir promedio: ${d.elixirAvg})`;
    }).join("\n\n");

    const prompt = `Eres un coach experto de Clash Royale. Analiza los siguientes mazos del jugador ${playerTag} y proporciona un análisis estratégico COMPLETO en ESPAÑOL.

MAZOS A ANALIZAR:
${decksText}

Para CADA mazo, analiza:
1. **Sinergia** — ¿Las cartas funcionan bien juntas? ¿Qué combo o estrategia principal tiene?
2. **Debilidades** — ¿Qué mazos o cartas contrarrestan fácilmente este mazo? ¿Qué le falta?
3. **Consejo de juego** — ¿Cómo debería jugarlo? ¿Apertura, ciclo, defensa, ataque?

Luego, da una **conclusión general** comparando los mazos: cuál recomiendas para guerra de clanes, cuál para ladder, y por qué.

Responde en ESPAÑOL, usa emojis, sé directo y práctico. Formatea con negritas y saltos de línea para facilitar la lectura.

INSTRUCCIÓN IMPORTANTE de formato: Cuando menciones una carta por PRIMERA VEZ dentro de una sección, pon su nombre entre corchetes al inicio del párrafo con dos puntos después. Ejemplo: [Hog Rider]: Es la carta principal de ataque. Así el sistema mostrará la imagen de la carta. Solo hazlo UNA VEZ por carta por sección.
${question ? `\n\nPREGUNTA DEL JUGADOR:\n${question}` : ""}`;

    const result = await callAI(prompt, { maxTokens: 2048 });
    if (!result) {
      const geminiKey = !!process.env.GEMINI_API_KEY;
      const groqKey = !!process.env.GROQ_API_KEY;
      const detail = !geminiKey && !groqKey
        ? "Ninguna API key configurada (GEMINI_API_KEY ni GROQ_API_KEY)."
        : "Ambos proveedores de IA fallaron. Revisa la consola del servidor.";
      return NextResponse.json({ error: `La IA no está disponible. ${detail}` }, { status: 503 });
    }

    return NextResponse.json({ analysis: result.text });

  } catch {
    return NextResponse.json({ error: "Error crítico en el servidor" }, { status: 500 });
  }
}
