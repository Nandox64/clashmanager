import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, Share2, Check, BookOpen } from "lucide-react";
import { ElixirIcon } from "@/components/ui/elixir-icon";
import { findCard, getCardImageUrl, getDeckShareLink } from "@/lib/cards";

interface CardData {
  name: string;
  id?: number;
  maxLevel?: number;
  elixir?: number;
  iconUrl?: string | null;
  isEvolved?: boolean;
}

interface DeckCardProps {
  deck: {
    name: string;
    cards: (string | CardData)[];
    elixirAvg: number;
    description: string;
    isAI: boolean;
    howToPlay?: string;
  };
  onAskHowToPlay?: (deck: DeckCardProps["deck"]) => void;
}

function toCardData(card: string | CardData): CardData {
  return typeof card === "string" ? { name: card } : card;
}

export function DeckCard({ deck, onAskHowToPlay }: DeckCardProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const cardNames = deck.cards.map((c) => toCardData(c).name);
    const link = getDeckShareLink(cardNames);
    if (!link) return;
    try {
      await navigator.clipboard.writeText(cardNames.join(", "));
    } catch { }
    window.open(link, "_blank");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-lg text-clash-text">{deck.name}</h3>
          <p className="text-xs text-clash-muted mt-0.5">{deck.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-1.5 mb-3 flex-wrap">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-metallic-gold text-[11px] font-bold text-black">
          <Sparkles size={10} className="text-black" /> {deck.elixirAvg.toFixed(1)} ⌀
        </span>
        {deck.isAI ? (
          <Badge variant="info">
            <Sparkles size={10} className="mr-1" /> IA
          </Badge>
        ) : (
          <Badge variant="info">
            <Brain size={10} className="mr-1" /> Arquetipo
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {deck.cards.map((raw) => {
          const card = toCardData(raw);
          const info = findCard(card.name);
          const elixir = info?.elixir ?? card.elixir;
          const evolved = card.isEvolved === true;
          const imgSrc = evolved ? getCardImageUrl(card.name, true) : (card.iconUrl || getCardImageUrl(card.name));
          return (
            <div
              key={card.name}
              className="flex flex-col items-center bg-glass rounded-lg overflow-hidden"
            >
              <div className="relative w-full aspect-[3/4]">
                <img
                  src={imgSrc}
                  alt={card.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    if (evolved) {
                      e.currentTarget.src = card.iconUrl || getCardImageUrl(card.name, false);
                      e.currentTarget.onerror = null;
                    }
                  }}
                />
              </div>
              {elixir != null && (
                <span className="flex items-center gap-1 py-1">
                  <ElixirIcon size={9} />
                  <span className="text-[10px] font-medium text-purple-300">{elixir}</span>
                  {evolved && (
                    <span className="text-[8px] font-bold bg-purple-600 text-white px-1 rounded-sm leading-tight">
                      EVO
                    </span>
                  )}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-metallic-gold animate-metallic-shimmer text-black border border-yellow-400/40 text-xs font-medium hover:brightness-110 transition-all"
        >
          {copied ? (
            <><Check size={14} /> Copiado</>
          ) : (
            <><Share2 size={14} /> Enviar</>
          )}
        </button>
        <button
          onClick={() => onAskHowToPlay?.(deck)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-glass border border-white/20 text-xs text-clash-text hover:bg-white/10 transition-all"
        >
          <BookOpen size={14} /> Cómo jugar
        </button>
      </div>
    </Card>
  );
}
