"use client";

import { useEffect } from "react";
import { startPolling } from "@/hooks/use-clan-data";

export function DataProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    startPolling();
  }, []);
  return <>{children}</>;
}
