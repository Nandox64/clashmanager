import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
}

const variants = {
  default: "bg-clash-card text-clash-text border-clash-border",
  success: "bg-green-900/30 text-green-400 border-green-500/30",
  warning: "bg-orange-900/30 text-orange-400 border-orange-500/30",
  danger: "bg-red-900/30 text-red-400 border-red-500/30",
  info: "bg-cyan-900/30 text-cyan-400 border-cyan-500/30",
};

export function Badge({
  className,
  variant = "default",
  size = "sm",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-medium",
        size === "sm" ? "text-xs" : "text-sm",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
