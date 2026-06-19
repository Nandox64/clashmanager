"use client";

import { useEffect } from "react";
import { loadClanDataOnce, startControlledPolling, stopControlledPolling } from "@/hooks/use-clan-data";

export function DataProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    loadClanDataOnce();
    startControlledPolling();
    return () => { stopControlledPolling(); };
  }, []);
  return <>{children}</>;
}
