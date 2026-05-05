export function ShieldEmblem({ size = 34 }: { size?: number }) {
  const id = 'sh-' + size;
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="hsl(222 16% 18%)" />
          <stop offset="100%" stopColor="hsl(222 20% 9%)" />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="hsl(48 80% 72%)" />
          <stop offset="55%" stopColor="hsl(42 76% 54%)" />
          <stop offset="100%" stopColor="hsl(30 64% 40%)" />
        </linearGradient>
        <linearGradient id={`${id}-blood`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="hsl(355 72% 56%)" />
          <stop offset="100%" stopColor="hsl(350 62% 38%)" />
        </linearGradient>
      </defs>
      <path
        d="M18 2 L32 6 V17 C32 25 23.5 31 18 33 C12.5 31 4 25 4 17 V6 L18 2 Z"
        fill={`url(#${id}-body)`}
        stroke={`url(#${id}-gold)`}
        strokeWidth="1.5"
      />
      <path d="M8 16 L18 10 L28 16" stroke={`url(#${id}-gold)`} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M18 14 V27 M13 20 H23" stroke={`url(#${id}-blood)`} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M6 9 L16 4" stroke="hsl(42 76% 70% / 0.35)" strokeWidth="0.8" strokeLinecap="round" />
      <circle cx="18" cy="5.5" r="1.1" fill="hsl(42 76% 58%)" />
      <circle cx="8"  cy="7.5" r="1"   fill="hsl(42 76% 58%)" />
      <circle cx="28" cy="7.5" r="1"   fill="hsl(42 76% 58%)" />
    </svg>
  );
}

export function OrnateDivider() {
  return (
    <div className="px-5 py-2.5">
      <div className="flex items-center gap-2.5">
        <div
          className="flex-1 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, hsl(42 76% 58% / 0.5), transparent)' }}
        />
        <span
          className="w-[6px] h-[6px] rotate-45"
          style={{
            background: 'linear-gradient(135deg, hsl(48 80% 72%), hsl(32 64% 40%))',
            boxShadow: '0 0 6px hsl(42 76% 58% / 0.6)',
          }}
        />
        <div
          className="flex-1 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, hsl(42 76% 58% / 0.5), transparent)' }}
        />
      </div>
    </div>
  );
}
