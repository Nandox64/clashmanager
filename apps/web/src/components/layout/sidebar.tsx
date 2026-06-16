"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Award,
  Settings,
  Swords,
  Menu,
  LogOut,
  LogIn,
  Shield,
  UserCircle,
  Gift,
  Trophy,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useClanStore } from "@/lib/store";
import { getCachedLinkedMemberId, getCachedProfilePhoto, getCachedRole } from "@/lib/profile-cache";
import { ROLE_LABELS } from "@clashmanager/shared";
import { getPageTheme } from "./page-theme";

const navItems = [
  { href: "/dashboard", label: "Dashboard",   icon: LayoutDashboard },
  { href: "/achievements", label: "Logros",    icon: Award },
  { href: "/war-decks", label: "Mazos de Guerra", icon: Swords },
  { href: "/gifts",        label: "Regalos",   icon: Gift },
  { href: "/ruleta",       label: "Ruleta",    icon: Trophy },
  { href: "/members",   label: "Miembros",     icon: Users },
  { href: "/analytics", label: "Estadísticas", icon: BarChart3 },
  { href: "/profile",      label: "Perfil",     icon: UserCircle },
  { href: "/settings",     label: "Ajustes",   icon: Settings },
];

const LEADER_ONLY = ["/settings"];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const touchX = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (dx < -50) setIsOpen(false);
  }, []);
  const { user, isMock, signOut } = useAuth();
  const clan = useClanStore((s) => s.clan);
  const members = useClanStore((s) => s.members);
  const clanName    = clan?.name || "...";
  const clanTag     = clan?.tag  || "";
  const clanTrophies = clan?.stats?.clanScore || 0;

  const linkedMemberId = getCachedLinkedMemberId();
  const linkedMember = members.find((m) => m.uid === linkedMemberId);
  const cachedRole = getCachedRole();
  const userRole = (linkedMember?.role ?? cachedRole ?? null);
  const visibleNav = navItems.filter(
    (item) => !LEADER_ONLY.includes(item.href) || userRole === "leader" || userRole === "coleader"
  );

  const displayPhoto = getCachedProfilePhoto();
  const displayName = linkedMember?.displayName || user?.displayName || "";
  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : "";

  const theme = getPageTheme(pathname);
  const sidebarStyle = {
    background: theme.surface,
    borderRightColor: theme.border,
  } as React.CSSProperties;
  const mobileBarStyle = {
    background: theme.surface,
    borderBottomColor: theme.border,
  } as React.CSSProperties;

  return (
    <>
      {/* Mobile top bar — always visible when sidebar is closed */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 lg:hidden" style={mobileBarStyle}>
        <button
          onClick={() => setIsOpen(true)}
          className="toggle-btn flex items-center justify-center shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} className="text-[#0d1117]" />
        </button>
        <img src="/logo_cm.webp" alt="Clase Pro" className="h-12 w-auto object-contain" />
        <div className="ml-auto min-w-0 max-w-24 overflow-hidden">
          <span className="text-[12px] truncate block" style={{ color: "var(--pm-text)" }}>
            {clanName}
          </span>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={cn(
          "premium-sidebar",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={sidebarStyle}
      >
        {/* Header / Logo */}
        <div className="flex flex-col items-center gap-2 p-4 pt-5">
          <img src="/logo_cm.webp" alt="Clase Pro" className="w-full max-w-[160px] h-auto object-contain" />
          <img
            src="/logo_clase_pro.png"
            alt="Clase Pro"
            className="w-28 h-28 object-contain"
          />
        </div>
        <div className="separator-gold mx-5" />

        {/* Navigation */}
        <nav className="flex-1 flex flex-col justify-evenly px-3 py-1 min-h-0">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn("nav-item", isActive && "active")}
              >
                <span
                  className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-all ${
                    isActive ? "bg-metallic-gold animate-metallic-shimmer" : ""
                  }`}
                  style={!isActive ? { background: theme.border } : undefined}
                >
                  <Icon size={16} className={`nav-icon ${isActive ? "text-[#0d1117]" : "text-[var(--pm-text)]"}`} />
                </span>
                <span className={`flex-1 text-sm ${isActive ? "text-[var(--pm-gold)]" : ""}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="separator-gold mx-5" />

        {/* Footer / User */}
        <div className="p-3 mt-auto">
          {user || isMock ? (
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg"
                 style={{ background: "hsla(45,90%,55%,0.06)" }}>
              {displayPhoto ? (
                <img
                  src={displayPhoto}
                  alt={displayName}
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-metallic-gold"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #b8860b, #ffd700)",
                    color: "#0d1117",
                  }}
                >
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate"
                   style={{ color: "var(--pm-text)" }}>
                  {displayName}
                </p>
                <div className="flex items-center gap-1 text-[10px]"
                     style={{ color: "var(--pm-gold)" }}>
                  <Shield size={12} style={{ color: "var(--pm-text)" }} />
                  <span>{userRole ? ROLE_LABELS[userRole as keyof typeof ROLE_LABELS] : "Miembro"}</span>
                  <span>•</span>
                  <span>{clanTag}</span>
                </div>
              </div>
              {user && (
                <button
                  onClick={signOut}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: "var(--pm-text)" }}
                  title="Cerrar sesión"
                >
                  <LogOut size={18} />
                </button>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="nav-item"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                    style={{ background: theme.border }}>
                <LogIn size={16} style={{ color: "var(--pm-text)" }} />
              </span>
              <span className="text-sm">Iniciar Sesión</span>
            </Link>
          )}

          {clanTrophies > 0 && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.07] px-2 text-[10px]">
              <span style={{ color: "var(--pm-muted)" }}>Trofeos del clan</span>
              <span className="font-mono font-bold"
                    style={{ color: "var(--pm-gold)" }}>
                {clanTrophies.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
