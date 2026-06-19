"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Smartphone, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AuthMode = "login" | "signup" | "verify";

export default function LoginPage() {
  const { user, isLoading, signInWithGoogle, signUpWithEmail, signInWithEmail, isMock } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState<{ email: string; phone: string } | null>(null);

  useEffect(() => {
    if (!isLoading && (user || isMock)) {
      router.push("/dashboard");
    }
  }, [user, isMock, isLoading, router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("popup-closed")) return;
        setError("Error al iniciar sesión. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Completa todos los campos");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
    } catch (err: unknown) {
      const fbErr = err as { code?: string };
      if (fbErr.code === "auth/user-not-found" || fbErr.code === "auth/wrong-password" || fbErr.code === "auth/invalid-credential") {
        setError("Email o contraseña incorrectos");
      } else if (fbErr.code === "auth/invalid-email") {
        setError("Email inválido");
      } else {
        setError("Error al iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setError("Completa los campos obligatorios");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signUpWithEmail(email, password);
      setCreatedUser({ email, phone });
      setMode("verify");
    } catch (err: unknown) {
      const fbErr = err as { code?: string };
      if (fbErr.code === "auth/email-already-in-use") {
        setError("Este email ya está registrado");
      } else if (fbErr.code === "auth/invalid-email") {
        setError("Email inválido");
      } else if (fbErr.code === "auth/weak-password") {
        setError("La contraseña es muy débil");
      } else {
        setError("Error al crear la cuenta");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <img src="/carga4.gif" alt="Cargando..." className="w-32 h-32 animate-loading-delay" />
      </div>
    );
  }

  if (mode === "verify" && createdUser) {
    const waMsg = encodeURIComponent(`Hola, acabo de crear mi cuenta en CLASE⚔️PRO con el email: ${createdUser.email}. Por favor verifica mi registro.`);
    const waLink = `https://wa.me/?text=${waMsg}`;

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-sm p-8">
          <div className="flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-clash-text">¡Cuenta creada!</h1>
              <p className="text-sm text-clash-muted mt-2">
                Revisa tu correo <strong className="text-clash-text">{createdUser.email}</strong> y haz clic en el enlace de verificación.
              </p>
            </div>

            <div className="w-full space-y-3">
              <a
                href={`https://mail.google.com/mail/u/0/#search/Clash+Manager`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full p-3 rounded-lg bg-glass border border-clash-border hover:border-metallic-gold/40 transition-all"
              >
                <Mail size={20} className="text-metallic-gold" />
                <span className="text-sm text-clash-text">Abrir Gmail</span>
              </a>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full p-3 rounded-lg bg-glass border border-clash-border hover:border-metallic-gold/40 transition-all"
              >
                <Smartphone size={20} className="text-green-400" />
                <span className="text-sm text-clash-text">Confirmar por WhatsApp</span>
              </a>
            </div>

            <p className="text-xs text-clash-muted text-center">
              ¿Ya verificaste?{" "}
              <button
                onClick={() => { setMode("login"); setCreatedUser(null); }}
                className="text-metallic-gold hover:underline"
              >
                Iniciar sesión
              </button>
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dynamic flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-sm p-4 sm:p-8 overflow-y-auto max-h-[95dvh]">
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          <img
            src="/logo_cm.webp"
            alt="Clase Pro"
            className="w-36 sm:w-48 h-auto object-contain"
          />

          <img
            src="/logo_clase_pro.png"
            alt="Clase Pro"
            className="w-32 h-32 sm:w-52 sm:h-52 object-contain"
          />

          <div className="text-center">
            <p className="text-xs sm:text-sm text-clash-muted mt-1">
              Gestiona tu clan como un profesional
            </p>
          </div>

          {/* Toggle */}
          <div className="flex gap-1 p-1 rounded-lg bg-glass w-full">
            <button
              onClick={() => { setMode("login"); setError(null); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                mode === "login" ? "bg-metallic-gold text-black shadow-sm" : "text-clash-muted hover:text-clash-text"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => { setMode("signup"); setError(null); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                mode === "signup" ? "bg-metallic-gold text-black shadow-sm" : "text-clash-muted hover:text-clash-text"
              }`}
            >
              Crear cuenta
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}

          {mode === "login" ? (
            <form onSubmit={handleEmailSignIn} className="w-full space-y-3">
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-clash-border bg-glass px-3 py-2 text-sm text-clash-text focus:outline-none focus:border-metallic-gold focus:ring-1 focus:ring-metallic-gold transition-colors"
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-clash-border bg-glass px-3 py-2 text-sm text-clash-text focus:outline-none focus:border-metallic-gold focus:ring-1 focus:ring-metallic-gold transition-colors"
              />
              <Button type="submit" className="w-full" variant="metal" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-clash-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-glass px-2 text-clash-muted">o continúa con</span>
                </div>
              </div>
              <Button
                type="button"
                className="w-full"
                variant="secondary"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="w-full space-y-3">
              <input
                type="text"
                placeholder="Nombre completo *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-clash-border bg-glass px-3 py-2 text-sm text-clash-text focus:outline-none focus:border-metallic-gold focus:ring-1 focus:ring-metallic-gold transition-colors"
              />
              <input
                type="email"
                placeholder="Correo electrónico *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-clash-border bg-glass px-3 py-2 text-sm text-clash-text focus:outline-none focus:border-metallic-gold focus:ring-1 focus:ring-metallic-gold transition-colors"
              />
              <input
                type="tel"
                placeholder="WhatsApp (opcional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-clash-border bg-glass px-3 py-2 text-sm text-clash-text focus:outline-none focus:border-metallic-gold focus:ring-1 focus:ring-metallic-gold transition-colors"
              />
              <input
                type="password"
                placeholder="Contraseña * (mín. 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-clash-border bg-glass px-3 py-2 text-sm text-clash-text focus:outline-none focus:border-metallic-gold focus:ring-1 focus:ring-metallic-gold transition-colors"
              />
              <input
                type="password"
                placeholder="Confirmar contraseña *"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-clash-border bg-glass px-3 py-2 text-sm text-clash-text focus:outline-none focus:border-metallic-gold focus:ring-1 focus:ring-metallic-gold transition-colors"
              />
              <Button type="submit" className="w-full" variant="metal" disabled={loading}>
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
