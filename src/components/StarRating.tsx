interface StarRatingProps {
  value: number;       // 0–5, шаг 0.5
  size?: number;
  className?: string;
}

/* Геральдический крестъ — заменяет привычные звёзды */
const CROSS = 'M12 2 L14 9 L22 9 L22 15 L14 15 L12 22 L10 15 L2 15 L2 9 L10 9 Z';

const MEDAL_FILL   = '#b05a32'; /* ржавая медь */
const MEDAL_STROKE = '#6e2f18'; /* потемневшая медь */
const MEDAL_EMPTY  = '#6e2f1844';

export default function StarRating({ value, size = 12, className = '' }: StarRatingProps) {
  if (!value || value <= 0) return null;

  const shapes = [];
  for (let i = 1; i <= 5; i++) {
    if (value >= i) {
      shapes.push(
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" className="flex-shrink-0">
          <path d={CROSS} fill={MEDAL_FILL} stroke={MEDAL_STROKE} strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      );
    } else if (value >= i - 0.5) {
      shapes.push(
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" className="flex-shrink-0">
          <defs>
            <linearGradient id={`hg-${i}-${size}`}>
              <stop offset="50%" stopColor={MEDAL_FILL} />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path d={CROSS} fill={`url(#hg-${i}-${size})`} stroke={MEDAL_STROKE} strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      );
    } else {
      shapes.push(
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" className="flex-shrink-0">
          <path d={CROSS} fill="none" stroke={MEDAL_EMPTY} strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      );
    }
  }

  return <span className={`inline-flex items-center gap-0.5 ${className}`}>{shapes}</span>;
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
                  <path d={CROSS} fill={MEDAL_FILL} stroke={MEDAL_STROKE} strokeWidth="1.2" strokeLinejoin="round" />
                ) : half ? (
                  <>
                    <defs>
                      <linearGradient id={`hg${i}`}>
                        <stop offset="50%" stopColor={MEDAL_FILL} />
                        <stop offset="50%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                    <path d={CROSS} fill={`url(#hg${i})`} stroke={MEDAL_STROKE} strokeWidth="1.2" strokeLinejoin="round" />
                  </>
                ) : (
                  <path d={CROSS} fill="none" stroke={MEDAL_EMPTY} strokeWidth="1.2" strokeLinejoin="round" />
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