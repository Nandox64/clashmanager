"use client";

import { useState, useMemo } from "react";
import { CARDS, getCardImageUrl, getDeckShareLink } from "@/lib/cards";
import type { CardInfo } from "@/lib/cards";
import { ElixirIcon } from "@/components/ui/elixir-icon";
import { X, Sword, Trash2, Send } from "lucide-react";

const RARITY_ORDER = ["legendary", "champion", "epic", "rare", "common"] as const;
const RARITY_LABELS: Record<string, string> = {
  legendary: "Legendarias",
  champion: "Campeones",
  epic: "Épicas",
  rare: "Raras",
  common: "Comunes",
};
const RARITY_COLORS: Record<string, string> = {
  legendary: "border-orange-500/40 bg-orange-500/10",
  champion: "border-cyan-500/40 bg-cyan-500/10",
  epic: "border-purple-500/40 bg-purple-500/10",
  rare: "border-yellow-500/40 bg-yellow-500/10",
  common: "border-gray-500/40 bg-gray-500/10",
};

interface LadderDeckSelectorProps {
  open: boolean;
  onClose: () => void;
  onSendToWarDecks?: (deck: { name: string; cards: string[]; elixirAvg: number }) => void;
}

export function LadderDeckSelector({ open, onClose, onSendToWarDecks }: LadderDeckSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [filterRarity, setFilterRarity] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sent, setSent] = useState(false);

  const filteredCards = useMemo(() => {
    let cards = CARDS;
    if (filterRarity) {
      cards = cards.filter((c) => c.rarity === filterRarity);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      cards = cards.filter((c) => c.name.toLowerCase().includes(q));
    }
    return cards;
  }, [filterRarity, search]);

  const groupedByRarity = useMemo(() => {
    const groups: Record<string, CardInfo[]> = {};
    for (const r of RARITY_ORDER) {
      const g = filteredCards.filter((c) => c.rarity === r);
      if (g.length > 0) groups[r] = g;
    }
    return groups;
  }, [filteredCards]);

  const toggleCard = (name: string) => {
    setSelected((prev) => {
      if (prev.includes(name)) {
        return prev.filter((n) => n !== name);
      }
      if (prev.length >= 8) return prev;
      return [...prev, name];
    });
  };

  const elixirAvg = useMemo(() => {
    if (selected.length === 0) return 0;
    const total = selected.reduce((sum, name) => {
      const card = CARDS.find((c) => c.name === name);
      return sum + (card?.elixir ?? 0);
    }, 0);
    return Math.round((total / selected.length) * 10) / 10;
  }, [selected]);

  const handleSend = () => {
    if (selected.length !== 8 || !onSendToWarDecks) return;
    const totalElixir = selected.reduce((sum, name) => {
      const card = CARDS.find((c) => c.name === name);
      return sum + (card?.elixir ?? 3);
    }, 0);
    onSendToWarDecks({
      name: "Mazo Manual",
      cards: selected,
      elixirAvg: Math.round((totalElixir / 8) * 10) / 10,
    });
    setSent(true);
    setTimeout(() => { setSent(false); setSelected([]); onClose(); }, 500);
  };

  const handleClear = () => setSelected([]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-glass border border-white/20 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-clash-border flex justify-between items-center bg-black/20">
          <div className="flex items-center gap-2">
            <Sword className="text-clash-gold" size={20} />
            <h3 className="font-bold text-white uppercase tracking-wider text-sm">
              Constructor de Mazos
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X size={18} className="text-clash-muted" />
          </button>
        </div>

        <div className="p-4 border-b border-clash-border bg-black/10 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-clash-dimmed">Filtro:</span>
            <button
              onClick={() => setFilterRarity(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                filterRarity === null
                  ? "bg-metallic-gold text-black border-metallic-gold"
                  : "bg-glass border-white/20 text-clash-muted hover:text-clash-text hover:border-white/40"
              }`}
            >
              Todas
            </button>
            {RARITY_ORDER.map((r) => (
              <button
                key={r}
                onClick={() => setFilterRarity(r)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  filterRarity === r
                    ? "bg-metallic-gold text-black border-metallic-gold"
                    : "bg-glass border-white/20 text-clash-muted hover:text-clash-text hover:border-white/40"
                }`}
              >
                {RARITY_LABELS[r]}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar carta..."
            className="w-full px-3 py-2 rounded-lg bg-glass border border-white/20 text-xs text-clash-text placeholder-clash-dimmed focus:outline-none focus:border-white/50 transition-colors"
          />
        </div>

        <div className="h-[460px] overflow-y-auto custom-scrollbar p-4">
          {Object.entries(groupedByRarity).length === 0 ? (
            <p className="text-center text-clash-dimmed text-sm py-8">Sin resultados</p>
          ) : (
            Object.entries(groupedByRarity).map(([rarity, cards]) => (
              <div key={rarity} className="mb-4">
                <h4 className="text-xs font-medium text-clash-muted uppercase tracking-wider mb-2 px-1">
                  {RARITY_LABELS[rarity]} ({cards.length})
                </h4>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  {cards.map((card) => {
                    const isSelected = selected.includes(card.name);
                    return (
                      <button
                        key={card.name}
                        onClick={() => toggleCard(card.name)}
                        disabled={!isSelected && selected.length >= 8}
                        className={`w-full flex flex-col items-center rounded-lg border transition-all py-1.5 ${
                          isSelected
                            ? "border-metallic-gold bg-metallic-gold/20 scale-105"
                            : "border-transparent bg-black/20 hover:bg-white/5 opacity-70 hover:opacity-100"
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        <img
                          src={getCardImageUrl(card.name)}
                          alt={card.name}
                          className="w-full object-contain aspect-[5/7]"
                          loading="lazy"
                          onError={(e) => { e.currentTarget.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 140'><rect fill='%23333' width='100' height='140' rx='8'/><text x='50' y='75' text-anchor='middle' fill='%23666' font-size='10'>?</text></svg>"; }}
                        />
                        <span className="text-[10px] text-clash-text text-center leading-tight mt-1 truncate w-full px-0.5">
                          {card.name}
                        </span>
                        <span className="flex items-center gap-0.5 mt-0.5">
                          <ElixirIcon size={8} />
                          <span className="text-[9px] text-purple-300 font-medium">{card.elixir}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-clash-border bg-black/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-clash-dimmed">
                Seleccionadas: <strong className="text-clash-text">{selected.length}</strong>/8
              </span>
              {selected.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-metallic-gold text-[11px] font-bold text-black">
                  <ElixirIcon size={9} /> {elixirAvg} ⌀
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selected.length > 0 && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-glass border border-white/20 text-xs text-clash-muted hover:text-clash-text transition-colors"
                >
                  <Trash2 size={12} />
                  Limpiar
                </button>
              )}
              <button
                onClick={handleSend}
                disabled={selected.length !== 8}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-metallic-gold animate-metallic-shimmer text-black border border-yellow-400/40 text-xs font-bold hover:brightness-110 disabled:opacity-50 transition-all"
              >
                <Send size={12} />
                {sent ? "¡Enviado!" : selected.length === 8 ? "Enviar a Mazos de Guerra" : `Faltan ${8 - selected.length}`}
              </button>
            </div>
          </div>
          {selected.length > 0 && (
            <div className="flex items-center gap-2">
              {selected.map((name) => {
                const card = CARDS.find((c) => c.name === name);
                return (
                  <div
                    key={name}
                    className="relative flex flex-col items-center p-1 rounded-lg bg-black/30 border border-clash-border w-14"
                  >
                    <button
                      onClick={() => toggleCard(name)}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500/80 flex items-center justify-center hover:bg-red-500 transition-colors"
                    >
                      <X size={8} className="text-white" />
                    </button>
                    <img
                      src={getCardImageUrl(name)}
                      alt={name}
                      className="w-8 h-10 object-contain"
                      onError={(e) => { e.currentTarget.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 140'><rect fill='%23333' width='100' height='140' rx='8'/><text x='50' y='75' text-anchor='middle' fill='%23666' font-size='10'>?</text></svg>"; }}
                    />
                    <span className="text-[8px] text-clash-text text-center truncate w-full">
                      {name}
                    </span>
                    <span className="text-[8px] text-purple-300 font-medium">
                      {card?.elixir ?? "?"}⚡
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
