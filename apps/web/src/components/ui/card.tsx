import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";
import { useTheme } from "@/hooks/use-theme";

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const theme = useTheme();
  return (
    <div
      className={cn(
        "rounded-xl p-4 animate-fade-in card-premium",
        "overflow-hidden",
        className
      )}
      style={{
        background: theme.surface,
        borderColor: theme.border,
        borderWidth: 1,
        borderStyle: "solid",
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between mb-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base font-bold font-heading text-clash-text", className)} {...props}>
      {children}
    </h3>
  );
}
