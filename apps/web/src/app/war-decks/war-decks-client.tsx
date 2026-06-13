"use client";

import { useState, useEffect, useCallback } from "react";
import { useClanStore } from "@/lib/store";
import { useClanData } from "@/hooks/use-clan-data";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberSelector } from "@/components/war-decks/member-selector";
import { DeckCard } from "@/components/war-decks/deck-card";
import { Button } from "@/components/ui/button";
import { getCachedLinkedMemberId } from "@/lib/profile-cache";
import { Sparkles, AlertCircle, RefreshCw } from "lucide-react";

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
  cards: (string | { name: string; id?: number; maxLevel?: number; iconUrl?: string | null })[];
  elixirAvg: number;
  description: string;
  isAI: boolean;
}

export function WarDecksClient() {
  const { loading: clanLoading, error: clanError, refetch: refetchClan } = useClanData();
  const members = useClanStore((s) => s.members);
  const loaded = useClanStore((s) => s.loaded);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

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

  const selectedMember = members.find((m) => m.playerTag === selectedTag);

  const fetchTopCards = useCallback(async (tag: string) => {
    setTopCardsLoading(true);
    try {
      const res = await fetch(`/api/ai/player-info?playerTag=${encodeURIComponent(tag)}`);
      if (res.ok) {
        const data = await res.json();
        setTopCards(data.topCards || []);
      }
    } catch {
      // silencioso — no bloquear la UI
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
    if (selectedTag) {
      fetchTopCards(selectedTag);
    }
  }, [selectedTag, fetchTopCards]);

  const handleLoadWarDecks = async () => {
    if (!selectedTag) return;
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

  // Generar mazo de camino de trofeos (usando las mejores cartas del jugador)
  const handleGenerateTrophy = async () => {
    if (!selectedTag) return;
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
    setLoading(true);
    setError(null);
    setDecks([]);
    try {
      const res = await fetch('/api/ai/suggest-decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerTag: selectedTag }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Error' }));
        throw new Error(err.error || 'Error al generar mazos');
      }
      const data = await res.json();
      setDecks(data.decks || []);
      if (data.topCards) setTopCards(data.topCards);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar');
    } finally {
      setLoading(false);
    }
  };

  if (clanError && !loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <p className="text-sm text-clash-error">{clanError}</p>
          <button
            onClick={refetchClan}
            disabled={clanLoading}
            className="px-3 py-1.5 rounded-lg bg-metallic-gold animate-metallic-shimmer text-black border border-clash-border text-xs font-medium hover:brightness-110 disabled:opacity-50"
          >
            Reintentar
          </button>
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
      <div>
        <h1 className="text-2xl font-extrabold text-clash-gold tracking-wider text-title-shadow">Mazos de Guerra</h1>
        <p className="text-base text-clash-muted mt-1">
          Genera 4 mazos óptimos para cada miembro del clan
        </p>
      </div>

      {/* Member selector at top */}
      <div className="w-full sm:w-80">
        <label className="block text-xs text-clash-dimmed mb-1.5">
          Selecciona un miembro
        </label>
        <MemberSelector
          members={members}
          selectedTag={selectedTag}
          onSelect={setSelectedTag}
        />
      </div>

      {/* 3 feature cards below */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Mazos de Guerra</CardTitle>
            <RefreshCw size={16} className="text-clash-gold" />
          </CardHeader>
          <div className="flex-1 flex flex-col">
            <p className="text-xs text-clash-dimmed mb-3">
              Carga los mazos de guerra actuales o históricos
            </p>
            <img src="/divisor5.png" alt="" className="w-2/3 h-auto mx-auto my-3" />
            {warDecksError && (
              <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                <AlertCircle size={12} />
                {warDecksError}
              </div>
            )}
            {loadedWarDecks && warDecks.length === 0 && !warDecksError && (
              <p className="text-xs text-clash-dimmed mt-3 text-center">
                No se encontraron batallas de guerra.
                <br />
                El jugador debe participar en la guerra de clanes.
              </p>
            )}
            {warDecks.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-clash-dimmed font-medium">Mazos de guerra actuales</p>
                <div className="grid grid-cols-1 gap-2">
                  {warDecks.map((deck, i) => (
                    <DeckCard key={i} deck={deck} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button
            onClick={handleLoadWarDecks}
            disabled={!selectedTag || loadingWarDecks}
            size="lg"
            className="w-full bg-metallic-gold text-black hover:brightness-110 transition-all mt-4"
          >
            {loadingWarDecks ? (
              <img src="/carga4.gif" alt="" className="w-5 h-5 mr-2" />
            ) : (
              <RefreshCw size={20} className="mr-2" />
            )}
            {loadingWarDecks ? "Cargando..." : "Cargar Mazos"}
          </Button>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Generar Mazos IA</CardTitle>
            <Sparkles size={16} className="text-clash-gold" />
          </CardHeader>
          <div className="flex-1 flex flex-col">
            <p className="text-xs text-clash-dimmed mb-3">
              Sugerencias de mazos personalizadas usando IA
            </p>
            <img src="/divisor.png" alt="" className="w-2/3 h-auto mx-auto my-3" />
            {error && (
              <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                <AlertCircle size={12} />
                {error}
              </div>
            )}
            {decks.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-clash-dimmed font-medium">
                  Mazos para <span className="text-clash-gold">{selectedMember?.displayName}</span>
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {decks.map((deck, i) => (
                    <DeckCard key={i} deck={deck} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button
            onClick={handleGenerate}
            disabled={!selectedTag || loading}
            size="lg"
            className="w-full bg-metallic-gold text-black hover:brightness-110 transition-all mt-4"
          >
            {loading ? (
              <img src="/carga4.gif" alt="" className="w-5 h-5 mr-2" />
            ) : (
              <Sparkles size={20} className="mr-2" />
            )}
            {loading ? "Generando..." : "Generar Mazos"}
          </Button>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Mazo de Trofeos</CardTitle>
            <Sparkles size={16} className="text-clash-gold" />
          </CardHeader>
          <div className="flex-1 flex flex-col">
            <p className="text-xs text-clash-dimmed mb-3">
              Mazo optimizado para subir de trofeos con tus mejores cartas
            </p>
            <img src="/divisor1.png" alt="" className="w-2/3 h-auto mx-auto my-3" />
            {trophyError && (
              <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                <AlertCircle size={12} />
                {trophyError}
              </div>
            )}
            {trophyDeck.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-clash-dimmed font-medium">Mazo de trofeos generado</p>
                <div className="grid grid-cols-1 gap-2">
                  {trophyDeck.map((deck, i) => (
                    <DeckCard key={i} deck={deck} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button
            onClick={handleGenerateTrophy}
            disabled={!selectedTag || loadingTrophy}
            size="lg"
            className="w-full bg-metallic-gold text-black hover:brightness-110 transition-all mt-4"
          >
            {loadingTrophy ? (
              <img src="/carga4.gif" alt="" className="w-5 h-5 mr-2" />
            ) : (
              <Sparkles size={20} className="mr-2" />
            )}
            {loadingTrophy ? "Generando..." : "Generar Mazo"}
          </Button>
        </Card>
      </div>

      {/* Message when no member selected */}
      {!selectedTag && (
        <div className="text-center py-12 text-clash-dimmed text-xl font-medium">
          Selecciona un miembro del clan para cargar o generar mazos.
        </div>
      )}
    </div>
  );
}
