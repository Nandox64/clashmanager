"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error de carga:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-4xl">⚔️</div>
        <h1 className="text-lg font-bold text-clash-gold">
          Algo salió mal
        </h1>
        <p className="text-sm text-clash-light-muted">
          No se pudo cargar la aplicación. Revisa tu conexión o intenta de nuevo.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-metallic-gold animate-metallic-shimmer text-black border border-clash-border text-sm font-medium hover:brightness-110"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
