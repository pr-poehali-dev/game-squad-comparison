interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  bonus?: number;
}

export default function StatBar({ label, value, max = 100, bonus = 0 }: StatBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  const bonusPct = bonus ? Math.min(((value + bonus) / max) * 100, 100) : 0;
  const isPositive = bonus > 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <span className="text-xs text-muted-foreground uppercase tracking-widest">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="font-mono-data text-sm font-medium text-foreground">{value}</span>
          {bonus !== 0 && (
            <span className={`font-mono-data text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{bonus}
            </span>
          )}
        </div>
      </div>
      <div className="stat-bar">
        <div className="relative h-full">
          {bonus !== 0 && (
            <div
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 opacity-30 ${isPositive ? 'bg-green-400' : 'bg-red-400'}`}
              style={{ width: `${Math.max(pct, bonusPct)}%` }}
            />
          )}
          <div
            className="stat-bar-fill"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
