import { Unit } from '@/data/types';
import { CARD_STATS } from '@/data/statGroups';
import RarityBadge from './RarityBadge';
import StatBar from './StatBar';
import Icon from '@/components/ui/icon';

const CLASS_ICONS: Record<string, string> = {
  'Пехота': 'Sword',
  'Кавалерия': 'Zap',
  'Стрелки': 'Target',
  'Осадные': 'Hammer',
};

interface UnitCardProps {
  unit: Unit;
  onClick: () => void;
  selected?: boolean;
  compact?: boolean;
}

export default function UnitCard({ unit, onClick, selected, compact }: UnitCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        border rounded-sm cursor-pointer animate-fade-in card-hover p-4
        border-rarity-${unit.rarity}
        ${selected ? 'ring-1 ring-primary bg-primary/5' : 'bg-card'}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center flex-shrink-0">
            <Icon name={CLASS_ICONS[unit.class] || 'Shield'} size={16} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-tight text-foreground" style={{ fontFamily: 'Oswald, sans-serif' }}>
              {unit.name}
            </h3>
            <div className="flex gap-2 mt-0.5">
              <span className="text-[10px] text-muted-foreground">{unit.class}</span>
              <span className="text-[10px] text-muted-foreground">·</span>
              <span className="text-[10px] text-muted-foreground">{unit.role}</span>
            </div>
          </div>
        </div>
        <RarityBadge rarity={unit.rarity} />
      </div>

      {!compact && (
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-2">
          {unit.description}
        </p>
      )}

      <div className="space-y-2">
        {CARD_STATS.map(({ key, label, max }) => (
          <StatBar key={key} label={label} value={unit.stats[key]} max={max} />
        ))}
      </div>

      <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Icon name="Users" size={11} />
          <span className="font-mono-data">{unit.stats.troops}</span>
        </div>
        {unit.stats.rangeDistance > 0 ? (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Icon name="Crosshair" size={11} />
            <span className="font-mono-data">{unit.stats.rangeDistance}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Icon name="Sword" size={11} />
            <span className="font-mono-data">ближний бой</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Icon name="Crown" size={11} />
          <span className="font-mono-data">{unit.stats.leadership} лид.</span>
        </div>
      </div>
    </div>
  );
}