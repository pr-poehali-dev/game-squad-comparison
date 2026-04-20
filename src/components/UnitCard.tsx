import { Unit, UnitRole } from '@/data/types';
import { CARD_STATS } from '@/data/statGroups';
import RarityBadge from './RarityBadge';
import StatBar from './StatBar';
import Icon from '@/components/ui/icon';
import StarRating from './StarRating';

const CLASS_ICONS: Record<string, string> = {
  'Пехота':   'Sword',
  'Кавалерия':'Zap',
  'Стрелки':  'Crosshair',
  'Осадные':  'Hammer',
};

/* Цвет иконки класса */
const CLASS_COLORS: Record<string, string> = {
  'Пехота':    'hsl(215 18% 52%)',
  'Кавалерия': 'hsl(38 80% 52%)',
  'Стрелки':   'hsl(148 52% 44%)',
  'Осадные':   'hsl(18 80% 50%)',
};

function getRoles(role: UnitRole | UnitRole[]): UnitRole[] {
  return Array.isArray(role) ? role : [role];
}

interface UnitCardProps {
  unit: Unit;
  onClick: () => void;
  selected?: boolean;
  compact?: boolean;
}

export default function UnitCard({ unit, onClick, selected, compact }: UnitCardProps) {
  const roles = getRoles(unit.role);
  const combatIcon = CLASS_ICONS[unit.class] || 'Sword';
  const iconColor = CLASS_COLORS[unit.class] || 'hsl(215 18% 52%)';

  return (
    <div
      onClick={onClick}
      className={`
        relative border cursor-pointer animate-fade-in group overflow-hidden
        border-rarity-${unit.rarity}
        ${selected ? 'ring-1 ring-primary/60' : ''}
      `}
      style={{
        borderRadius: '3px',
        background: selected
          ? 'linear-gradient(160deg, hsl(42 90% 52% / 0.08), hsl(224 16% 9%))'
          : 'hsl(224 16% 8%)',
        transition: 'all 0.2s ease',
        padding: '14px',
      }}
      onMouseEnter={e => {
        if (!selected) {
          (e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(160deg, hsl(42 90% 52% / 0.06), hsl(224 16% 9%))';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px hsl(0 0% 0% / 0.4), 0 0 0 1px hsl(42 90% 52% / 0.15)';
        }
      }}
      onMouseLeave={e => {
        if (!selected) {
          (e.currentTarget as HTMLDivElement).style.background = 'hsl(224 16% 8%)';
          (e.currentTarget as HTMLDivElement).style.transform = '';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '';
        }
      }}
    >
      {/* Декоративные угловые акценты */}
      <span className="absolute top-0 left-0 w-3 h-3 pointer-events-none" style={{
        borderTop: '1px solid hsl(42 90% 52% / 0.3)',
        borderLeft: '1px solid hsl(42 90% 52% / 0.3)',
      }} />
      <span className="absolute bottom-0 right-0 w-3 h-3 pointer-events-none" style={{
        borderBottom: '1px solid hsl(42 90% 52% / 0.3)',
        borderRight: '1px solid hsl(42 90% 52% / 0.3)',
      }} />

      {/* Шапка карточки */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          {/* Аватар */}
          <div className="w-10 h-10 flex-shrink-0 overflow-hidden" style={{
            borderRadius: '2px',
            border: '1px solid hsl(42 90% 52% / 0.2)',
            background: 'hsl(224 16% 11%)',
          }}>
            {unit.avatar_url ? (
              <img src={unit.avatar_url} alt={unit.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon name={combatIcon} size={18} style={{ color: iconColor }} fallback="Shield" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm leading-tight text-foreground"
                style={{ fontFamily: 'Cinzel, serif', fontWeight: 600, letterSpacing: '0.02em' }}>
                {unit.name}
              </h3>
              {(unit.stars ?? 0) > 0 && <StarRating value={unit.stars ?? 0} size={10} />}
            </div>
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.06em', color: iconColor, textTransform: 'uppercase' }}>
                {unit.class}
              </span>
              <span style={{ color: 'hsl(215 18% 35%)', fontSize: '0.55rem' }}>◆</span>
              <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.65rem', color: 'hsl(215 18% 48%)', letterSpacing: '0.04em' }}>
                {roles.join(' / ')}
              </span>
            </div>
          </div>
        </div>

        <RarityBadge rarity={unit.rarity} />
      </div>

      {!compact && unit.description && (
        <p className="text-xs mb-3 leading-relaxed line-clamp-2" style={{ color: 'hsl(215 18% 45%)' }}>
          {unit.description}
        </p>
      )}

      {/* Статы */}
      <div className="space-y-1.5">
        {CARD_STATS.map(({ key, label, max }) => (
          <StatBar key={key} label={label} value={unit.stats[key]} max={max} />
        ))}
      </div>

      {/* Футер */}
      <div className="flex justify-between items-center mt-3 pt-2.5" style={{
        borderTop: '1px solid hsl(42 90% 52% / 0.1)',
      }}>
        <div className="flex items-center gap-1" style={{ color: 'hsl(215 18% 45%)' }}>
          <Icon name="Users" size={10} />
          <span className="font-mono-data" style={{ fontSize: '0.65rem' }}>{unit.stats.troops}</span>
        </div>

        <div className="flex items-center gap-1" style={{ color: 'hsl(215 18% 45%)' }}>
          <Icon name={combatIcon} size={10} style={{ color: iconColor }} fallback="Sword" />
          <span className="font-mono-data" style={{ fontSize: '0.65rem', color: iconColor }}>
            {unit.class}
          </span>
        </div>

        <div className="flex items-center gap-1" style={{ color: 'hsl(215 18% 45%)' }}>
          <Icon name="Crown" size={10} />
          <span className="font-mono-data" style={{ fontSize: '0.65rem' }}>{unit.stats.leadership}</span>
        </div>
      </div>
    </div>
  );
}
