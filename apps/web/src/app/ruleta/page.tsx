"use client";

import { RuletaSection } from "@/components/ruleta/ruleta-section";
import { Trophy } from "lucide-react";

export default function RuletaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page-title text-2xl font-black flex items-center gap-2">
          <Trophy size={24} className="text-metallic-gold" />
          Ruleta del Clan
        </h1>
        <p className="text-sm text-clash-muted mt-0.5">
          Gira la ruleta durante eventos activos y gana premios exclusivos
        </p>
      </div>

      <RuletaSection />
    </div>
  );
}
