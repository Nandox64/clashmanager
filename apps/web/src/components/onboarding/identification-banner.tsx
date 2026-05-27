"use client";

import { useState, useEffect } from "react";
import { useClanStore } from "@/lib/store";
import { getCachedLinkedMemberId } from "@/lib/profile-cache";
import { UserCircle, X, ArrowRight } from "lucide-react";
import Link from "next/link";

export function IdentificationBanner() {
  const loaded = useClanStore((s) => s.loaded);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const val = sessionStorage.getItem("banner-dismissed");
    if (val) setDismissed(true);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("banner-dismissed", "true");
    setDismissed(true);
  };

  const linkedId = getCachedLinkedMemberId();

  if (dismissed || !loaded || linkedId) return null;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
        <UserCircle size={16} className="text-yellow-400" />
      </div>
      <p className="text-xs text-clash-text flex-1">
        No te has identificado con un miembro del clan.{' '}
        <Link
          href="/profile"
          className="text-metallic-gold hover:underline font-medium inline-flex items-center gap-0.5"
          onClick={handleDismiss}
        >
          Ve a Perfil
          <ArrowRight size={12} />
        </Link>{' '}
        para vincular tu cuenta.
      </p>
      <button
        onClick={handleDismiss}
        className="p-1 rounded-lg hover:bg-glass transition-colors text-clash-muted shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}
