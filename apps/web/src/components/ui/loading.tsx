interface LoadingProps {
  size?: number;
  text?: string;
  className?: string;
}

export function Loading({ size = 96, text, className = "" }: LoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <img
        src="/carga4.gif"
        alt="Cargando..."
        style={{ width: size, height: size }}
        className="object-contain animate-loading-delay"
      />
      {text && (
        <span className="text-sm text-clash-muted">{text}</span>
      )}
    </div>
  );
}
