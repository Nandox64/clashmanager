"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getCachedRole } from "@/lib/profile-cache";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Award,
  Swords,
  Settings,
  UserCircle,
  Gift,
  Trophy,
} from "lucide-react";
import { getPageTheme } from "./page-theme";
import { useEffect, useRef } from "react";

const LEADER_ONLY = ["/settings"];

const tabs = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/achievements", label: "Logros", icon: Award },
  { href: "/war-decks", label: "Guerra", icon: Swords },
  { href: "/gifts", label: "Regalos", icon: Gift },
  { href: "/ruleta", label: "Ruleta", icon: Trophy },
  { href: "/members", label: "Miembros", icon: Users },
  { href: "/analytics", label: "Stats", icon: BarChart3 },
  { href: "/profile", label: "Perfil", icon: UserCircle },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

export function BottomTabs() {
  const pathname = usePathname();
  const role = getCachedRole();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  const visibleTabs = tabs.filter(
    (t) => !LEADER_ONLY.includes(t.href) || role === "leader" || role === "coleader"
  );

  const theme = getPageTheme(pathname);
  const navStyle = {
    background: theme.surface,
    borderTopColor: theme.border,
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  } as React.CSSProperties;

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", inline: "center" });
    }
  }, [pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden safe-area-bottom" style={navStyle}>
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex items-center gap-0 px-1 py-2 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none"
        >
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                ref={isActive ? activeRef : undefined}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center gap-1 min-w-[72px] flex-1 px-1 py-2 rounded-lg transition-all shrink-0 snap-center",
                  isActive
                    ? "bg-metallic-gold text-[#0d1117]"
                    : "text-clash-text hover:text-[var(--pm-gold)]"
                )}
              >
                <Icon size={20} className={isActive ? "text-[#0d1117]" : undefined} />
                <span className={`text-[11px] font-medium whitespace-nowrap ${isActive ? "text-[#0d1117]" : ""}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
        <div
          className="absolute right-0 top-0 bottom-0 w-20 pointer-events-none"
          style={{
            background: "linear-gradient(to left, rgba(0,0,0,0.5), transparent)",
            animation: "scroll-hint-pulse 2s ease-in-out infinite",
          }}
        />
        <div
          className="absolute left-0 top-0 bottom-0 w-20 pointer-events-none"
          style={{
            background: "linear-gradient(to right, rgba(0,0,0,0.5), transparent)",
            animation: "scroll-hint-pulse 2s ease-in-out infinite",
            animationDelay: "1s",
          }}
        />
      </div>
    </nav>
  );
}
