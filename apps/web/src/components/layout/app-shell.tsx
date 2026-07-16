"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { Sidebar } from "./sidebar";
import { BottomTabs } from "./bottom-tabs";
import { AuthGuard } from "@/components/auth/auth-guard";
import { DataProvider } from "@/components/providers/data-provider";
import { usePathname } from "next/navigation";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <DataProvider>
      <AuthGuard>
        {isLoginPage ? (
          children
        ) : (
          <div className="min-h-dynamic">
            <Sidebar />
            <main className="lg:ml-64 pb-24 lg:pb-0 min-h-dynamic relative overflow-x-hidden">
              <Image src="/logoclashroyale.gif" alt="" width={180} height={135} className="absolute top-4 right-4 object-contain shrink-0 pointer-events-none z-10 hidden lg:block" unoptimized />
              <div className="max-w-7xl mx-auto p-4 pt-20 lg:pt-8">{children}</div>
            </main>
            <BottomTabs />
          </div>
        )}
      </AuthGuard>
    </DataProvider>
  );
}
