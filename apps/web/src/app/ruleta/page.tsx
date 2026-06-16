"use client";

import { RuletaSection } from "@/components/ruleta/ruleta-section";
import { Trophy } from "lucide-react";

export default function RuletaPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Trophy size={24} className="text-[#ffd700]" />
          <h1 className="text-page-title text-2xl">Ruleta del Clan</h1>
        </div>
        <p className="text-sm text-clash-muted mt-0.5">
          Gira la ruleta durante eventos activos y gana premios exclusivos
        </p>
        </div>

      <img src="/ruleta.png" alt="Banner" className="w-auto max-w-full h-auto rounded-xl object-contain max-h-[200px]" />

      <RuletaSection />
    </div>
  );
}
