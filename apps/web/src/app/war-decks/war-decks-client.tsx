"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useClanStore } from "@/lib/store";
import { useClanData } from "@/hooks/use-clan-data";
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
  let key = 0;

  for (const line of lines) {
    const result = tokenizeLine(line, key);
    if (result.nodes.length > 0) {
      nodes.push(<div key={key} className="text-xs text-clash-text leading-relaxed">{result.nodes}</div>);
    } else {
      nodes.push(<div key={key} className="text-xs text-clash-text leading-relaxed">&nbsp;</div>);
    }
    key = result.nextKey;
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

  const handleAskHowToPlay = async (deck: DeckResult) => {
    const cardNames = deck.cards.map((c) => typeof c === "string" ? c : c.name);
    setAiChatMessages((prev) => [...prev, { role: "user", text: `¿Cómo jugar el mazo "${deck.name}"?` }]);
    setAiChatLoading(true);
    try {
      const res = await fetch("/api/ai/how-to-play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckName: deck.name, cards: cardNames }),
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
    setAiChatMessages((prev) => [...prev, { role: "user", text }]);
    setAiChatLoading(true);
    try {
      const allCurrentDecks = [...warDecks, ...decks, ...trophyDeck];
      const res = await fetch("/api/ai/analyze-decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerTag: selectedTag, decks: allCurrentDecks, question: text }),
      });
      const data = await res.json();
      setAiChatMessages((prev) => [...prev, { role: "assistant", text: data.analysis || data.error || "Error" }]);
    } catch {
      setAiChatMessages((prev) => [...prev, { role: "assistant", text: "Error al conectar con la IA" }]);
    } finally {
      setAiChatLoading(false);
    }
  };

  const QUICK_PROMPTS = [
    "Mazo Montapuercos",
    "Ciclo Rápido",
    "Mejor mazo para guerra",
    "Debilidades del mazo",
    "Sinergias clave",
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
      const res = await fetch(`/api/ai/load-war-decks?playerTag=${encodeURIComponent(selectedTag)}`);
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <img src="/carga4.gif" alt="Cargando..." className="w-32 h-32 mx-auto" />
          <p className="text-sm text-clash-muted">Cargando miembros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="flex items-center gap-2">
          <Sword size={24} className="text-[#ffd700]" style={{ filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.5)) drop-shadow(1px 0 0 rgba(0,0,0,0.5)) drop-shadow(-1px 0 0 rgba(0,0,0,0.5)) drop-shadow(0 -1px 0 rgba(0,0,0,0.5)) drop-shadow(0 0 6px rgba(0,0,0,0.35))' }} />
          <h1 className="text-page-title text-2xl">Mazos de Guerra</h1>
        </div>
        <p className="text-base text-clash-muted mt-1">Aquí puedes optimizar la estrategia de tus Mazos de Guerra con la ayuda de Inteligencia Artificial</p>
      </div>

      <img src="/war-decks.png" alt="Banner" className="w-auto max-w-full h-auto rounded-xl object-contain max-h-[200px]" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
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
            <div className="mt-auto">
              <Button onClick={handleLoadWarDecks} disabled={!selectedTag || loadingWarDecks} size="lg" className="w-full bg-metallic-gold text-black hover:brightness-110 transition-all">
                {loadingWarDecks ? <img src="/carga4.gif" alt="" className="w-5 h-5 mr-2" /> : <RefreshCw size={20} className="mr-2" />}
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
                {loading || loadingTrophy || loadingBoat ? <img src="/carga4.gif" alt="" className="w-5 h-5 mr-2" /> : <Sparkles size={20} className="mr-2" />}
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

      {/* PANEL DE RESULTADOS — DOS COLUMNAS */}
      {(activeSection && (decks.length > 0 || warDecks.length > 0 || trophyDeck.length > 0 || boatDecks.length > 0 || aiSuggestedDeck)) && (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 flex-wrap">
              {warDecks.length > 0 && (
                <button onClick={() => setActiveSection('war')} className={`font-bold uppercase text-sm tracking-wider transition-colors ${activeSection === 'war' ? 'text-clash-gold' : 'text-white/50 hover:text-white'}`}>
                  Mazos de Guerra
                </button>
              )}
              {decks.length > 0 && (
                <button onClick={() => setActiveSection('ia')} className={`font-bold uppercase text-sm tracking-wider transition-colors ${activeSection === 'ia' ? 'text-clash-gold' : 'text-white/50 hover:text-white'}`}>
                  Sugerencias IA
                </button>
              )}
              {trophyDeck.length > 0 && (
                <button onClick={() => setActiveSection('trophy')} className={`font-bold uppercase text-sm tracking-wider transition-colors ${activeSection === 'trophy' ? 'text-clash-gold' : 'text-white/50 hover:text-white'}`}>
                  🏆 Mazo de Trofeos
                </button>
              )}
              {boatDecks.length > 0 && (
                <button onClick={() => setActiveSection('boat')} className={`font-bold uppercase text-sm tracking-wider transition-colors ${activeSection === 'boat' ? 'text-clash-gold' : 'text-white/50 hover:text-white'}`}>
                  ⛵ Mazos de Barcos
                </button>
              )}
              {aiSuggestedDeck && (
                <button onClick={() => setActiveSection('ai-suggested')} className={`inline-flex items-center gap-1.5 font-bold uppercase text-sm tracking-wider transition-colors ${activeSection === 'ai-suggested' ? 'text-clash-gold' : 'text-white/50 hover:text-white'}`}>
                  <Sparkles size={14} /> Sugerido IA
                </button>
              )}
            </div>
            <button onClick={() => setActiveSection(null)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-clash-muted">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* COLUMNA IZQUIERDA — Mazos */}
            <div className="space-y-3">
              {activeSection === 'war' && warDecksError && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400"><AlertCircle size={12} /> {warDecksError}</div>
              )}
              {activeSection === 'ia' && error && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400"><AlertCircle size={12} /> {error}</div>
              )}
              {activeSection === 'trophy' && trophyError && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400"><AlertCircle size={12} /> {trophyError}</div>
              )}
              {activeSection === 'boat' && boatError && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400"><AlertCircle size={12} /> {boatError}</div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeSection === 'war' && warDecks.map((deck, i) => (
                  <DeckCard key={i} deck={deck} onAskHowToPlay={handleAskHowToPlay} />
                ))}
                {activeSection === 'ia' && decks.map((deck, i) => (
                  <DeckCard key={i} deck={deck} onAskHowToPlay={handleAskHowToPlay} />
                ))}
                {activeSection === 'trophy' && trophyDeck.map((deck, i) => (
                  <DeckCard key={i} deck={deck} onAskHowToPlay={handleAskHowToPlay} />
                ))}
                {activeSection === 'boat' && boatDecks.map((deck, i) => (
                  <DeckCard key={i} deck={deck} onAskHowToPlay={handleAskHowToPlay} />
                ))}
                {activeSection === 'ai-suggested' && aiSuggestedDeck && (
                  <DeckCard deck={aiSuggestedDeck} onAskHowToPlay={handleAskHowToPlay} />
                )}
              </div>
            </div>

            {/* COLUMNA DERECHA — Chat IA */}
            <div className="bg-glass border border-white/20 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[60vh]">
              <div className="p-3 border-b border-clash-border bg-black/20">
                <div className="flex items-center gap-2">
                  <Brain size={16} className="text-clash-gold" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Entrenador de Mazos con IA</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
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
                        <img src="/carga4.gif" alt="" className="w-4 h-4" />
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
          </div>
        </div>
      )}

      {!selectedTag && (
        <div className="text-center py-12 text-clash-dimmed text-xl font-medium">
          Selecciona un miembro del clan para cargar o generar mazos.
        </div>
      )}

      <LadderDeckSelector open={ladderOpen} onClose={() => setLadderOpen(false)} onSendToWarDecks={handleSendManualDeck} />
    </div>
  );
}
