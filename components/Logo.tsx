/** Logo de Mundo Explorer: globo con meridianos y un "sol" de acento. Decorativo (el texto acompaña). */
export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4aa8ff" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="24" fill="url(#logo-g)" />
      <g fill="none" stroke="#eef7ff" strokeWidth="2.6" opacity=".9">
        <ellipse cx="32" cy="32" rx="11" ry="24" />
        <path d="M8 32h48M12 20h40M12 44h40" />
      </g>
      <circle cx="50" cy="14" r="6" fill="#fbbf24" />
    </svg>
  );
}
