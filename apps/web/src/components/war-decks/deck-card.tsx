import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, Share2, Check } from "lucide-react";
import { ElixirIcon } from "@/components/ui/elixir-icon";
import { findCard, getCardImageUrl, isHeroOrEvo, getDeckShareLink } from "@/lib/cards";

interface DeckCardProps {
  deck: {
    name: string;
    cards: string[];
    elixirAvg: number;
    description: string;
    isAI: boolean;
  };
  index: number;
}

function rarityBorder(rarity: string): string {
  switch (rarity) {
    case "common": return "border-gray-500/30";
    case "rare": return "border-yellow-500/30";
    case "epic": return "border-purple-500/30";
    case "legendary": return "border-orange-500/30";
    case "champion": return "border-cyan-500/30";
    default: return "border-gray-500/30";
  }
}

export function DeckCard({ deck, index }: DeckCardProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const link = getDeckShareLink(deck.cards);
    if (!link) return;
    try {
      await navigator.clipboard.writeText(deck.cards.join(", "));
    } catch { }
    window.open(link, "_blank");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-clash-text">
              #{index + 1}
            </span>
            <h3 className="font-semibold text-clash-text">{deck.name}</h3>
          </div>
          <p className="text-xs text-clash-muted mt-0.5">{deck.description}</p>
        </div>
        <div className="flex items-center gap-2">
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
      </div>

      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        <Badge variant="default" className="text-xs">
          <Sparkles size={10} className="mr-1" /> {deck.elixirAvg.toFixed(1)} ⌀
        </Badge>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {deck.cards.map((cardName) => {
          const info = findCard(cardName);
          return (
            <div
              key={cardName}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg bg-glass border ${rarityBorder(info?.rarity ?? "common")}`}
            >
              <img
                src={getCardImageUrl(cardName, isHeroOrEvo(cardName))}
                alt={cardName}
                className="w-12 h-16 object-contain drop-shadow-lg"
                loading="lazy"
              />
              <span className="text-[11px] text-clash-text text-center leading-tight truncate w-full font-medium">
                {cardName}
              </span>
              {info && (
                <span className="flex items-center gap-0.5">
                  <ElixirIcon size={9} />
                  <span className="text-[10px] font-medium text-purple-300">{info.elixir}</span>
                </span>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleShare}
        className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-metallic-gold animate-metallic-shimmer text-black border border-clash-border text-xs font-medium hover:brightness-110 transition-all"
      >
        {copied ? (
          <><Check size={14} /> Copiado — abre CR</>
        ) : (
          <><Share2 size={14} /> Enviar mazo al juego</>
        )}
      </button>
    </Card>
  );
}
