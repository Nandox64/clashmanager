"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useClanStore } from "@/lib/store";
import { useClanData } from "@/hooks/use-clan-data";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";
import {
  getCachedLinkedMemberId,
  setCachedLinkedMemberId,
  setCachedProfilePhoto,
  setCachedRole,
} from "@/lib/profile-cache";
import { ROLE_LABELS } from "@clashmanager/shared";
import { UserCircle, Camera, Shield } from "lucide-react";
import { toast } from "sonner";

const ROLE_COLORS: Record<string, string> = {
  leader: "bg-yellow-500/20 text-yellow-300 border-2 border-yellow-400/60",
  coleader: "bg-purple-500/20 text-purple-300 border-2 border-purple-400/60",
  veteran: "bg-blue-500/20 text-blue-300 border-2 border-blue-400/60",
  member: "bg-gray-500/20 text-gray-300 border-2 border-gray-400/60",
};

async function getAuthHeaders(
  user: ReturnType<typeof useAuth>["user"],
  isMock: boolean,
  mockUid?: string
): Promise<Record<string, string>> {
  if (isMock && mockUid) {
    return { Authorization: `Bearer mock-${mockUid}` };
  }
  if (isMock) {
    return { Authorization: "Bearer mock-mode" };
  }
  if (user) {
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export default function LinkMemberPage() {
  const { user, isMock, profile: authProfile } = useAuth();
  const { profile: serverProfile, loading: profileLoading } = useProfile();
  useClanData();
  const members = useClanStore((s) => s.members);
  const loaded = useClanStore((s) => s.loaded);
  const router = useRouter();

  const [photo, setPhoto] = useState("");
  const [linkedMemberId, setLinkedMemberId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (profileLoading) return;
    if (!loaded) return;

    const cachedId = getCachedLinkedMemberId();
    const serverId = serverProfile?.linkedMemberId;

    if (cachedId || serverId) {
      router.push("/dashboard");
      return;
    }

    setReady(true);
  }, [profileLoading, loaded, serverProfile?.linkedMemberId, router]);

  useEffect(() => {
    if (ready) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [ready]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast.error("La imagen no debe superar 1MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!linkedMemberId) {
      toast.error("Selecciona un miembro del clan");
      return;
    }
    setSaving(true);
    try {
      const headers = await getAuthHeaders(user, isMock, authProfile?.uid);
      const linked = members.find((m) => m.uid === linkedMemberId);
      const body: Record<string, unknown> = { linkedMemberId, email: user?.email ?? "" };
      if (photo) body.photoURL = photo;
      if (linked?.displayName) body.displayName = linked.displayName;
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error del servidor (${res.status})`);
      }
      setCachedLinkedMemberId(linkedMemberId);
      setCachedProfilePhoto(photo);
      setCachedRole(linked?.role ?? null);
      toast.success("Perfil vinculado correctamente");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-dynamic flex items-center justify-center">
        <img src="/carga4.gif" alt="Cargando..." className="w-32 h-32" />
      </div>
    );
  }

  const linkedMember = members.find((m) => m.uid === linkedMemberId);

  return (
    <div className="min-h-dynamic flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-clash-card border border-clash-border rounded-2xl shadow-2xl">
        <div className="p-5 sm:p-6 border-b border-clash-border text-center">
          <div className="w-14 h-14 rounded-full bg-metallic-gold/20 flex items-center justify-center mx-auto mb-3">
            <Shield size={28} className="text-metallic-gold" />
          </div>
          <h1 className="text-xl font-bold text-metallic-gold">Vincula tu cuenta</h1>
          <p className="text-sm text-clash-muted mt-1">
            Selecciona tu miembro del clan para acceder a la aplicación
          </p>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              {photo ? (
                <img
                  src={photo}
                  alt="Foto"
                  className="w-24 h-24 rounded-full object-cover border-2 border-metallic-gold"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-glass border-2 border-clash-border flex items-center justify-center">
                  <UserCircle size={48} className="text-clash-muted" />
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-metallic-gold flex items-center justify-center hover:brightness-110 transition-colors"
              >
                <Camera size={14} className="text-black" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <p className="text-xs text-clash-muted">Foto de perfil (opcional)</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-clash-muted font-medium">
              Tu miembro del clan <span className="text-red-500">*</span>
            </label>
            <select
              value={linkedMemberId ?? ""}
              onChange={(e) => {
                const val = e.target.value || null;
                setLinkedMemberId(val);
                if (val) {
                  const linked = members.find((m) => m.uid === val);
                  setCachedRole(linked?.role ?? null);
                } else {
                  setCachedRole(null);
                }
              }}
              className="w-full rounded-lg border border-clash-border bg-glass px-2 py-2 text-xs sm:text-sm text-clash-text focus:outline-none focus:border-metallic-gold focus:ring-1 focus:ring-metallic-gold transition-colors"
            >
              <option value="">-- Seleccionar miembro --</option>
              {members.map((m) => (
                <option key={m.uid} value={m.uid}>
                  {m.displayName} — 🏆 {m.trophies.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {linkedMember && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-glass border border-clash-border">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#b8860b] to-[#ffd700] flex items-center justify-center text-xs font-bold text-black shrink-0">
                {linkedMember.displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-clash-text truncate">
                  {linkedMember.displayName}
                </p>
                <p className="text-xs text-clash-muted font-mono">
                  {linkedMember.playerTag}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${ROLE_COLORS[linkedMember.role] ?? ""}`}
              >
                {ROLE_LABELS[linkedMember.role]}
              </span>
            </div>
          )}

          <p className="text-xs text-clash-dimmed text-center">
            Esta vinculación te identificará dentro del clan y no podrá cambiarse después.
          </p>
        </div>

        <div className="p-5 sm:p-6 border-t border-clash-border">
          <button
            onClick={handleSave}
            disabled={saving || !linkedMemberId}
            className="w-full py-2.5 rounded-xl bg-metallic-gold animate-metallic-shimmer text-black text-sm font-bold hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {saving ? "Vinculando..." : "Vincular y acceder"}
          </button>
        </div>
      </div>
    </div>
  );
}
