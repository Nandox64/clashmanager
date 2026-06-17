"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { getCachedLinkedMemberId } from "@/lib/profile-cache";
import { useProfile } from "@/hooks/use-profile";

const PUBLIC_ROUTES = ["/login", "/verify-email"];
const LINK_MEMBER_ROUTE = "/link-member";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <img src="/carga4.gif" alt="Cargando..." className="w-32 h-32 animate-loading-delay" />
    </div>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isMock } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const router = useRouter();
  const pathname = usePathname();

  const hasLinkedMember = !!(
    profile?.linkedMemberId || getCachedLinkedMemberId()
  );

  useEffect(() => {
    if (isLoading) return;
    if (PUBLIC_ROUTES.includes(pathname)) return;
    if (!user && !isMock) {
      router.push("/login");
      return;
    }
    if (user && !user.emailVerified && !isMock) {
      router.push("/verify-email");
      return;
    }
    if (pathname === LINK_MEMBER_ROUTE) return;
    if (profileLoading) return;
    if (!hasLinkedMember && !isMock) {
      router.push(LINK_MEMBER_ROUTE);
    }
  }, [user, isLoading, isMock, pathname, router, profileLoading, hasLinkedMember]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  if (!user && !isMock) {
    return <LoadingScreen />;
  }

  const needsProfile = pathname !== LINK_MEMBER_ROUTE && !!user && !isMock && !hasLinkedMember && profileLoading;

  if (needsProfile) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
