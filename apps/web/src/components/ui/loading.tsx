import Image from "next/image";

interface LoadingProps {
  size?: number;
  text?: string;
  className?: string;
}

export function Loading({ size = 96, text, className = "" }: LoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Image
        src="/logo_clase_pro.png"
        alt="CLASE⚔️PRO"
        width={size}
        height={size}
        className="object-contain animate-logo-pulse"
      />
      {text && (
        <span className="text-sm text-clash-dimmed animate-logo-glow">{text}</span>
      )}
    </div>
  );
}

export function LoadingScreen({ text = "Cargando..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Image
          src="/logo_clase_pro.png"
          alt="CLASE⚔️PRO"
          width={128}
          height={128}
          className="object-contain animate-logo-pulse"
        />
        <p className="text-sm text-clash-dimmed animate-logo-glow">{text}</p>
      </div>
    </div>
  );
}
