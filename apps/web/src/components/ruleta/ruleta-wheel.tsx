"use client";

import { useEffect, useState } from "react";

const SEGMENTS = [
  "no-ganar", "oro-1k", "oro-10k", "gemas-500", "gemas-1200", "pass",
];

const SEGMENT_ANGLE = 360 / SEGMENTS.length;
const SIZE = 400;

interface RuletaWheelProps {
  spinning: boolean;
  resultIndex: number | null;
  spinTrigger: number;
}

export function RuletaWheel({ spinning, resultIndex, spinTrigger }: RuletaWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [spinCount, setSpinCount] = useState(0);

  useEffect(() => {
    console.log("[RuletaWheel] Props:", { spinning, resultIndex, spinTrigger, rotation });
    if (resultIndex === null) return;
    console.log("[RuletaWheel] Animating to segment:", resultIndex, "trigger:", spinTrigger);
    const segCenter = resultIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    const next = spinCount + 1;
    setSpinCount(next);
    setRotation(360 * 5 * next + (360 - segCenter));
  }, [resultIndex, spinTrigger]);

  return (
    <div className="relative inline-block">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
        <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-red-500 drop-shadow-[0_0_6px_rgba(255,50,50,0.6)]" />
      </div>

      <img
        src="/uploads/ruleta/ruleta-wheel.webp"
        alt="Ruleta"
        width={SIZE}
        height={SIZE}
        className="rounded-full select-none"
        draggable={false}
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center center",
          transition: spinning
            ? "transform 8s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
            : "none",
        }}
      />
    </div>
  );
}
