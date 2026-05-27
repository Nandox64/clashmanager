import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetalPanelProps {
  children: ReactNode;
  className?: string;
}

export function MetalPanel({ children, className }: MetalPanelProps) {
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 h-full w-64 bg-glass-strong border-r border-clash-border flex flex-col transition-transform duration-300 lg:translate-x-0",
        className
      )}
    >
      {/* Metallic shimmer background */}
      <div className="absolute inset-0 bg-metallic-gold animate-metallic-shimmer opacity-20 pointer-events-none" />
      {/* Content wrapper */}
      <div className="relative flex-1 overflow-y-auto scrollbar-premium p-4">
        {children}
      </div>
    </aside>
  );
}
