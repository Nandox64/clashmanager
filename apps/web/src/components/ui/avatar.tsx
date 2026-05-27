"use client";

import { cn, getInitials } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
};

const gradients = [
  "from-red-500 to-orange-500",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-emerald-500",
  "from-purple-500 to-pink-500",
  "from-yellow-500 to-amber-500",
];

export function Avatar({
  className,
  name,
  src,
  size = "md",
  ...props
}: AvatarProps) {
  const gradientIndex =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    gradients.length;

  if (src) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-full flex-shrink-0",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold flex-shrink-0 bg-gradient-to-br text-white",
        gradients[gradientIndex],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {getInitials(name)}
    </div>
  );
}
