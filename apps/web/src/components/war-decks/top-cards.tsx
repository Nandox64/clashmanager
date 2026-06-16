"use client";

import { getCardImageUrl } from "@/lib/cards";
import { ElixirIcon } from "@/components/ui/elixir-icon";
import { Star } from "lucide-react";

interface PlayerCard {
  name: string;
  level: number;
  maxLevel: number;
  elixir: number;
  rarity: string;
  ratio: number;
  iconUrl?: string;
  isEvolved?: boolean;
}

interface TopCardsProps {
  cards: PlayerCard[];
  title?: string;
}

function rarityBg(rarity: string): string {
  switch (rarity) {
    case "common": return "from-gray-500/15 to-gray-600/5 border-gray-500/25";
    case "rare": return "from-yellow-500/15 to-yellow-600/5 border-yellow-500/25";
    case "epic": return "from-purple-500/15 to-purple-600/5 border-purple-500/25";
    case "legendary": return "from-orange-500/15 to-orange-600/5 border-orange-500/25";
    case "champion": return "from-cyan-500/15 to-cyan-600/5 border-cyan-500/25";
    default: return "from-gray-500/15 to-gray-600/5 border-gray-500/25";
  }
}

function rarityGlow(rarity: string): string {
  switch (rarity) {
    case "legendary": return "shadow-[0_0_8px_rgba(251,146,60,0.3)]";
    case "champion": return "shadow-[0_0_8px_rgba(34,211,238,0.3)]";
    case "epic": return "shadow-[0_0_8px_rgba(168,85,247,0.2)]";
    default: return "";
  }
}

function rarityLabel(rarity: string): string {
  switch (rarity) {
    case "common": return "Común";
    case "rare": return "Rara";
    case "epic": return "Épica";
    case "legendary": return "Legendaria";
    case "champion": return "Campeón";
    default: return rarity;
  }
}

function EvoBadge() {
  return (
    <span className="absolute top-0.5 right-0.5 text-[7px] font-bold bg-purple-600 text-white px-1 rounded-sm leading-tight">
      EVO
    </span>
  );
}

export function TopCards({ cards, title }: TopCardsProps) {
  return (
    <div>
      {title && <h3 className="text-sm font-medium text-clash-text mb-2">{title}</h3>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {cards.map((card) => (
          <div
            key={card.name}
            className={`relative flex flex-col items-center p-3 rounded-xl bg-gradient-to-b ${rarityBg(card.rarity)} border ${rarityGlow(card.rarity)} min-h-[160px]`}
          >
            <div className="relative flex-1 flex items-center justify-center w-full">
              <img
                src={card.iconUrl || getCardImageUrl(card.name, card.isEvolved)}
                alt={card.name}
                className="w-16 h-20 object-contain drop-shadow-lg"
                loading="lazy"
                onError={(e) => {
                  if (card.isEvolved) {
                    e.currentTarget.src = card.iconUrl || getCardImageUrl(card.name, false);
                    e.currentTarget.onerror = null;
                  }
                }}
              />
              {card.isEvolved && <EvoBadge />}
            </div>
            <div className="flex items-center gap-2 my-1.5">
              <div className="flex items-center gap-0.5">
                <Star size={9} fill="currentColor" className="text-yellow-400" />
                <span className="text-xs font-bold text-clash-text leading-none">
                  {card.level}<span className="text-clash-muted font-normal">/{card.maxLevel}</span>
                </span>
              </div>
              <span className="flex items-center gap-0.5">
                <ElixirIcon size={9} />
                <span className="text-xs font-medium text-purple-300">{card.elixir}</span>
              </span>
            </div>
            <span className="text-xs text-clash-text text-center leading-tight truncate w-full font-medium">
              {card.name}
            </span>
            <span className="text-[9px] text-clash-muted uppercase tracking-wider mt-0.5">
              {rarityLabel(card.rarity)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
