"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const PUBLIC_ROUTES = ["/login", "/verify-email"];

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <img src="/carga4.gif" alt="Cargando..." className="w-32 h-32 animate-loading-delay" />
    </div>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isMock } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (PUBLIC_ROUTES.includes(pathname)) return;
    if (!user && !isMock) {
      router.push("/login");
      return;
    }
    if (user && !user.emailVerified && !isMock) {
      router.push("/verify-email");
    }
  }, [user, isLoading, isMock, pathname, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  if (!user && !isMock) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
