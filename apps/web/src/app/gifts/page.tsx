"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Monitor, Gift, ExternalLink, Upload, Loader2, Trash2, User } from "lucide-react";
import { useClanStore } from "@/lib/store";
import { getCachedLinkedMemberId, getCachedRole } from "@/lib/profile-cache";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type Tab = "mobile" | "pc" | "qr";

interface Wallpaper {
  id: string;
  name: string;
  url: string;
  author?: string;
}

interface UploadedItem extends Wallpaper {
  slug?: string;
  uploaderName?: string;
  uploaderUid?: string;
  uploadedAt?: number;
}



const tabs: { id: Tab; label: string; title: string; help: string; icon: typeof Smartphone }[] = [
  { id: "mobile", label: "Móvil", title: "RECURSOS PARA MÓVIL", help: "Vertical 9:16 · Máx 3MB por imagen.", icon: Smartphone },
  { id: "pc", label: "PC", title: "RECURSOS PARA COMPUTADOR", help: "Horizontal 16:9 · Máx 3MB por imagen.", icon: Monitor },
  { id: "qr", label: "Códigos", title: "CÓDIGOS QR DE RECOMPENSAS", help: "Captura clara sin recortes · Máx 3MB.", icon: Gift },
];

function formatDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export default function GiftsPage() {
  const { user, isMock, profile: authProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("mobile");
  const [uploaded, setUploaded] = useState<Record<string, UploadedItem[]>>({});
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const members = useClanStore((s) => s.members);

  const [linkedId, setLinkedId] = useState<string | null>(null);
  const [cachedRole, setCachedRole] = useState<string | null>(null);
  const linkedMember = members.find((m) => m.uid === linkedId);
  const userRole = linkedMember?.role ?? cachedRole ?? null;
  const isLeader = userRole === "leader";
  const leaderName = members.find((m) => m.role === "leader")?.displayName;
  const uploaderName = linkedMember?.displayName || "Anónimo";
  const uploaderUid = linkedId || "";

  useEffect(() => {
    setLinkedId(getCachedLinkedMemberId());
    setCachedRole(getCachedRole());
  }, []);

  const getDisplayUploaderName = (name?: string, fallback?: string) => {
    if (!name || name.trim().toLowerCase() === "anónimo" || name.trim().toLowerCase() === "anonimo") {
      return fallback || name;
    }
    return name;
  };

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    if (isMock) return { Authorization: `Bearer mock-${authProfile?.uid ?? "mode"}` };
    const token = await user?.getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchUploaded = () => {
    fetch("/api/resources/list")
      .then((r) => r.json())
      .then((data) => {
        const mapped: Record<string, UploadedItem[]> = {};
        const fallbackUploader = leaderName;
        for (const type of ["mobile", "pc", "qr"] as const) {
          mapped[type] = (data[type] || []).map((item: UploadedItem, i: number) => ({
            ...item,
            uploaderName: getDisplayUploaderName(item.uploaderName, fallbackUploader),
            id: `upload-${type}-${i}`,
          }));
        }
        setUploaded(mapped);
      })
      .catch(() => toast.error("Error al cargar recursos"));
  };

  useEffect(() => {
    fetchUploaded();
  }, [leaderName]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("type", activeTab);
    formData.append("file", file);
    formData.append("uploaderName", uploaderName);
    formData.append("uploaderUid", uploaderUid);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/resources/upload", { method: "POST", headers, body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Error al subir imagen");
      }
      const data = await res.json();
      const newItem: UploadedItem = {
        id: `upload-${Date.now()}`,
        name: data.name,
        url: data.url,
        slug: data.slug,
        uploaderName: data.uploaderName,
        uploaderUid: data.uploaderUid,
        uploadedAt: data.uploadedAt,
      };
      setUploaded((prev) => ({ ...prev, [activeTab]: [...(prev[activeTab] || []), newItem] }));
      toast.success("Imagen subida");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (slug: string) => {
    setDeleting(slug);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/resources/delete", {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ type: activeTab, slug }),
      });
      if (res.ok) {
        setUploaded((prev) => ({
          ...prev,
          [activeTab]: (prev[activeTab] || []).filter((item) => item.slug !== slug),
        }));
        toast.success("Imagen eliminada");
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || "Error al eliminar imagen");
      }
    } catch {
      toast.error("Error al eliminar imagen");
    } finally {
      setDeleting(null);
    }
  };

  const renderUploadedBy = (item: UploadedItem) => {
    if (!item.uploaderName) return null;
    return (
      <p className="text-[10px] text-clash-dimmed flex items-center gap-1 truncate">
        <User size={10} />
        Subido por: {item.uploaderName}
        {item.uploadedAt ? ` · ${formatDate(item.uploadedAt)}` : ""}
      </p>
    );
  };

  const renderDeleteBtn = (item: UploadedItem) => {
    if (!isLeader || !item.slug) return null;
    return (
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(item.slug!); }}
        disabled={deleting === item.slug}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-red-500/80 text-white hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100"
      >
        {deleting === item.slug ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Trash2 size={14} />
        )}
      </button>
    );
  };

  const allMobile = uploaded.mobile || [];
  const allPc = uploaded.pc || [];
  const allQr = uploaded.qr || [];
  const activeTabConfig = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Gift size={24} className="text-[#ffd700]" style={{ filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.5)) drop-shadow(1px 0 0 rgba(0,0,0,0.5)) drop-shadow(-1px 0 0 rgba(0,0,0,0.5)) drop-shadow(0 -1px 0 rgba(0,0,0,0.5)) drop-shadow(0 0 6px rgba(0,0,0,0.35))' }} />
          <h1 className="text-page-title text-2xl">Regalos</h1>
        </div>
        <p className="text-sm text-clash-muted mt-0.5">
          Fondos de pantalla y códigos QR para canjear recompensas
        </p>
      </div>

      <img src="/gifts.png" alt="Banner" className="w-auto max-w-full h-auto rounded-xl object-contain max-h-[200px] mb-1" />

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-page-title text-xl font-black">Recursos</CardTitle>
            <p className="text-xs text-clash-dimmed mt-0.5">
              Biblioteca del clan para compartir fondos, códigos QR y ver quién los aportó.
            </p>
          </div>
        </CardHeader>

        <div className="grid grid-cols-2 sm:flex gap-1 p-1 rounded-lg bg-glass mb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all sm:flex-1 justify-center whitespace-nowrap ${
                  isActive
                    ? "bg-metallic-gold text-black shadow-sm"
                    : "text-clash-text hover:text-metallic-gold"
                }`}
              >
                <Icon size={15} className="shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all sm:flex-1 justify-center whitespace-nowrap bg-metallic-gold text-black shadow-sm hover:brightness-110 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Upload size={15} />
            )}
            <span>{uploading ? "Subiendo..." : "Subir imagen"}</span>
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-clash-border bg-glass p-4">
          <h2 className="text-page-title text-base font-black tracking-[0.18em]">{activeTabConfig.title}</h2>
          <p className="text-xs text-clash-dimmed mt-1">{activeTabConfig.help}</p>
        </div>

        <div>
          {activeTab === "mobile" && (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {allMobile.map((item) => {
                const upItem = item as UploadedItem;
                return (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative rounded-xl overflow-hidden bg-glass border border-clash-border hover:border-metallic-gold/40 transition-all block"
                  >
                    <div className="aspect-[9/16] bg-glass-card flex items-center justify-center overflow-hidden">
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="p-3 rounded-full bg-metallic-gold text-black hover:brightness-110 transition-all">
                        <ExternalLink size={20} />
                      </span>
                    </div>
                    {renderDeleteBtn(upItem)}
                    <div className="p-2">
                      <p className="text-xs text-clash-text truncate">{item.name}</p>
                      {renderUploadedBy(upItem)}
                    </div>
                  </a>
                );
              })}
              {allMobile.length === 0 && (
                <p className="text-xs text-clash-dimmed text-center pt-2 col-span-full">No hay fondos aún. ¡Sube el primero!</p>
              )}
            </div>
          )}
          {activeTab === "pc" && (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {allPc.map((item) => {
                const upItem = item as UploadedItem;
                return (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative rounded-xl overflow-hidden bg-glass border border-clash-border hover:border-metallic-gold/40 transition-all block"
                  >
                    <div className="aspect-video bg-glass-card flex items-center justify-center overflow-hidden">
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="p-3 rounded-full bg-metallic-gold text-black hover:brightness-110 transition-all">
                        <ExternalLink size={20} />
                      </span>
                    </div>
                    {renderDeleteBtn(upItem)}
                    <div className="p-2">
                      <p className="text-xs text-clash-text truncate">{item.name}</p>
                      {renderUploadedBy(upItem)}
                    </div>
                  </a>
                );
              })}
              {allPc.length === 0 && (
                <p className="text-xs text-clash-dimmed text-center pt-2 col-span-full">No hay fondos aún. ¡Sube el primero!</p>
              )}
            </div>
          )}
          {activeTab === "qr" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {allQr.map((item) => {
                  const upItem = item as UploadedItem;
                  return (
                    <div
                      key={item.id}
                      className="group relative rounded-xl overflow-hidden bg-glass border border-clash-border hover:border-metallic-gold/40 transition-all"
                    >
                      <div className="aspect-square bg-glass-card flex items-center justify-center overflow-hidden">
                        <img src={item.url} alt={item.name} className="w-full h-full object-contain p-4" loading="lazy" />
                      </div>
                      {renderDeleteBtn(upItem)}
                      <div className="p-2 text-center">
                        <p className="text-xs text-clash-text truncate">{item.name}</p>
                        {renderUploadedBy(upItem)}
                      </div>
                    </div>
                  );
                })}
              </div>
              {allQr.length === 0 && (
                <p className="text-xs text-clash-dimmed text-center pt-2 col-span-full">No hay códigos QR aún. ¡Sube el primero!</p>
              )}
              {allQr.length > 0 && (
                <p className="text-xs text-clash-dimmed text-center pt-2">
                  Escanea el código QR desde Clash Royale para canjear la recompensa
                </p>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
