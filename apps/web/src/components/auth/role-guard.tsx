"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCachedRole, setCachedRole } from "@/lib/profile-cache";
import { useProfile } from "@/hooks/use-profile";
import { useClanStore } from "@/lib/store";

const ALLOWED_ROLES = ["leader", "coleader"];

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const members = useClanStore((s) => s.members);
  const loaded = useClanStore((s) => s.loaded);

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. Decisión inmediata usando getCachedRole()
    const cachedRole = getCachedRole();
    if (cachedRole) {
      const allowed = ALLOWED_ROLES.includes(cachedRole);
      setIsAuthorized(allowed);
      if (!allowed) {
        router.push("/dashboard");
      }
      return;
    }

    // 2. Si no hay cache, verificar por API usando profile + members
    if (!profileLoading && loaded) {
      if (profile?.linkedMemberId) {
        const member = members.find((m) => m.uid === profile.linkedMemberId);
        const role = member?.role ?? null;
        setCachedRole(role); // Guardar en caché para futuros accesos inmediatos
        const allowed = role ? ALLOWED_ROLES.includes(role) : false;
        setIsAuthorized(allowed);
        if (!allowed) {
          router.push("/dashboard");
        }
      } else {
        setCachedRole(null);
        setIsAuthorized(false);
        router.push("/dashboard");
      }
    }
  }, [profile, profileLoading, members, loaded, router]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <img src="/carga4.gif" alt="Cargando..." className="w-32 h-32" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <span className="text-red-400 text-2xl font-bold">!</span>
        </div>
        <p className="text-sm text-clash-muted text-center max-w-xs">
          No tienes permisos para acceder a esta sección. Solo líder y co-líder pueden ver esta página.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
