"use client";

import { getCardImageUrl, findCard } from "@/lib/cards";

interface InlineCardProps {
  name: string;
  size?: "sm" | "md";
}

export function InlineCard({ name, size = "sm" }: InlineCardProps) {
  const card = findCard(name);
  const displayName = card?.name ?? name;
  const imgSize = size === "md" ? 20 : 16;
  const iconUrl = getCardImageUrl(displayName);

  return (
    <span className="inline-flex items-center gap-1 px-1 py-0.5 rounded bg-black/30 border border-clash-border/50" title={displayName}>
      <img
        src={iconUrl}
        alt={displayName}
        width={imgSize}
        height={imgSize}
        className="rounded-sm object-contain"
        loading="lazy"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      <span className="text-xs font-medium text-clash-text">{displayName}</span>
    </span>
  );
}
