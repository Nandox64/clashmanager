"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function VerifyEmailPage() {
  const { user, isLoading, isMock } = useAuth();
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (isMock) {
      router.push("/dashboard");
      return;
    }
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.emailVerified) {
      router.push("/dashboard");
    }
  }, [user, isLoading, isMock, router]);

  const handleResend = async () => {
    if (!auth || !user) return;
    setSending(true);
    setError(null);
    try {
      await sendEmailVerification(user);
      setSent(true);
    } catch {
      setError("Error al enviar el correo. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!user) return;
    await user.reload();
    if (user.emailVerified) {
      router.push("/dashboard");
    } else {
      setError("Aún no has verificado tu correo. Revisa tu bandeja de entrada.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <img src="/carga4.gif" alt="Cargando..." className="w-32 h-32 animate-loading-delay" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-8">
        <div className="flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
            <AlertTriangle size={32} className="text-yellow-400" />
          </div>

          <div className="text-center">
            <h1 className="text-xl font-bold text-clash-text">Verifica tu correo</h1>
            <p className="text-sm text-clash-muted mt-2">
              Para usar CLASE⚔️PRO, necesitas verificar tu dirección de correo electrónico.
            </p>
          </div>

          <div className="w-full space-y-3">
            {sent && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <CheckCircle size={16} className="text-green-400 shrink-0" />
                <p className="text-xs text-green-400">Correo reenviado. Revisa tu bandeja de entrada.</p>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-400 text-center">{error}</p>
            )}

            <a
              href="https://mail.google.com/mail/u/0/#search/Clash+Manager"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full p-3 rounded-lg bg-glass border border-clash-border hover:border-metallic-gold/40 transition-all"
            >
              <Mail size={20} className="text-metallic-gold" />
              <span className="text-sm text-clash-text">Abrir Gmail</span>
            </a>

            <Button
              onClick={handleResend}
              disabled={sending}
              variant="secondary"
              className="w-full"
            >
              {sending ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              Reenviar correo de verificación
            </Button>

            <Button
              onClick={handleCheckVerification}
              variant="metal"
              className="w-full"
            >
              <CheckCircle size={16} />
              Ya verifiqué, continuar
            </Button>
          </div>

          <p className="text-xs text-clash-muted text-center">
            ¿No recibiste el correo? Revisa la carpeta de spam o intenta reenviar.
          </p>
        </div>
      </Card>
    </div>
  );
}
