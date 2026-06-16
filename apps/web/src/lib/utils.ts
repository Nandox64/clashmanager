import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toLocaleString();
}

export function daysAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  return `Hace ${days} días`;
}

export function getActivityColor(daysSinceActive: number): string {
  if (daysSinceActive <= 1) return "text-green-400";
  if (daysSinceActive <= 2) return "text-yellow-400";
  if (daysSinceActive <= 3) return "text-orange-400";
  return "text-red-400";
}

const RAINBOW_SOLID = "linear-gradient(to right, #ef4444, #eab308, #22c55e)";
const RAINBOW_TRACK = "linear-gradient(to right, rgba(239,68,68,0.2), rgba(234,179,8,0.2), rgba(34,197,94,0.2))";

export const barContainerStyle: Record<string, string> = {
  position: "relative",
  width: "100%",
  overflow: "hidden",
  borderRadius: "9999px",
};

export const barTrackStyle: Record<string, string> = {
  position: "absolute",
  inset: "0",
  background: RAINBOW_TRACK,
  borderRadius: "9999px",
};

export function barFillStyle(value: number): Record<string, string> {
  const pct = Math.min(100, Math.max(0, value));
  return {
    position: "absolute",
    left: "0",
    top: "0",
    bottom: "0",
    width: `${pct}%`,
    background: RAINBOW_SOLID,
    backgroundSize: `${pct === 0 ? 100 : 10000 / pct}% 100%`,
    backgroundPosition: "left center",
    backgroundRepeat: "no-repeat",
    borderRadius: "9999px",
    transition: "width 500ms",
  };
}