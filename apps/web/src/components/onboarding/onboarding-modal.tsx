"use client";

import { useRef, useState, useEffect } from "react";
import { useClanStore } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { getCachedLinkedMemberId, setCachedLinkedMemberId, setCachedProfilePhoto, setCachedRole } from "@/lib/profile-cache";
import { ROLE_LABELS } from "@clashmanager/shared";
import { UserCircle, Camera, X } from "lucide-react";
import { toast } from "sonner";

const ROLE_COLORS: Record<string, string> = {
  leader: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  coleader: "bg-purple-500/20 text-purple-400 border-purple-500/40",
  veteran: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  member: "bg-gray-500/20 text-gray-400 border-gray-500/40",
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

export function OnboardingModal() {
  const { user, isMock, profile: authProfile } = useAuth();
  const members = useClanStore((s) => s.members);
  const loaded = useClanStore((s) => s.loaded);

  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState("");
  const [linkedMemberId, setLinkedMemberId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shownThisLoad = useRef(false);

  useEffect(() => {
    if (!loaded || !user && !isMock) return;
    if (shownThisLoad.current) return;

    const cachedId = getCachedLinkedMemberId();
    if (cachedId) {
      setFetching(false);
      return;
    }

    shownThisLoad.current = true;
    setOpen(true);
    setFetching(false);
  }, [loaded, user, isMock]);

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
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ photoURL: photo, linkedMemberId }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setCachedLinkedMemberId(linkedMemberId);
      setCachedProfilePhoto(photo);
      const linked = members.find((m) => m.uid === linkedMemberId);
      setCachedRole(linked?.role ?? null);
      toast.success("Perfil vinculado correctamente");
      setOpen(false);
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDismiss = () => {
    setOpen(false);
  };

  if (!open || fetching) return null;

  const linkedMember = members.find((m) => m.uid === linkedMemberId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 bg-clash-card border border-clash-border rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-clash-border">
          <div>
            <h2 className="text-lg font-bold text-metallic-gold">¡Bienvenido!</h2>
            <p className="text-xs text-clash-muted mt-0.5">
              Para usar la app, vincúlate con un miembro del clan
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg hover:bg-glass transition-colors text-clash-muted"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
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
              Selecciona tu miembro del clan <span className="text-red-400">*</span>
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
              className="w-full rounded-lg border border-clash-border bg-glass px-3 py-2.5 text-sm text-clash-text focus:outline-none focus:border-metallic-gold focus:ring-1 focus:ring-metallic-gold transition-colors"
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
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-clash-border">
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-sm text-clash-muted hover:text-clash-text transition-colors"
          >
            Ahora no
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !linkedMemberId}
            className="px-5 py-2 rounded-lg bg-metallic-gold animate-metallic-shimmer text-black border border-clash-border text-sm font-medium hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {saving ? "Guardando..." : "Vincular"}
          </button>
        </div>
      </div>
    </div>
  );
}
