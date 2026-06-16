interface ElixirIconProps {
  size?: number;
  className?: string;
}

export function ElixirIcon({ size = 16, className }: ElixirIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Elixir"
    >
      <path
        d="M12 2C12 2 6 10 6 15C6 18.3137 8.68629 21 12 21C15.3137 21 18 18.3137 18 15C18 10 12 2 12 2Z"
        fill="url(#elixir-grad)"
        stroke="#7C3AED"
        strokeWidth="1.2"
      />
      <path
        d="M10 16C10 16 10.5 17.5 12 17.5C13.5 17.5 14 16 14 16"
        stroke="#A78BFA"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <defs>
        <linearGradient id="elixir-grad" x1="12" y1="2" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A78BFA" />
          <stop offset="0.5" stopColor="#7C3AED" />
          <stop offset="1" stopColor="#5B21B6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
