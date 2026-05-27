"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Monitor, Gift, ExternalLink, Upload, Loader2, Trash2, User, Trophy } from "lucide-react";
import { useClanStore } from "@/lib/store";
import { getCachedLinkedMemberId, getCachedRole } from "@/lib/profile-cache";
import { RuletaSection } from "@/components/ruleta/ruleta-section";

type Tab = "mobile" | "pc" | "qr" | "ruleta";

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

const mobileWallpapers: Wallpaper[] = [
  { id: "m1", name: "Clash Royale - Pekka", url: "https://wallpaper.forfun.com/fetch/2e/2e60cd839012687816539ece75ab0db5.jpeg" },
  { id: "m2", name: "Clash Royale - Rey", url: "https://wallpaper.forfun.com/fetch/95/95677c14c93fe08d03d7f0ebb79346e5.jpeg" },
  { id: "m3", name: "Clash Royale - Arena", url: "https://wallpaper.forfun.com/fetch/5e/5e55e8f676e2af627d09d6227ca9e6ff.jpeg" },
  { id: "m4", name: "Clash Royale 4K", url: "https://wallpaper.forfun.com/fetch/0c/0cca8233be22b0a4323718d155049dd5.jpeg" },
  { id: "m5", name: "Clash Royale - Mega Knight", url: "https://wallpaper.forfun.com/fetch/2e/2e6a3c515eaa442fff3aa89686341177.jpeg" },
  { id: "m6", name: "Clash Royale - Legendario", url: "https://wallpaper.forfun.com/fetch/d2/d2aa5413398fb4081826f4c2d7e4513d.jpeg" },
];

const pcWallpapers: Wallpaper[] = [
  { id: "p1", name: "P.E.K.K.A 4K", url: "https://img.uhdpaper.com/wallpaper/pekka-clash-royale-46@0@h-pc-hd.jpg" },
  { id: "p2", name: "Prince 4K", url: "https://img.uhdpaper.com/wallpaper/prince-clash-royale-48@0@h-pc-hd.jpg" },
  { id: "p3", name: "Ice Wizard 4K", url: "https://img.uhdpaper.com/wallpaper/ice-wizard-clash-royale-50@0@h-pc-hd.jpg" },
  { id: "p4", name: "Giant Skeleton 4K", url: "https://img.uhdpaper.com/wallpaper/giant-skeleton-clash-royale-51@0@h-pc-hd.jpg" },
];

const qrDefaults: Wallpaper[] = [
  { id: "q1", name: "Hog Banner QR 1", url: "/qr/Hog_Banner_QR%20Codes_1.jpg" },
  { id: "q2", name: "Hog Banner QR 2", url: "/qr/Hog_Banner_QR%20Codes_2.jpg" },
  { id: "q3", name: "Oro Gratis", url: "/qr/Oro_Gratis.jpg" },
];

const tabs: { id: Tab; label: string; icon: typeof Smartphone }[] = [
  { id: "mobile", label: "Fondos Móvil", icon: Smartphone },
  { id: "pc", label: "Fondos PC", icon: Monitor },
  { id: "qr", label: "Códigos QR", icon: Gift },
  { id: "ruleta", label: "Ruleta", icon: Trophy },
];

function formatDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export default function GiftsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("mobile");
  const [uploaded, setUploaded] = useState<Record<string, UploadedItem[]>>({});
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const members = useClanStore((s) => s.members);

  const linkedId = getCachedLinkedMemberId();
  const cachedRole = getCachedRole();
  const linkedMember = members.find((m) => m.uid === linkedId);
  const userRole = linkedMember?.role ?? cachedRole ?? null;
  const isLeader = userRole === "leader";
  const uploaderName = linkedMember?.displayName || "Anónimo";
  const uploaderUid = linkedId || "";

  const fetchUploaded = () => {
    fetch("/api/resources/list")
      .then((r) => r.json())
      .then((data) => {
        const mapped: Record<string, UploadedItem[]> = {};
        for (const type of ["mobile", "pc", "qr"] as const) {
          mapped[type] = (data[type] || []).map((item: UploadedItem, i: number) => ({
            ...item,
            id: `upload-${type}-${i}`,
          }));
        }
        setUploaded(mapped);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchUploaded();
  }, []);

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
      const res = await fetch("/api/resources/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
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
    } catch {
      // silent
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (slug: string) => {
    setDeleting(slug);
    try {
      const res = await fetch("/api/resources/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: activeTab, slug, userRole }),
      });
      if (res.ok) {
        setUploaded((prev) => ({
          ...prev,
          [activeTab]: (prev[activeTab] || []).filter((item) => item.slug !== slug),
        }));
      }
    } catch {
      // silent
    } finally {
      setDeleting(null);
    }
  };

  const renderUploadedBy = (item: UploadedItem) => {
    if (!item.uploaderName) return null;
    return (
      <p className="text-[10px] text-clash-muted/60 flex items-center gap-1 truncate">
        <User size={10} />
        {item.uploaderName}
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

  const allMobile = [...mobileWallpapers, ...(uploaded.mobile || [])];
  const allPc = [...pcWallpapers, ...(uploaded.pc || [])];
  const allQr = [...qrDefaults, ...(uploaded.qr || [])];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-clash-text">Regalos</h1>
        <p className="text-sm text-clash-muted mt-0.5">
          Fondos de pantalla y códigos QR para canjear recompensas
        </p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-metallic-gold">Recursos</CardTitle>
            <p className="text-xs text-clash-muted mt-0.5">
              Descarga wallpapers HD, canjea códigos QR activos o sube tus propios recursos
            </p>
          </div>
        </CardHeader>

        <div className="flex gap-1 p-1 rounded-lg bg-glass mb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
                  isActive
                    ? "bg-metallic-gold text-black shadow-sm"
                    : "text-clash-muted hover:text-clash-text"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab !== "ruleta" && (
          <div className="mb-4 flex items-center gap-3">
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
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-metallic-gold text-black text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              {uploading ? "Subiendo..." : "Subir imagen"}
            </button>
            <p className="text-xs text-clash-muted">
              {activeTab === "mobile" && "Fondos para celular (9:16)"}
              {activeTab === "pc" && "Fondos para PC (16:9)"}
              {activeTab === "qr" && "Códigos QR para canjear"}
            </p>
          </div>
        )}

        <div>
          {activeTab === "mobile" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
            </div>
          )}
          {activeTab === "pc" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                <p className="text-xs text-clash-muted text-center pt-2 col-span-full">No hay fondos aún. ¡Sube el primero!</p>
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
              <p className="text-xs text-clash-muted text-center pt-2">
                Escanea el código QR desde Clash Royale para canjear la recompensa
              </p>
            </div>
          )}
          {activeTab === "ruleta" && <RuletaSection />}
        </div>
      </Card>
    </div>
  );
}
