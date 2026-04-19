interface StarRatingProps {
  value: number;       // 0–5, шаг 0.5
  size?: number;
  className?: string;
}

export default function StarRating({ value, size = 12, className = '' }: StarRatingProps) {
  if (!value || value <= 0) return null;

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (value >= i) {
      stars.push(
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400 flex-shrink-0">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      );
    } else if (value >= i - 0.5) {
      stars.push(
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" className="text-yellow-400 flex-shrink-0">
          <defs>
            <linearGradient id={`hg-${i}-${size}`}>
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={`url(#hg-${i}-${size})`}
            stroke="#facc15"
            strokeWidth="1.5"
          />
        </svg>
      );
    } else {
      stars.push(
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-yellow-400/25 flex-shrink-0">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      );
    }
  }

  return <span className={`inline-flex items-center gap-0.5 ${className}`}>{stars}</span>;
}

// ── Интерактивный пикер для AdminPage ──
interface StarPickerProps {
  value: number;
  onChange: (v: number) => void;
}

export function StarPicker({ value, onChange }: StarPickerProps) {
  const SIZE = 24;

  const handleClick = (i: number, half: boolean) => {
    const target = half ? i - 0.5 : i;
    onChange(value === target ? 0 : target);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(i => {
          const full = value >= i;
          const half = !full && value >= i - 0.5;
          return (
            <span key={i} className="relative cursor-pointer" style={{ width: SIZE, height: SIZE }}>
              <svg width={SIZE} height={SIZE} viewBox="0 0 24 24" className="pointer-events-none absolute inset-0">
                {full ? (
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                    fill="#facc15" />
                ) : half ? (
                  <>
                    <defs>
                      <linearGradient id={`hg${i}`}>
                        <stop offset="50%" stopColor="#facc15" />
                        <stop offset="50%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                      fill={`url(#hg${i})`} stroke="#facc15" strokeWidth="1.5" />
                  </>
                ) : (
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                    fill="none" stroke="#facc1540" strokeWidth="1.5" />
                )}
              </svg>
              <span className="absolute left-0 top-0 h-full z-10" style={{ width: '50%' }}
                onClick={() => handleClick(i, true)} />
              <span className="absolute right-0 top-0 h-full z-10" style={{ width: '50%' }}
                onClick={() => handleClick(i, false)} />
            </span>
          );
        })}
      </div>
      <span className="text-xs text-muted-foreground font-mono-data w-8">
        {value > 0 ? value : '—'}
      </span>
      {value > 0 && (
        <button type="button" onClick={() => onChange(0)}
          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors underline">
          сброс
        </button>
      )}
    </div>
  );
}
