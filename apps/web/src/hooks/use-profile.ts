"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  setCachedLinkedMemberId,
  setCachedProfilePhoto,
} from "@/lib/profile-cache";

export interface ProfileData {
  uid: string;
  displayName: string;
  photoURL: string;
  linkedMemberId: string | null;
  linkedAt: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

async function getAuthHeaders(
  user: ReturnType<typeof useAuth>["user"],
  isMock: boolean,
  mockUid?: string
): Promise<Record<string, string>> {
  if (isMock && mockUid) {
    return { Authorization: `Bearer mock-${mockUid}` };
  }
  if (user) {
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export function useProfile() {
  const { user, isMock, profile: authProfile } = useAuth();
  const [profile, setProfileState] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    const mockUid = authProfile?.uid;
    if (!user && !isMock) {
      setProfileState(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders(user, isMock, mockUid);
      const res = await fetch("/api/profile", { headers });
      if (!res.ok) {
        if (res.status === 404 || res.status === 401) {
          setProfileState(null);
          return;
        }
        throw new Error("Error al cargar perfil");
      }
      const data = await res.json();
      const p = data.profile ?? null;
      setProfileState(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [user, isMock, authProfile?.uid]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveProfile = useCallback(
    async (data: {
      photoURL?: string;
      linkedMemberId?: string | null;
      firstName?: string;
      lastName?: string;
      phone?: string;
      email?: string;
    }) => {
      const mockUid = authProfile?.uid;
      if (!user && !isMock) return;
      setLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders(user, isMock, mockUid);
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Error del servidor (${res.status})`);
        }
        const result = await res.json();
        setProfileState(result.profile);
        if (result.profile) {
          setCachedLinkedMemberId(result.profile.linkedMemberId);
          setCachedProfilePhoto(result.profile.photoURL);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, isMock, authProfile?.uid]
  );

  return { profile, loading, error, saveProfile, refetch: fetchProfile };
}
