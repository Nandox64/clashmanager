"use client";

import { useState, useEffect } from "react";
import { useClanStore } from "@/lib/store";
import { useProfile } from "@/hooks/use-profile";
import { getCachedLinkedMemberId } from "@/lib/profile-cache";
import { UserCircle, X, ArrowRight } from "lucide-react";
import Link from "next/link";

export function IdentificationBanner() {
  const loaded = useClanStore((s) => s.loaded);
  const onboardingOpen = useClanStore((s) => s.onboardingOpen);
  const { profile } = useProfile();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const val = localStorage.getItem("banner-dismissed-v2");
    if (val) setDismissed(true);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("banner-dismissed-v2", "true");
    setDismissed(true);
  };

  const linkedId = profile?.linkedMemberId ?? getCachedLinkedMemberId();

  if (dismissed || !loaded || linkedId || onboardingOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 will-change-[opacity] animate-fade-in p-4">
      <div className="relative w-full max-w-sm p-6 rounded-xl bg-gradient-to-b from-yellow-500/15 to-amber-500/10 border border-yellow-500/30 text-center">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-clash-muted"
        >
          <X size={18} />
        </button>
        <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
          <UserCircle size={24} className="text-yellow-400" />
        </div>
        <p className="text-sm text-clash-text mb-4">
          No te has identificado con un miembro del clan. Vincula tu cuenta para acceder a todas las funciones.
        </p>
        <Link
          href="/profile"
          onClick={handleDismiss}
          className="block w-full py-2.5 rounded-xl bg-metallic-gold text-black text-sm font-bold hover:brightness-110 transition-colors text-center"
        >
          <span className="inline-flex items-center gap-1.5">
            Ir a Perfil
            <ArrowRight size={16} />
          </span>
        </Link>
        <button
          onClick={handleDismiss}
          className="mt-3 text-xs text-clash-muted hover:text-clash-text transition-colors"
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}
