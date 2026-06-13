"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getPageTheme } from "./page-theme";

export function PageBackground() {
  const pathname = usePathname();
  const theme = getPageTheme(pathname);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--theme-surface", theme.surface);
    root.style.setProperty("--theme-border", theme.border);
  }, [theme]);

  return (
    <div
      className="fixed inset-x-0 top-0 pointer-events-none"
      style={{
        height: "100dvh",
        zIndex: -10,
        backgroundImage: `${theme.overlay}, url("${theme.background}")`,
        backgroundRepeat: "no-repeat, repeat",
        backgroundSize: "cover, auto",
        backgroundPosition: "center, center",
      }}
    />
  );
}
