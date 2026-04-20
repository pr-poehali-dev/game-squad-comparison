interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  bonus?: number;        // от трактатов — зелёный/красный
  abilityBonus?: number; // от умений — синий/оранжевый
  unitLabel?: string;
}

export default function StatBar({ label, value, max = 100, bonus = 0, abilityBonus = 0, unitLabel }: StatBarProps) {
  const total = value + bonus + abilityBonus;
  const basePct     = Math.min((value / max) * 100, 100);
  const treatyPct   = bonus !== 0 ? Math.min(((value + bonus) / max) * 100, 100) : 0;
  const abilityPct  = abilityBonus !== 0 ? Math.min((total / max) * 100, 100) : 0;

  const treatyPositive  = bonus > 0;
  const abilityPositive = abilityBonus > 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <span style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: '0.6rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'hsl(215 18% 40%)',
        }}>
          {label}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="font-mono-data text-sm font-medium text-foreground">
            {value}{unitLabel ? ` ${unitLabel}` : ''}
          </span>
          {bonus !== 0 && (
            <span className={`font-mono-data text-xs ${treatyPositive ? 'text-green-400' : 'text-red-400'}`}>
              {treatyPositive ? '+' : ''}{bonus}
            </span>
          )}
          {abilityBonus !== 0 && (
            <span className={`font-mono-data text-xs ${abilityPositive ? 'text-blue-400' : 'text-orange-400'}`}>
              {abilityPositive ? '+' : ''}{abilityBonus}
            </span>
          )}
        </div>
      </div>

      {/* Полоса — без border-radius, в стиле CB */}
      <div className="stat-bar h-1" style={{ borderRadius: '0', background: 'hsl(224 16% 13%)' }}>
        <div className="relative h-full">
          {/* Слой умений */}
          {abilityBonus !== 0 && (
            <div
              className="absolute top-0 left-0 h-full transition-all duration-500"
              style={{
                width: `${Math.max(basePct, abilityPct)}%`,
                background: abilityPositive ? 'hsl(210 88% 58% / 0.3)' : 'hsl(18 80% 50% / 0.3)',
              }}
            />
          )}
          {/* Слой трактатов */}
          {bonus !== 0 && (
            <div
              className="absolute top-0 left-0 h-full transition-all duration-500"
              style={{
                width: `${Math.max(basePct, treatyPct)}%`,
                background: treatyPositive ? 'hsl(148 52% 44% / 0.35)' : 'hsl(0 70% 48% / 0.35)',
              }}
            />
          )}
          {/* Основная полоса — золотой градиент */}
          <div
            className="absolute top-0 left-0 h-full transition-all duration-700"
            style={{
              width: `${basePct}%`,
              background: 'linear-gradient(90deg, hsl(42 90% 40%), hsl(42 90% 55%))',
              boxShadow: basePct > 10 ? '1px 0 6px hsl(42 90% 52% / 0.4)' : 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
}
