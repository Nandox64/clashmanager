"use client";

import type { Member } from "@clashmanager/shared";
import { Users } from "lucide-react";

interface MemberSelectorProps {
  members: Member[];
  selectedTag: string | null;
  onSelect: (tag: string | null) => void;
}

export function MemberSelector({
  members,
  selectedTag,
  onSelect,
}: MemberSelectorProps) {
  const selected = members.find((m) => m.playerTag === selectedTag);

  return (
    <div className="relative">
      <select
        value={selectedTag ?? ""}
        onChange={(e) => onSelect(e.target.value || null)}
        className="w-full appearance-none bg-glass border border-white/20 rounded-lg px-2 py-2 text-xs sm:text-sm text-clash-text focus:outline-none focus:border-white/50 cursor-pointer"
      >
        <option value="">Seleccionar miembro...</option>
        {members
          .sort((a, b) => b.trophies - a.trophies)
          .map((m) => (
            <option key={m.uid} value={m.playerTag}>
              {m.displayName} — 🏆 {m.trophies.toLocaleString()}
            </option>
          ))}
      </select>
      <Users
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-clash-muted pointer-events-none"
      />
    </div>
  );
}
