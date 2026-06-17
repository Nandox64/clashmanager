import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, Share2, Check, BookOpen } from "lucide-react";
import { getCardImageUrl, getDeckShareLink } from "@/lib/cards";

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
  type?: "war" | "trophy" | "boat";
  onAskHowToPlay?: (deck: DeckCardProps["deck"], type?: string) => void;
}

function toCardData(card: string | CardData): CardData {
  return typeof card === "string" ? { name: card } : card;
}

export function DeckCard({ deck, type = "war", onAskHowToPlay }: DeckCardProps) {
  const [copied, setCopied] = useState(false);
  const [loadingHowToPlay, setLoadingHowToPlay] = useState<string | null>(null);

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
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm text-clash-text truncate">{deck.name}</h3>
          <p className="text-[10px] text-clash-muted truncate">{deck.description}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-metallic-gold text-[10px] font-bold text-black">
            <Sparkles size={8} className="text-black" /> {deck.elixirAvg.toFixed(1)} ⌀
          </span>
          {deck.isAI ? (
            <Badge variant="info" size="sm"><Sparkles size={8} className="mr-0.5" /> IA</Badge>
          ) : (
            <Badge variant="info" size="sm"><Brain size={8} className="mr-0.5" /> Arquetipo</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {deck.cards.map((raw) => {
          const card = toCardData(raw);
          const evolved = card.isEvolved === true;
          const imgSrc = evolved ? getCardImageUrl(card.name, true) : (card.iconUrl || getCardImageUrl(card.name));
          return (
            <div
              key={card.name}
              className="relative bg-glass rounded overflow-hidden"
            >
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
              {evolved && (
                <span className="absolute bottom-0 left-0 right-0 text-[7px] font-bold bg-purple-600 text-white text-center leading-tight py-px">
                  EVO
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-metallic-gold animate-metallic-shimmer text-black border border-yellow-400/40 text-[11px] font-medium hover:brightness-110 transition-all"
        >
          {copied ? (
            <><Check size={12} /> Copiado</>
          ) : (
            <><Share2 size={12} /> Enviar</>
          )}
        </button>
          <button
            onClick={async () => {
              setLoadingHowToPlay(deck.name);
              await onAskHowToPlay?.(deck, type);
              setLoadingHowToPlay(null);
              setTimeout(() => {
                document.querySelector(".ai-chat-area")?.scrollTo({ top: 9999, behavior: "smooth" });
              }, 200);
            }}
            disabled={loadingHowToPlay === deck.name}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              loadingHowToPlay === deck.name
                ? "bg-metallic-gold text-black border border-yellow-400/40 animate-metallic-shimmer"
                : "bg-glass text-clash-text hover:bg-white/10 animate-rainbow-border"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loadingHowToPlay === deck.name ? (
            <><img src="/carga4.gif" alt="" className="w-3.5 h-3.5" /> Cargando...</>
          ) : (
            <><BookOpen size={12} /> Cómo jugar</>
          )}
        </button>
      </div>
    </Card>
  );
}
