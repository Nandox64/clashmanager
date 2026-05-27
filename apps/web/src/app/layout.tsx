import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppShell } from "@/components/layout/app-shell";
import { NavigationLoader } from "@/components/layout/navigation-loader";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clash Manager",
  description: "Gestión inteligente para clanes de Clash Royale",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0d1117",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <NavigationLoader />
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#1c2333",
              border: "1px solid #30363d",
              color: "#e6edf3",
            },
          }}
        />
      </body>
    </html>
  );
}
