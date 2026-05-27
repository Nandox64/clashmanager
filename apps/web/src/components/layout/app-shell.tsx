"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { BottomTabs } from "./bottom-tabs";
import { AuthGuard } from "@/components/auth/auth-guard";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";
import { usePathname } from "next/navigation";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  return (
    <AuthGuard>
      <OnboardingModal />
      <div className="min-h-screen">
        <Sidebar />
        <main className="lg:ml-64 pb-20 lg:pb-0 min-h-screen">
          <div className="max-w-7xl mx-auto p-4 pt-16 lg:pt-6">{children}</div>
        </main>
        <BottomTabs />
      </div>
    </AuthGuard>
  );
}
