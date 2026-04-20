interface StarRatingProps {
  value: number;
  size?: number;
  className?: string;
}

const STAR = 'M12 2 L14.8 8.6 L22 9.3 L16.5 14.1 L18.2 21 L12 17.3 L5.8 21 L7.5 14.1 L2 9.3 L9.2 8.6 Z';

const FILL_GRAD = 'star-fill-grad';
const EMPTY_STROKE = 'hsl(42 40% 40% / 0.45)';

export default function StarRating({ value, size = 12, className = '' }: StarRatingProps) {
  if (!value || value <= 0) return null;

  const uid = 'sr-' + size;

  const gradient = (
    <linearGradient id={`${uid}-${FILL_GRAD}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"  stopColor="hsl(52 92% 76%)" />
      <stop offset="50%" stopColor="hsl(42 86% 60%)" />
      <stop offset="100%" stopColor="hsl(30 68% 42%)" />
    </linearGradient>
  );

  const halfGrad = (i: number) => (
    <linearGradient id={`${uid}-half-${i}`} x1="0" y1="0" x2="1" y2="0">
      <stop offset="50%" stopColor={`url(#${uid}-${FILL_GRAD})`} />
      <stop offset="50%" stopColor="transparent" />
    </linearGradient>
  );

  const shapes = [];
  for (let i = 1; i <= 5; i++) {
    if (value >= i) {
      shapes.push(
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" className="flex-shrink-0">
          <defs>{gradient}</defs>
          <path
            d={STAR}
            fill={`url(#${uid}-${FILL_GRAD})`}
            stroke="hsl(30 68% 36%)"
            strokeWidth="0.9"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 ${Math.max(size * 0.25, 3)}px hsl(42 76% 56% / 0.55))` }}
          />
        </svg>,
      );
    } else if (value >= i - 0.5) {
      shapes.push(
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" className="flex-shrink-0">
          <defs>
            {gradient}
            {halfGrad(i)}
          </defs>
          <path
            d={STAR}
            fill={`url(#${uid}-half-${i})`}
            stroke="hsl(30 68% 36%)"
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
        </svg>,
      );
    } else {
      shapes.push(
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" className="flex-shrink-0">
          <path d={STAR} fill="none" stroke={EMPTY_STROKE} strokeWidth="1.1" strokeLinejoin="round" />
        </svg>,
      );
    }
  }

  return <span className={`inline-flex items-center gap-0.5 ${className}`}>{shapes}</span>;
}

interface StarPickerProps {
  value: number;
  onChange: (v: number) => void;
}

export function StarPicker({ value, onChange }: StarPickerProps) {
  const SIZE = 26;
  const uid = 'sp';

  const handleClick = (i: number, half: boolean) => {
    const target = half ? i - 0.5 : i;
    onChange(value === target ? 0 : target);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-0.5">
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id={`${uid}-grad`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(52 92% 76%)" />
              <stop offset="50%" stopColor="hsl(42 86% 60%)" />
              <stop offset="100%" stopColor="hsl(30 68% 42%)" />
            </linearGradient>
          </defs>
        </svg>
        {[1, 2, 3, 4, 5].map(i => {
          const full = value >= i;
          const half = !full && value >= i - 0.5;
          return (
            <span key={i} className="relative cursor-pointer" style={{ width: SIZE, height: SIZE }}>
              <svg width={SIZE} height={SIZE} viewBox="0 0 24 24" className="pointer-events-none absolute inset-0">
                {full ? (
                  <path d={STAR} fill={`url(#${uid}-grad)`} stroke="hsl(30 68% 36%)" strokeWidth="0.9" strokeLinejoin="round" />
                ) : half ? (
                  <>
                    <defs>
                      <linearGradient id={`${uid}-half${i}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="50%" stopColor={`url(#${uid}-grad)`} />
                        <stop offset="50%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                    <path d={STAR} fill={`url(#${uid}-half${i})`} stroke="hsl(30 68% 36%)" strokeWidth="0.9" strokeLinejoin="round" />
                  </>
                ) : (
                  <path d={STAR} fill="none" stroke={EMPTY_STROKE} strokeWidth="1.1" strokeLinejoin="round" />
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
      <span className="text-xs font-mono-data w-8" style={{ color: 'hsl(222 8% 58%)' }}>
        {value > 0 ? value : '—'}
      </span>
      {value > 0 && (
        <button
          type="button"
          onClick={() => onChange(0)}
          className="text-[10px] underline transition-colors"
          style={{ color: 'hsl(222 8% 58%)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'hsl(355 72% 68%)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'hsl(222 8% 58%)')}
        >
          сброс
        </button>
      )}
    </div>
  );
}
