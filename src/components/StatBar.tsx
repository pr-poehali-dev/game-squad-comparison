interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  bonus?: number;
  abilityBonus?: number;
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
            fontFamily: 'Manrope, sans-serif',
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.16em',
            color: 'hsl(222 8% 58%)',
          }}
        >
          {label}
        </span>
        <div className="flex items-baseline gap-1.5">
          <span
            className="font-mono-data"
            style={{ fontSize: '0.8rem', fontWeight: 600, color: 'hsl(38 24% 90%)' }}
          >
            {value}
            {unitLabel ? ` ${unitLabel}` : ''}
          </span>
          {bonus !== 0 && (
            <span
              className="font-mono-data"
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: treatyPositive ? 'hsl(150 48% 60%)' : 'hsl(0 72% 60%)',
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
                fontWeight: 600,
                color: abilityPositive
                  ? 'hsl(210 78% 65%)'
                  : 'hsl(18 84% 62%)',
              }}
            >
              {abilityPositive ? '+' : ''}
              {abilityBonus}
            </span>
          )}
        </div>
      </div>

      <div className="stat-bar">
        <div className="relative h-full">
          {abilityBonus !== 0 && (
            <div
              className="absolute top-0 left-0 h-full transition-all duration-500"
              style={{
                width: `${Math.max(basePct, abilityPct)}%`,
                background: abilityPositive
                  ? 'linear-gradient(180deg, hsl(210 78% 60%), hsl(210 70% 42%))'
                  : 'linear-gradient(180deg, hsl(18 84% 58%), hsl(12 72% 40%))',
                opacity: 0.65,
                borderRadius: '3px',
              }}
            />
          )}
          {bonus !== 0 && (
            <div
              className="absolute top-0 left-0 h-full transition-all duration-500"
              style={{
                width: `${Math.max(basePct, treatyPct)}%`,
                background: treatyPositive
                  ? 'linear-gradient(180deg, hsl(150 48% 55%), hsl(150 44% 36%))'
                  : 'linear-gradient(180deg, hsl(0 72% 58%), hsl(354 62% 38%))',
                opacity: 0.7,
                borderRadius: '3px',
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
