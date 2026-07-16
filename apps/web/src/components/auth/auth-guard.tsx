"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { getCachedLinkedMemberId } from "@/lib/profile-cache";
import { useProfile } from "@/hooks/use-profile";
import { LoadingScreen } from "@/components/ui/loading";

const PUBLIC_ROUTES = ["/login", "/verify-email"];
const LINK_MEMBER_ROUTE = "/link-member";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isMock } = useAuth();
  const { profile, loading: profileLoading, initialFetchDone } = useProfile();
  const router = useRouter();
  const pathname = usePathname();

  const cachedLinkedMemberId = getCachedLinkedMemberId();
  const hasLinkedMember = !!(profile?.linkedMemberId || cachedLinkedMemberId);
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isAuthenticated = !!(user || isMock);

  useEffect(() => {
    if (isLoading) return;

    if (isPublicRoute) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user && !user.emailVerified && !isMock) {
      if (pathname === "/dashboard") return;
      router.push("/verify-email");
      return;
    }

    if (pathname === LINK_MEMBER_ROUTE) return;
    if (profileLoading || !initialFetchDone) return;

    if (!hasLinkedMember && !isMock) {
      router.push(LINK_MEMBER_ROUTE);
    }
  }, [isLoading, isPublicRoute, isAuthenticated, user, isMock, pathname, router, profileLoading, initialFetchDone, hasLinkedMember]);

  if (isLoading || (isAuthenticated && !isPublicRoute && !cachedLinkedMemberId && !hasLinkedMember && profileLoading && pathname !== LINK_MEMBER_ROUTE && pathname !== "/dashboard")) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
