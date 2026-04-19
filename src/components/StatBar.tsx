interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  bonus?: number;       // от трактатов — зелёный/красный
  abilityBonus?: number; // от умений — синий/оранжевый
  unitLabel?: string;
}

export default function StatBar({ label, value, max = 100, bonus = 0, abilityBonus = 0, unitLabel }: StatBarProps) {
  const total = value + bonus + abilityBonus;
  const basePct = Math.min((value / max) * 100, 100);
  const treatyPct = bonus !== 0 ? Math.min(((value + bonus) / max) * 100, 100) : 0;
  const abilityPct = abilityBonus !== 0 ? Math.min((total / max) * 100, 100) : 0;

  const treatyPositive = bonus > 0;
  const abilityPositive = abilityBonus > 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <span className="text-xs text-muted-foreground uppercase tracking-widest">{label}</span>
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
      <div className="stat-bar">
        <div className="relative h-full">
          {/* Фон от умений */}
          {abilityBonus !== 0 && (
            <div
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 opacity-25 ${abilityPositive ? 'bg-blue-400' : 'bg-orange-400'}`}
              style={{ width: `${Math.max(basePct, abilityPct)}%` }}
            />
          )}
          {/* Фон от трактатов */}
          {bonus !== 0 && (
            <div
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 opacity-30 ${treatyPositive ? 'bg-green-400' : 'bg-red-400'}`}
              style={{ width: `${Math.max(basePct, treatyPct)}%` }}
            />
          )}
          <div
            className="stat-bar-fill"
            style={{ width: `${basePct}%` }}
          />
        </div>
      </div>
    </div>
  );
}