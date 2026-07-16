"use client";

import { useClanDataLoader } from "@/hooks/use-clan-data";

export function DataProvider({ children }: { children: React.ReactNode }) {
  useClanDataLoader();
  return <>{children}</>;
}
