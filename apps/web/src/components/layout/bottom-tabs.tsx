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
  UserPlus,
  Swords,
  Settings,
  UserCircle,
  Gift,
} from "lucide-react";

const LEADER_ONLY = ["/recruitment", "/settings"];

const tabs = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/achievements", label: "Logros", icon: Award },
  { href: "/war-decks", label: "Guerra", icon: Swords },
  { href: "/members", label: "Clan", icon: Users },
  { href: "/analytics", label: "Stats", icon: BarChart3 },
  { href: "/recruitment", label: "Reclutar", icon: UserPlus },
  { href: "/gifts", label: "Regalos", icon: Gift },
  { href: "/profile", label: "Perfil", icon: UserCircle },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

export function BottomTabs() {
  const pathname = usePathname();
  const role = getCachedRole();
  const visibleTabs = tabs.filter(
    (t) => !LEADER_ONLY.includes(t.href) || role === "leader" || role === "coleader"
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-glass-strong border-t border-clash-border safe-area-bottom">
      <div className="flex items-center gap-1 px-1 py-1 overflow-x-auto scrollbar-premium">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-1.5 sm:px-2 py-1.5 rounded-lg transition-colors min-w-0",
                isActive
                  ? "text-metallic-gold"
                  : "text-clash-muted hover:text-clash-text"
              )}
            >
              <Icon size={18} className={isActive ? "animate-icon-shine" : undefined} />
              <span className="text-[10px] font-medium truncate max-w-14">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
