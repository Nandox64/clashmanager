"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Award,
  UserPlus,
  Settings,
  Swords,
  Menu,
  X,
  LogOut,
  LogIn,
  Shield,
  UserCircle,
  Gift,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useClanStore } from "@/lib/store";
import { getCachedLinkedMemberId, getCachedProfilePhoto, getCachedRole } from "@/lib/profile-cache";
import { ROLE_LABELS } from "@clashmanager/shared";
const navItems = [
  { href: "/dashboard", label: "Dashboard",   icon: LayoutDashboard },
  { href: "/achievements", label: "Logros",    icon: Award },
  { href: "/war-decks", label: "Mazos de Guerra", icon: Swords },
  { href: "/gifts",        label: "Regalos",   icon: Gift },
  { href: "/members",   label: "Miembros",     icon: Users },
  { href: "/analytics", label: "Estadísticas", icon: BarChart3 },
  { href: "/recruitment",  label: "Reclutar",  icon: UserPlus },
  { href: "/profile",      label: "Perfil",     icon: UserCircle },
  { href: "/settings",     label: "Ajustes",   icon: Settings },
];

const LEADER_ONLY = ["/recruitment", "/settings"];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <>
      {/* Mobile top bar — always visible when sidebar is closed */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 lg:hidden bg-glass-strong border-b border-clash-border">
        <button
          onClick={() => setIsOpen(true)}
          className="toggle-btn flex items-center justify-center shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="w-8 h-8 rounded-lg bg-metallic-gold animate-metallic-shimmer flex items-center justify-center shrink-0">
          <Swords size={18} className="text-white" />
        </div>
        <span className="text-sm font-bold" style={{ color: "var(--pm-gold)" }}>
          Clash Manager
        </span>
        <div className="ml-auto min-w-0 max-w-24 overflow-hidden">
          <span className="text-[10px] text-clash-muted truncate block">
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
        className={cn(
          "premium-sidebar",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header / Logo */}
        <div className="flex flex-col items-center gap-3 p-5">
          <div className="flex items-center gap-3 w-full">
            <div className="w-12 h-12 rounded-xl bg-metallic-gold animate-metallic-shimmer flex items-center justify-center shrink-0">
              <Swords size={26} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-sm leading-tight"
                  style={{ color: "var(--pm-gold)" }}>
                Clash Manager
              </h1>
              <p className="text-[10px] font-semibold leading-tight mt-0.5"
                 style={{ color: "var(--pm-muted)" }}>
                CLASE⚔️PRO
              </p>
            </div>
          </div>
          <img
            src="/logo_clase_pro.png"
            alt="Clase Pro"
            className="w-20 h-20 object-contain"
          />
        </div>
          {/* Close button inside sidebar header */}
          <button
            onClick={() => setIsOpen(false)}
            className="toggle-btn lg:hidden flex items-center justify-center"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        <div className="separator-gold mx-5" />

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5">
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
                  className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                  style={{
                    background: isActive
                      ? "hsla(45,90%,55%,0.18)"
                      : "hsla(0,0%,100%,0.04)",
                  }}
                >
                  <Icon size={16} />
                </span>
                <span className="flex-1 text-sm">{item.label}</span>
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
                     style={{ color: "var(--pm-muted)" }}>
                  <Shield size={9} style={{ color: "var(--pm-gold)" }} />
                  <span>{userRole ? ROLE_LABELS[userRole as keyof typeof ROLE_LABELS] : "Miembro"}</span>
                  <span>•</span>
                  <span>{clanTag}</span>
                </div>
              </div>
              {user && (
                <button
                  onClick={signOut}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: "var(--pm-muted)" }}
                  title="Cerrar sesión"
                >
                  <LogOut size={15} />
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
                    style={{ background: "hsla(0,0%,100%,0.04)" }}>
                <LogIn size={16} />
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
