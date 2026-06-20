"use client";

import { useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";

export function ThemeColorUpdater() {
  const { accent } = useTheme();

  useEffect(() => {
    let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = accent;
  }, [accent]);

  return null;
}
