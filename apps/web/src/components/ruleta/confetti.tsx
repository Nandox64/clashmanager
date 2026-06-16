"use client";

import { useEffect, useState } from "react";

const COLORS = ["#ffd700", "#ff6b6b", "#48dbfb", "#ff9ff3", "#00d2d3", "#ffa502", "#2ed573", "#a29bfe"];
const PARTICLES = 60;

interface Particle {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  drift: number;
}

export function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }
    const p: Particle[] = Array.from({ length: PARTICLES }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 4 + Math.random() * 8,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      drift: (Math.random() - 0.5) * 40,
    }));
    setParticles(p);
    const timer = setTimeout(() => setParticles([]), 4500);
    return () => clearTimeout(timer);
  }, [active]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-0"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size * 1.5,
            backgroundColor: p.color,
            borderRadius: "2px",
            animation: `confetti-fall ${p.duration}s ease-out ${p.delay}s forwards`,
            transform: `rotate(${Math.random() * 360}deg)`,
            opacity: 0,
            "--drift": `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg) translateX(var(--drift)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
