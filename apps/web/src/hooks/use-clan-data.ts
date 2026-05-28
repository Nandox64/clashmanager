"use client";

import { useEffect, useState } from "react";
import { useClanStore } from "@/lib/store";

export function useClanData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setClan = useClanStore((s) => s.setClan);
  const setMembers = useClanStore((s) => s.setMembers);
  const setAchievements = useClanStore((s) => s.setAchievements);
  const setLocalWarRank = useClanStore((s) => s.setLocalWarRank);
  const setLocalWarRankChange = useClanStore((s) => s.setLocalWarRankChange);
  const setWarRankMeta = useClanStore((s) => s.setWarRankMeta);
  const setLoaded = useClanStore((s) => s.setLoaded);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/firebase/load");
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setClan(data.clan);
      setMembers(data.members);
      setAchievements(data.achievements ?? []);
      setLocalWarRank(data.localWarRank ?? null);
      setLocalWarRankChange(data.localWarRankChange ?? 0);
      setWarRankMeta({
        confidence: data.warRankConfidence ?? "fallback",
        method: data.warRankMethod ?? "",
        newEntries: data.warRankNewEntries ?? 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al conectar");
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { loading, error, refetch: fetchData };
}
