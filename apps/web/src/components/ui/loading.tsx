interface LoadingProps {
  size?: number;
  text?: string;
  className?: string;
}

export function Loading({ size = 96, text, className = "" }: LoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <div
        className="rounded-2xl bg-clash-border animate-skeleton"
        style={{ width: size, height: size }}
      />
      {text && (
        <span className="text-sm text-clash-muted">{text}</span>
      )}
    </div>
  );
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg bg-clash-border animate-skeleton ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-clash-border p-4 space-y-3">
      <SkeletonBlock className="h-4 w-2/3" />
      <SkeletonBlock className="h-3 w-full" />
      <SkeletonBlock className="h-3 w-4/5" />
      <div className="flex gap-2 pt-2">
        <SkeletonBlock className="h-8 w-8 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <SkeletonBlock className="h-3 w-1/2" />
          <SkeletonBlock className="h-3 w-1/3" />
        </div>
      </div>
    </div>
  );
}

export function LoadingScreen({ text = "Cargando..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-32 h-32 mx-auto rounded-2xl bg-clash-border animate-skeleton" />
        <p className="text-sm text-clash-muted">{text}</p>
      </div>
    </div>
  );
}
