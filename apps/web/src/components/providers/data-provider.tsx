"use client";

import { useEffect } from "react";
import { loadClanDataOnce } from "@/hooks/use-clan-data";

export function DataProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    loadClanDataOnce();
  }, []);
  return <>{children}</>;
}
