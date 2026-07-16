"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useClanStore } from "@/lib/store";
import { useClanData } from "@/hooks/use-clan-data";
import { Loading } from "@/components/ui/loading";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberSelector } from "@/components/war-decks/member-selector";
import { DeckCard } from "@/components/war-decks/deck-card";
import { Button } from "@/components/ui/button";
import { getCachedLinkedMemberId } from "@/lib/profile-cache";
import { LadderDeckSelector } from "@/components/war-decks/ladder-deck-selector";
import { Sparkles, AlertCircle, RefreshCw, Brain, X, Sword, Send } from "lucide-react";
import { InlineCard } from "@/components/war-decks/inline-card";
import { findCard } from "@/lib/cards";
import { memo, type ReactNode } from "react";

const ChatMessage = memo(function ChatMessage({ msg }: { msg: { role: string; text: string } }) {
  const parsed = useMemo(() => msg.role !== "user" ? parseAIChatText(msg.text) : null, [msg.text, msg.role]);
  return (
    <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
        msg.role === "user"
          ? "bg-metallic-gold/20 border border-metallic-gold/30 text-clash-text whitespace-pre-wrap"
          : "bg-black/30 border border-white/20 text-clash-text"
      }`}>
        {msg.role === "user" ? msg.text : parsed}
      </div>
    </div>
  );
});

function tokenizeLine(line: string, keyStart: number): { nodes: ReactNode[]; nextKey: number } {
  const nodes: ReactNode[] = [];
  let key = keyStart;
  const regex = /(\*\*(.+?)\*\*)|(\[(.+?)\])/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(line)) !== null) {
    if (m.index > lastIndex) {
      nodes.push(<span key={key++}>{line.slice(lastIndex, m.index)}</span>);
    }
    if (m[1]) {
      nodes.push(<strong key={key++} className="text-sm font-bold text-clash-gold">{m[2]}</strong>);
    } else if (m[3]) {
      const cardName = m[4].trim();
      if (findCard(cardName)) {
        nodes.push(<InlineCard key={key++} name={cardName} size="sm" />);
      } else {
        nodes.push(<span key={key++}>[{cardName}]</span>);
      }
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < line.length) {
    nodes.push(<span key={key++}>{line.slice(lastIndex)}</span>);
  }

  return { nodes, nextKey: key };
}

function parseAIChatText(text: string): ReactNode[] {
  const lines = text.split("\n");
  const nodes: ReactNode[] = [];
  let divKey = 0;
  let tokenKey = 0;

  for (const line of lines) {
    const lineKey = divKey++;
    const result = tokenizeLine(line, tokenKey);
    tokenKey = result.nextKey;
    if (result.nodes.length > 0) {
      nodes.push(<div key={lineKey} className="text-xs text-clash-text leading-relaxed">{result.nodes}</div>);
    } else {
      nodes.push(<div key={lineKey} className="text-xs text-clash-text leading-relaxed">&nbsp;</div>);
    }
  }

  return nodes;
}

interface PlayerCard {
  name: string;
  level: number;
  maxLevel: number;
  elixir: number;
  rarity: string;
  ratio: number;
}

interface DeckResult {
  name: string;
  cards: (string | { name: string; id?: number; maxLevel?: number; elixir?: number; rarity?: string; iconUrl?: string | null; isEvolved?: boolean })[];
  elixirAvg: number;
  description: string;
  isAI: boolean;
}

export function WarDecksClient() {
  const { loading: clanLoading, error: clanError, refetch: refetchClan } = useClanData();
  const members = useClanStore((s) => s.members);
  const loaded = useClanStore((s) => s.loaded);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedTag && members.length > 0) {
      const linkedId = getCachedLinkedMemberId();
      if (linkedId) {
        const linked = members.find((m) => m.uid === linkedId);
        if (linked?.playerTag) {
          setSelectedTag(linked.playerTag);
        }
      }
    }
  }, [members, selectedTag]);

  const [decks, setDecks] = useState<DeckResult[]>([]);
  const [warDecks, setWarDecks] = useState<DeckResult[]>([]);
  const [topCards, setTopCards] = useState<PlayerCard[]>([]);
  const [topCardsLoading, setTopCardsLoading] = useState(false);
  const [loadingWarDecks, setLoadingWarDecks] = useState(false);
  const [loadedWarDecks, setLoadedWarDecks] = useState(false);
  const [warDecksError, setWarDecksError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trophyDeck, setTrophyDeck] = useState<DeckResult[]>([]);
  const [loadingTrophy, setLoadingTrophy] = useState(false);
  const [trophyError, setTrophyError] = useState<string | null>(null);
  const [ladderOpen, setLadderOpen] = useState(false);
  const [aiSuggestedDeck, setAiSuggestedDeck] = useState<DeckResult | null>(null);
  const [genType, setGenType] = useState<string>("war");
  const [boatDecks, setBoatDecks] = useState<DeckResult[]>([]);
  const [loadingBoat, setLoadingBoat] = useState(false);
  const [boatError, setBoatError] = useState<string | null>(null);

  const [warDeckFilter, setWarDeckFilter] = useState<"all" | "war" | "boat">("all");

  const [aiChatMessages, setAiChatMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [aiChatInput, setAiChatInput] = useState("");
  const [aiChatLoading, setAiChatLoading] = useState(false);

  const handleSendManualDeck = (manual: { name: string; cards: string[]; elixirAvg: number }) => {
    const newDeck: DeckResult = {
      name: manual.name,
      cards: manual.cards,
      elixirAvg: manual.elixirAvg,
      description: "Mazo construido manualmente",
      isAI: false,
    };
    setWarDecks((prev) => [...prev, newDeck]);
    setActiveSection("war");
    setTimeout(() => handleAskHowToPlay(newDeck), 300);
  };

  const handleAskHowToPlay = async (deck: DeckResult, deckType?: string) => {
    const cardNames = deck.cards.map((c) => typeof c === "string" ? c : c.name);
    const type = deckType || (activeSection === "trophy" ? "trophy" : activeSection === "boat" ? "boat" : genType);
    const labelMap: Record<string, string> = { war: "Guerra", trophy: "Trofeos", boat: "Barcos" };
    setAiChatMessages([{ role: "user", text: `¿Cómo jugar el mazo "${deck.name}" (${labelMap[type] || "Guerra"})?` }]);
    setAiChatLoading(true);
    try {
      const res = await fetch("/api/ai/how-to-play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckName: deck.name, cards: cardNames, type }),
      });
      const data = await res.json();
      setAiChatMessages((prev) => [...prev, { role: "assistant", text: data.response || data.error || "Error" }]);
      if (data.suggestedDeck && data.suggestedDeck.cards?.length === 8) {
        const suggested: DeckResult = {
          name: data.suggestedDeck.name || "Mazo Sugerido por IA",
          cards: data.suggestedDeck.cards,
          elixirAvg: data.suggestedDeck.elixirAvg,
          description: `Versión mejorada sugerida por IA (basada en: ${deck.name})`,
          isAI: true,
        };
        setAiSuggestedDeck(suggested);
      }
    } catch {
      setAiChatMessages((prev) => [...prev, { role: "assistant", text: "Error al conectar con la IA" }]);
    } finally {
      setAiChatLoading(false);
    }
  };

  const handleAiChatSubmit = async (overrideText?: string) => {
    const text = (overrideText ?? aiChatInput).trim();
    if (!text) return;
    setAiChatInput("");
    setAiChatMessages([{ role: "user", text }]);
    setAiChatLoading(true);

    const q = text.toLowerCase();

    // Detectar saludo/charla
    const greetingWords = ["hola", "buenas", "buenos", "buen día", "qué tal", "que tal", "cómo estás", "como estas", "hey", "saludos"];
    const isGreeting = greetingWords.some((w) => q.startsWith(w) || q === w || q.includes(` ${w} `));

    // Detectar solicitud de mazo nuevo
    const wantsNewDeck = DECK_REQUEST_KEYWORDS.some((w) => q.includes(w)) && !q.includes("cómo jugar") && !q.includes("estrategia") && !q.includes("análisis") && !q.includes("analiza");

    // Detectar tipo de mazo en la solicitud
    let requestType = genType;
    if (q.includes("barco") || q.includes("bote") || q.includes("boat")) requestType = "boat";
    else if (q.includes("trofeo") || q.includes("ladder") || q.includes("trophy")) requestType = "trophy";

    try {
      if (isGreeting && !wantsNewDeck) {
        setAiChatMessages([{ role: "user", text }, { role: "assistant", text: `¡Hola! Soy el entrenador de mazos con IA. 🤖

Puedo ayudarte con:
• **Generar mazos** — Decime qué mazo querés y lo creo
• **Analizar mazos** — Mostrame tus mazos y los reviso
• **Cómo jugar** — Hacé clic en "Cómo jugar" en cualquier mazo

¿Qué necesitas hoy?` }]);
        setAiChatLoading(false);
        return;
      }

      if (wantsNewDeck) {
        setDecks([]);
        setWarDecks([]);
        setTrophyDeck([]);
        setBoatDecks([]);
        setAiSuggestedDeck(null);
        setLoadedWarDecks(false);
        setWarDecksError(null);
        setError(null);
        setTrophyError(null);
        setBoatError(null);
        const res = await fetch("/api/ai/suggest-decks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerTag: selectedTag, type: requestType, userInstructions: text }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Error" }));
          throw new Error(err.error || "Error al generar mazos");
        }
        const data = await res.json();
        const newDecks = data.decks || [];
        if (newDecks.length > 0) {
          if (requestType === "trophy") setTrophyDeck(newDecks);
          else if (requestType === "boat") setBoatDecks(newDecks);
          else setDecks(newDecks);
          setActiveSection(requestType === "trophy" ? "trophy" : requestType === "boat" ? "boat" : "ia");
          setAiChatMessages((prev) => [...prev, { role: "assistant", text: `¡Listo! Te generé ${newDecks.length} mazo(s) según tu solicitud. Revisalos en la sección de resultados. 🔥` }]);
        } else {
          setAiChatMessages((prev) => [...prev, { role: "assistant", text: "No pude generar mazos con esos criterios. Intentá con más detalles." }]);
        }
        setAiChatLoading(false);
        return;
      }

      const allCurrentDecks = [...warDecks, ...decks, ...trophyDeck, ...boatDecks];
      const res = await fetch("/api/ai/analyze-decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerTag: selectedTag, decks: allCurrentDecks, question: text }),
      });
      const data = await res.json();
      setAiChatMessages((prev) => [...prev, { role: "assistant", text: data.analysis || data.error || "Error" }]);
    } catch (err) {
      setAiChatMessages((prev) => [...prev, { role: "assistant", text: err instanceof Error ? err.message : "Error al conectar con la IA" }]);
    } finally {
      setAiChatLoading(false);
    }
  };

  const DECK_REQUEST_KEYWORDS = ["mazo", "deck", "quiero", "necesito", "dame", "arma", "crea", "genera", "sugiere", "recomienda", "construye", "hazme"];

  const QUICK_PROMPTS = [
    "Quiero un mazo con Montapuercos",
    "Dame un mazo de Ciclo Rápido",
    "Mejor mazo para guerra",
    "Analiza mis mazos",
    "Sinergias clave de mis mazos",
    "¿Cómo contrarrestar a Megacaballero?",
    "Reemplaza una carta en mi mazo",
    "Mazo para subir a 9000 copas",
    "Mazo meta actual para guerra",
    "Consejos para jugar mi mazo",
  ];

  const selectedMember = members.find((m) => m.playerTag === selectedTag);

  const fetchTopCards = useCallback(async (tag: string) => {
    setTopCardsLoading(true);
    try {
      const res = await fetch(`/api/ai/player-info?playerTag=${encodeURIComponent(tag)}`);
      if (res.ok) {
        const data = await res.json();
        setTopCards(data.topCards || []);
      }
    } catch (err) {
      console.error("Error fetching top cards", err);
    } finally {
      setTopCardsLoading(false);
    }
  }, []);

  useEffect(() => {
    setDecks([]);
    setWarDecks([]);
    setTrophyDeck([]);
    setTopCards([]);
    setLoadedWarDecks(false);
    setWarDecksError(null);
    setError(null);
    setTrophyError(null);
    setActiveSection(null);
    setAiChatMessages([]);
    setAiSuggestedDeck(null);
    setBoatDecks([]);
    setBoatError(null);
    if (selectedTag) {
      fetchTopCards(selectedTag);
    }
  }, [selectedTag, fetchTopCards]);

  const handleLoadWarDecks = async () => {
    if (!selectedTag) return;
    setActiveSection('war');
    setLoadingWarDecks(true);
    setWarDecksError(null);
    setLoadedWarDecks(false);
    try {
      const res = await fetch(`/api/ai/load-war-decks?playerTag=${encodeURIComponent(selectedTag)}&type=${warDeckFilter}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error" }));
        throw new Error(err.error || "Error al cargar mazos de guerra");
      }
      const data = await res.json();
      setWarDecks(data.decks || []);
    } catch (err) {
      setWarDecksError(err instanceof Error ? err.message : "Error al conectar");
    } finally {
      setLoadingWarDecks(false);
      setLoadedWarDecks(true);
    }
  };

  const handleGenerateTrophy = async () => {
    if (!selectedTag) return;
    setActiveSection('trophy');
    setLoadingTrophy(true);
    setTrophyError(null);
    setTrophyDeck([]);
    try {
      const res = await fetch(`/api/ai/trophy-path-deck?playerTag=${encodeURIComponent(selectedTag)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Error' }));
        throw new Error(err.error || 'Error al generar mazo de trofeos');
      }
      const data = await res.json();
      setTrophyDeck(data.decks || []);
    } catch (err) {
      setTrophyError(err instanceof Error ? err.message : 'Error al conectar');
    } finally {
      setLoadingTrophy(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTag) return;
    const type = genType as "war" | "trophy" | "boat";
    const sectionMap: Record<string, string> = { war: "ia", trophy: "trophy", boat: "boat" };
    setActiveSection(sectionMap[type] || "ia");

    if (type === "war") { setLoading(true); setError(null); setDecks([]); }
    else if (type === "trophy") { setLoadingTrophy(true); setTrophyError(null); setTrophyDeck([]); }
    else { setLoadingBoat(true); setBoatError(null); setBoatDecks([]); }

    try {
      const res = await fetch('/api/ai/suggest-decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerTag: selectedTag, type }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Error' }));
        throw new Error(err.error || 'Error al generar mazos');
      }
      const data = await res.json();
      if (type === "war") {
        setDecks(data.decks || []);
      } else if (type === "trophy") {
        setTrophyDeck(data.decks || []);
      } else {
        setBoatDecks(data.decks || []);
      }
      if (data.topCards) setTopCards(data.topCards);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al conectar';
      if (type === "war") setError(msg);
      else if (type === "trophy") setTrophyError(msg);
      else setBoatError(msg);
    } finally {
      if (type === "war") setLoading(false);
      else if (type === "trophy") setLoadingTrophy(false);
      else setLoadingBoat(false);
    }
  };

  if (clanError && !loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <p className="text-sm text-clash-error">{clanError}</p>
          <button onClick={refetchClan} className="px-3 py-1.5 rounded-lg bg-metallic-gold text-black text-xs font-medium">Reintentar</button>
        </div>
      </div>
    );
  }

  if (!loaded) {
    return <Loading text="Cargando miembros..." className="h-64" />;
  }

  return (
    <>
      <div className="relative mb-6">
        <div className="flex items-center gap-2">
          <Sword size={24} className="text-[#ffd700]" style={{ filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.5)) drop-shadow(1px 0 0 rgba(0,0,0,0.5)) drop-shadow(-1px 0 0 rgba(0,0,0,0.5)) drop-shadow(0 -1px 0 rgba(0,0,0,0.5)) drop-shadow(0 0 6px rgba(0,0,0,0.35))' }} />
          <h1 className="text-page-title text-2xl">Mazos de Guerra</h1>
        </div>
        <p className="text-base text-clash-muted mt-1">Aquí puedes optimizar la estrategia de tus Mazos de Guerra con la ayuda de Inteligencia Artificial</p>
      </div>

      <img src="/war-decks.png" alt="Banner" className="w-auto max-w-full h-auto rounded-xl object-contain max-h-[200px] mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>Mazos de Guerra</CardTitle>
            <RefreshCw size={16} className="text-clash-gold" />
          </CardHeader>
          <div className="px-6 pb-6 flex flex-col flex-1 space-y-3">
            <p className="text-xs text-clash-dimmed">Carga Tus mazos de guerra actuales o históricos para ver su rendimiento y optimización con IA</p>
            <div className="flex justify-center">
              <img src="/divisor5.png" alt="" className="w-2/3 h-auto" />
            </div>
            <label className="block text-xs text-clash-muted">Selecciona un miembro</label>
            <MemberSelector members={members} selectedTag={selectedTag} onSelect={setSelectedTag} />
            <div className="flex gap-1.5">
              {(["all", "war", "boat"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setWarDeckFilter(opt)}
                  className={`flex-1 px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                    warDeckFilter === opt
                      ? "bg-metallic-gold text-black border-metallic-gold"
                      : "bg-glass border-white/20 text-clash-muted hover:text-clash-text hover:border-white/40"
                  }`}
                >
                  {opt === "all" ? "📋 Todos" : opt === "war" ? "⚔️ Guerra" : "⛵ Barcos"}
                </button>
              ))}
            </div>
            <div className="mt-auto">
              <Button onClick={handleLoadWarDecks} disabled={!selectedTag || loadingWarDecks} size="lg" className="w-full bg-metallic-gold text-black hover:brightness-110 transition-all">
                {loadingWarDecks ? <RefreshCw size={20} className="mr-2 animate-spin" /> : <RefreshCw size={20} className="mr-2" />}
                {loadingWarDecks ? "Cargando..." : "Cargar Mazos"}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>Generar Mazos IA</CardTitle>
            <Sparkles size={16} className="text-clash-gold" />
          </CardHeader>
          <div className="px-6 pb-6 flex flex-col flex-1 space-y-3">
            <p className="text-xs text-clash-dimmed">Sugerencias personalizadas de mazos usando IA y tu estilo de juego</p>
            <div className="flex justify-center">
              <img src="/divisor.png" alt="" className="w-2/3 h-auto" />
            </div>
            <label className="block text-xs text-clash-muted">Selecciona tipo de mazo</label>
            <select
              value={genType}
              onChange={(e) => setGenType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-glass border border-white/20 text-xs text-clash-text focus:outline-none focus:border-white/50 transition-colors appearance-none cursor-pointer"
            >
              <option value="war">4 Mazos para Guerra</option>
              <option value="trophy">Mazo para Camino de Trofeos</option>
              <option value="boat">4 Mazos para Guerra de Barcos</option>
            </select>
            <div className="mt-auto">
              <Button onClick={handleGenerate} disabled={!selectedTag || loading || loadingTrophy || loadingBoat} size="lg" className="w-full bg-metallic-gold text-black hover:brightness-110 transition-all">
                {loading || loadingTrophy || loadingBoat ? <Sparkles size={20} className="mr-2 animate-pulse" /> : <Sparkles size={20} className="mr-2" />}
                {loading || loadingTrophy || loadingBoat ? "Generando..." : "Generar Mazos"}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>Constructor Manual</CardTitle>
            <Sword size={16} className="text-clash-gold" />
          </CardHeader>
          <div className="px-6 pb-6 flex flex-col flex-1">
            <p className="text-xs text-clash-dimmed mb-3">Arma tu mazo con 8 cartas para que la IA te lo corrija o enceñe a jugarlo </p>
            <div className="flex justify-center my-3">
              <img src="/divisor1.png" alt="" className="w-2/3 h-auto" />
            </div>
            <div className="mt-auto">
              <Button onClick={() => setLadderOpen(true)} size="lg" className="w-full bg-metallic-gold text-black hover:brightness-110 transition-all">
                <Sword size={20} className="mr-2" />
                Abrir Constructor
              </Button>
            </div>
          </div>
        </Card>
      </div>

    <div className="flex flex-col lg:flex-row gap-6">

      {/* CHAT — sidebar izquierda */}
      <div className="w-full lg:w-[380px] shrink-0 lg:pt-16 lg:self-start mb-8">
        {selectedTag && (
          <div className="bg-glass rounded-2xl overflow-hidden shadow-xl flex flex-col max-h-[80vh] min-h-[300px] animate-rainbow-border">
            <div className="p-3 border-b border-clash-border bg-black/20">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-clash-gold" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Entrenador de Mazos con IA</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 ai-chat-area">
              {aiChatMessages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-xs text-clash-dimmed mb-3">
                    Pregunta sobre cualquier mazo o usa los botones rápidos
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {QUICK_PROMPTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          setAiChatInput(p);
                          setTimeout(() => {
                            const input = document.querySelector<HTMLTextAreaElement>(".ai-chat-input");
                            input?.focus();
                          }, 100);
                        }}
                        className="px-3 py-1.5 rounded-full bg-glass border border-white/20 text-[11px] text-clash-muted hover:text-clash-text hover:border-white/40 transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {aiChatMessages.map((msg, i) => (
                <ChatMessage key={i} msg={msg} />
              ))}
              {aiChatLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-3 rounded-xl bg-black/30 border border-clash-border">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-clash-gold border-t-transparent animate-spin" />
                      <span className="text-xs text-clash-dimmed">Pensando...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-clash-border bg-black/20">
              <div className="flex items-center gap-2">
                <textarea
                  value={aiChatInput}
                  onChange={(e) => setAiChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAiChatSubmit(); } }}
                  placeholder="Pregunta sobre los mazos..."
                  className="ai-chat-input flex-1 px-3 py-2 rounded-lg bg-glass border border-white/20 text-xs text-clash-text placeholder-clash-dimmed resize-none focus:outline-none focus:border-white/50 transition-colors"
                  rows={2}
                />
                <button
                  onClick={() => handleAiChatSubmit()}
                  disabled={!aiChatInput.trim() || aiChatLoading}
                  className="p-2 rounded-lg bg-metallic-gold text-black border border-yellow-400/40 hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RESULTADOS */}
      <div className="flex-1 min-w-0 space-y-6">
        {loadedWarDecks && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-sm font-bold text-clash-gold uppercase tracking-wider mb-3 flex items-center gap-2">
              <RefreshCw size={14} /> Mazos de Guerra Cargados
            </h3>
            {warDecksError && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-500 mb-3"><AlertCircle size={12} /> {warDecksError}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {warDecks.map((deck, i) => (
                <DeckCard key={i} deck={deck} type="war" onAskHowToPlay={handleAskHowToPlay} />
              ))}
            </div>
          </div>
        )}

        {decks.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-sm font-bold text-clash-gold uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles size={14} /> Sugerencias IA — Guerra
            </h3>
            {error && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-500 mb-3"><AlertCircle size={12} /> {error}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {decks.map((deck, i) => (
                <DeckCard key={i} deck={deck} type="war" onAskHowToPlay={handleAskHowToPlay} />
              ))}
            </div>
          </div>
        )}

        {trophyDeck.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-sm font-bold text-clash-gold uppercase tracking-wider mb-3 flex items-center gap-2">
              🏆 Mazo de Trofeos
            </h3>
            {trophyError && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-500 mb-3"><AlertCircle size={12} /> {trophyError}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {trophyDeck.map((deck, i) => (
                <DeckCard key={i} deck={deck} type="trophy" onAskHowToPlay={handleAskHowToPlay} />
              ))}
            </div>
          </div>
        )}

        {boatDecks.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-sm font-bold text-clash-gold uppercase tracking-wider mb-3 flex items-center gap-2">
              ⛵ Mazos de Barcos
            </h3>
            {boatError && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-500 mb-3"><AlertCircle size={12} /> {boatError}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {boatDecks.map((deck, i) => (
                <DeckCard key={i} deck={deck} type="boat" onAskHowToPlay={handleAskHowToPlay} />
              ))}
            </div>
          </div>
        )}

        {aiSuggestedDeck && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-sm font-bold text-clash-gold uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles size={14} /> Mazo Sugerido por IA
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DeckCard deck={aiSuggestedDeck} type="war" onAskHowToPlay={handleAskHowToPlay} />
            </div>
          </div>
        )}

        {!selectedTag && (
          <div className="text-center py-12 text-clash-dimmed text-xl font-medium">
            Selecciona un miembro del clan para cargar o generar mazos.
          </div>
        )}
      </div>

    </div>

      <LadderDeckSelector open={ladderOpen} onClose={() => setLadderOpen(false)} onSendToWarDecks={handleSendManualDeck} />
    </>
  );
}
