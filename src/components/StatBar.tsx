interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  bonus?: number;        // от трактатов
  abilityBonus?: number; // от умений
  unitLabel?: string;
}

export default function StatBar({
  label,
  value,
  max = 100,
  bonus = 0,
  abilityBonus = 0,
  unitLabel,
}: StatBarProps) {
  const total = value + bonus + abilityBonus;
  const basePct = Math.min((value / max) * 100, 100);
  const treatyPct =
    bonus !== 0 ? Math.min(((value + bonus) / max) * 100, 100) : 0;
  const abilityPct =
    abilityBonus !== 0 ? Math.min((total / max) * 100, 100) : 0;

  const treatyPositive = bonus > 0;
  const abilityPositive = abilityBonus > 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <span
          className="uppercase"
          style={{
            fontFamily: '"IM Fell English SC", serif',
            fontSize: '0.62rem',
            fontWeight: 400,
            letterSpacing: '0.2em',
            color: 'hsl(30 14% 48%)',
          }}
        >
          {label}
        </span>
        <div className="flex items-baseline gap-1.5">
          <span
            className="font-mono-data"
            style={{ fontSize: '0.8rem', color: 'hsl(40 28% 82%)' }}
          >
            {value}
            {unitLabel ? ` ${unitLabel}` : ''}
          </span>
          {bonus !== 0 && (
            <span
              className="font-mono-data"
              style={{
                fontSize: '0.72rem',
                color: treatyPositive ? 'hsl(90 42% 58%)' : 'hsl(4 62% 58%)',
              }}
            >
              {treatyPositive ? '+' : ''}
              {bonus}
            </span>
          )}
          {abilityBonus !== 0 && (
            <span
              className="font-mono-data"
              style={{
                fontSize: '0.72rem',
                color: abilityPositive
                  ? 'hsl(198 40% 58%)'
                  : 'hsl(18 72% 58%)',
              }}
            >
              {abilityPositive ? '+' : ''}
              {abilityBonus}
            </span>
          )}
        </div>
      </div>

      {/* Кованая канавка со ржавой заливкой */}
      <div className="stat-bar">
        <div className="relative h-full">
          {abilityBonus !== 0 && (
            <div
              className="absolute top-0 left-0 h-full transition-all duration-500"
              style={{
                width: `${Math.max(basePct, abilityPct)}%`,
                background: abilityPositive
                  ? 'hsl(198 40% 42% / 0.45)'
                  : 'hsl(18 72% 45% / 0.45)',
              }}
            />
          )}
          {bonus !== 0 && (
            <div
              className="absolute top-0 left-0 h-full transition-all duration-500"
              style={{
                width: `${Math.max(basePct, treatyPct)}%`,
                background: treatyPositive
                  ? 'hsl(90 42% 42% / 0.5)'
                  : 'hsl(4 62% 42% / 0.5)',
              }}
            />
          )}
          <div
            className="stat-bar-fill absolute top-0 left-0"
            style={{ width: `${basePct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
