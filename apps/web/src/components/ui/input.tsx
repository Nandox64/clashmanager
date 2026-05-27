import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-clash-border bg-glass px-3 py-2 text-sm text-clash-text placeholder:text-clash-muted focus:outline-none focus:border-metallic-gold focus:ring-1 focus:ring-metallic-gold transition-colors",
        className
      )}
      {...props}
    />
  );
}
