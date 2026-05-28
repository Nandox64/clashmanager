import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary:
    "bg-metallic-gold animate-metallic-shimmer text-black hover:brightness-110 active:brightness-90",
  secondary:
    "bg-glass-card border border-clash-border text-clash-text hover:bg-clash-border",
  ghost: "text-clash-muted hover:text-clash-text hover:bg-glass-card",
  danger: "bg-red-600 text-white hover:bg-red-700",
  metal: "bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-white border-2 border-[#a68b5b] shadow-inner hover:scale-105 hover:brightness-110",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
