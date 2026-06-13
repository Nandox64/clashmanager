"use client";

import { usePathname } from "next/navigation";
import { getPageTheme } from "@/components/layout/page-theme";

export function useTheme() {
  const pathname = usePathname();
  return getPageTheme(pathname);
}
