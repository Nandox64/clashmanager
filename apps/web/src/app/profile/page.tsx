"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useClanStore } from "@/lib/store";
import { useProfile } from "@/hooks/use-profile";
import { getCachedLinkedMemberId, getCachedProfilePhoto, setCachedRole } from "@/lib/profile-cache";
import { ROLE_LABELS, ROLE_HIERARCHY } from "@clashmanager/shared";
import { UserCircle, Camera, Save, Shield, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const ROLE_COLORS: Record<string, string> = {
  leader: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  coleader: "bg-purple-500/20 text-purple-400 border-purple-500/40",
  veteran: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  member: "bg-gray-500/20 text-gray-400 border-gray-500/40",
};

export default function ProfilePage() {
  const { profile, loading, saveProfile, refetch } = useProfile();
  const members = useClanStore((s) => s.members);
  const loaded = useClanStore((s) => s.loaded);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState(profile?.photoURL ?? getCachedProfilePhoto());
  const [linkedMemberId, setLinkedMemberId] = useState<string | null>(
    profile?.linkedMemberId ?? getCachedLinkedMemberId()
  );
  const [firstName, setFirstName] = useState(profile?.firstName ?? "");
  const [lastName, setLastName] = useState(profile?.lastName ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setPhoto(profile.photoURL ?? "");
      setLinkedMemberId(profile.linkedMemberId);
      setFirstName(profile.firstName ?? "");
      setLastName(profile.lastName ?? "");
      setPhone(profile.phone ?? "");
      setEmail(profile.email ?? "");
    }
  }, [profile]);

  const linkedMember = members.find((m) => m.uid === linkedMemberId);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast.error("La imagen no debe superar 1MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProfile({ photoURL: photo, linkedMemberId, firstName, lastName, phone, email });
      toast.success("Perfil guardado");
    } catch {
      toast.error("Error al guardar perfil");
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <img src="/carga4.gif" alt="Cargando..." className="w-32 h-32 mx-auto" />
          <p className="text-sm text-clash-muted">Cargando miembros del clan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-clash-text">Perfil</h1>
        <p className="text-sm text-clash-muted mt-0.5">
          Personaliza tu perfil y vincúlate a un miembro del clan
        </p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-metallic-gold">Foto de Perfil</CardTitle>
            <p className="text-xs text-clash-muted mt-0.5">
              Sube una foto para identificarte (máx 1MB)
            </p>
          </div>
          <UserCircle size={16} className="text-metallic-gold" />
        </CardHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative">
            {photo ? (
              <img
                src={photo}
                alt="Foto de perfil"
                className="w-28 h-28 rounded-full object-cover border-2 border-metallic-gold"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-glass border-2 border-clash-border flex items-center justify-center">
                <UserCircle size={56} className="text-clash-muted" />
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-metallic-gold flex items-center justify-center hover:brightness-110 transition-colors"
            >
              <Camera size={16} className="text-black" />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
          {photo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPhoto("")}
            >
              Eliminar foto
            </Button>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-metallic-gold">Vincular Miembro</CardTitle>
            <p className="text-xs text-clash-muted mt-0.5">
              {linkedMemberId
                ? "Miembro vinculado actualmente. Puedes cambiarlo si lo deseas."
                : "Selecciona tu miembro del clan para identificarte"}
            </p>
          </div>
          <Shield size={16} className="text-metallic-gold" />
        </CardHeader>
        <div className="space-y-4">
          {linkedMemberId && linkedMember && (
            <div className="p-4 rounded-lg bg-glass border border-clash-border space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={14} className="text-green-400" />
                <span className="text-xs text-green-400 font-medium">Miembro vinculado</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#b8860b] to-[#ffd700] flex items-center justify-center text-sm font-bold text-black shrink-0">
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
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${ROLE_COLORS[linkedMember.role] ?? ""}`}
                >
                  {ROLE_LABELS[linkedMember.role]}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div>
                  <p className="text-xs text-clash-muted">Trofeos</p>
                  <p className="text-sm font-bold text-clash-gold">
                    {linkedMember.trophies.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-clash-muted">Donaciones</p>
                  <p className="text-sm font-bold text-clash-text">
                    {linkedMember.weeklyStats.donationsGiven.toLocaleString()}/sem
                  </p>
                </div>
                <div>
                  <p className="text-xs text-clash-muted">Nivel</p>
                  <p className="text-sm font-bold text-clash-text">{linkedMember.level}</p>
                </div>
                <div>
                  <p className="text-xs text-clash-muted">Participación</p>
                  <p className="text-sm font-bold text-clash-text">
                    {linkedMember.weeklyStats.warParticipation}%
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-clash-muted">
            {linkedMemberId ? "Cambiar a otro miembro:" : "Selecciona un miembro:"}
          </p>
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
            className="w-full rounded-lg border border-clash-border bg-glass px-3 py-2 text-sm text-clash-text focus:outline-none focus:border-metallic-gold focus:ring-1 focus:ring-metallic-gold transition-colors"
          >
            <option value="">{linkedMemberId ? "-- Desvincular --" : "-- Seleccionar miembro --"}</option>
            {members.map((m) => (
              <option key={m.uid} value={m.uid}>
                {m.displayName} — 🏆 {m.trophies.toLocaleString()}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-metallic-gold">Información Personal</CardTitle>
            <p className="text-xs text-clash-muted mt-0.5">
              Datos adicionales para tu perfil
            </p>
          </div>
          <UserCircle size={16} className="text-metallic-gold" />
        </CardHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-clash-muted mb-1">Nombre</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full rounded-lg border border-clash-border bg-glass px-3 py-2 text-sm text-clash-text focus:outline-none focus:border-metallic-gold focus:ring-1 focus:ring-metallic-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-clash-muted mb-1">Apellido</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Tu apellido"
                className="w-full rounded-lg border border-clash-border bg-glass px-3 py-2 text-sm text-clash-text focus:outline-none focus:border-metallic-gold focus:ring-1 focus:ring-metallic-gold transition-colors"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-clash-muted mb-1">Celular</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+52 555 123 4567"
                className="w-full rounded-lg border border-clash-border bg-glass px-3 py-2 text-sm text-clash-text focus:outline-none focus:border-metallic-gold focus:ring-1 focus:ring-metallic-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-clash-muted mb-1">Correo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full rounded-lg border border-clash-border bg-glass px-3 py-2 text-sm text-clash-text focus:outline-none focus:border-metallic-gold focus:ring-1 focus:ring-metallic-gold transition-colors"
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || loading}
          variant="metal"
        >
          <Save size={16} />
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}
