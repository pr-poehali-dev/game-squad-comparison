import { useState } from 'react';
import { Unit, UnitRole } from '@/data/types';
import { CARD_STATS } from '@/data/statGroups';
import RarityBadge from './RarityBadge';
import StatBar from './StatBar';
import Icon from '@/components/ui/icon';
import StarRating from './StarRating';

const CLASS_ICONS: Record<string, string> = {
  'Пехота':    'Sword',
  'Кавалерия': 'Zap',
  'Стрелки':   'Crosshair',
  'Осадные':   'Hammer',
};

const CLASS_COLORS: Record<string, string> = {
  'Пехота':    'hsl(215 18% 52%)',
  'Кавалерия': 'hsl(38 80% 52%)',
  'Стрелки':   'hsl(148 52% 44%)',
  'Осадные':   'hsl(18 80% 50%)',
};

/* Цвет подложки за портретом — по классу */
const CLASS_BG_GRADIENT: Record<string, string> = {
  'Пехота':    'linear-gradient(180deg, hsl(215 18% 14%) 0%, hsl(224 16% 8%) 100%)',
  'Кавалерия': 'linear-gradient(180deg, hsl(38 40% 12%) 0%, hsl(224 16% 8%) 100%)',
  'Стрелки':   'linear-gradient(180deg, hsl(148 30% 10%) 0%, hsl(224 16% 8%) 100%)',
  'Осадные':   'linear-gradient(180deg, hsl(18 35% 12%) 0%, hsl(224 16% 8%) 100%)',
};

const RARITY_TOP_COLOR: Record<string, string> = {
  common:    'hsl(215 18% 52%)',
  uncommon:  'hsl(148 52% 44%)',
  rare:      'hsl(210 88% 58%)',
  epic:      'hsl(272 68% 62%)',
  legendary: 'hsl(42 90% 52%)',
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

/* ── Лицевая сторона ──────────────────────────────────────── */
function CardFront({ unit, selected }: { unit: UnitCardProps['unit']; selected?: boolean }) {
  const roles = getRoles(unit.role);
  const combatIcon = CLASS_ICONS[unit.class] || 'Sword';
  const iconColor  = CLASS_COLORS[unit.class] || 'hsl(215 18% 52%)';
  const bgGradient = CLASS_BG_GRADIENT[unit.class] || CLASS_BG_GRADIENT['Пехота'];
  const topColor   = RARITY_TOP_COLOR[unit.rarity] || RARITY_TOP_COLOR.common;

  return (
    <div className="absolute inset-0 flex flex-col" style={{ backfaceVisibility: 'hidden' }}>
      {/* Полоска редкости сверху */}
      <div className="h-0.5 w-full flex-shrink-0" style={{
        background: `linear-gradient(90deg, transparent, ${topColor}, transparent)`,
      }} />

      {/* Портрет 3:4 */}
      <div className="relative flex-shrink-0 overflow-hidden" style={{
        aspectRatio: '3/4',
        background: bgGradient,
        maxHeight: '55%',
      }}>
        {unit.avatar_url ? (
          <img
            src={unit.avatar_url}
            alt={unit.name}
            className="w-full h-full object-cover object-top"
            style={{ filter: 'brightness(0.92) contrast(1.05)' }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <Icon name={combatIcon} size={40} style={{ color: iconColor, opacity: 0.35 }} fallback="Shield" />
          </div>
        )}

        {/* Градиент-фейд снизу портрета */}
        <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none" style={{
          background: 'linear-gradient(to top, hsl(224 16% 8%), transparent)',
        }} />

        {/* Бейдж редкости — поверх портрета, верхний правый угол */}
        <div className="absolute top-2 right-2">
          <RarityBadge rarity={unit.rarity} />
        </div>

        {/* Иконка класса — нижний левый угол портрета */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-1.5 py-0.5 rounded-sm" style={{
          background: 'hsl(224 16% 7% / 0.85)',
          border: `1px solid ${iconColor}30`,
          backdropFilter: 'blur(4px)',
        }}>
          <Icon name={combatIcon} size={10} style={{ color: iconColor }} fallback="Shield" />
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', color: iconColor, textTransform: 'uppercase' }}>
            {unit.class}
          </span>
        </div>
      </div>

      {/* Нижняя часть карточки */}
      <div className="flex-1 flex flex-col px-3 pt-2 pb-3 min-h-0">
        {/* Название + звёзды */}
        <div className="mb-1.5">
          <h3 className="text-sm leading-tight text-foreground truncate"
            style={{ fontFamily: 'Cinzel, serif', fontWeight: 600, letterSpacing: '0.02em' }}>
            {unit.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {(unit.stars ?? 0) > 0 && <StarRating value={unit.stars ?? 0} size={9} />}
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.6rem', color: 'hsl(215 18% 42%)', letterSpacing: '0.04em' }}>
              {roles.join(' / ')}
            </span>
          </div>
        </div>

        {/* Статы */}
        <div className="space-y-1.5 flex-1">
          {CARD_STATS.map(({ key, label, max }) => (
            <StatBar key={key} label={label} value={unit.stats[key]} max={max} />
          ))}
        </div>

        {/* Футер */}
        <div className="flex justify-between items-center mt-2.5 pt-2" style={{
          borderTop: '1px solid hsl(42 90% 52% / 0.1)',
        }}>
          <div className="flex items-center gap-1" style={{ color: 'hsl(215 18% 42%)' }}>
            <Icon name="Users" size={10} />
            <span className="font-mono-data" style={{ fontSize: '0.62rem' }}>{unit.stats.troops}</span>
          </div>
          <div className="flex items-center gap-1" style={{ color: 'hsl(215 18% 42%)' }}>
            <Icon name="Crown" size={10} />
            <span className="font-mono-data" style={{ fontSize: '0.62rem' }}>{unit.stats.leadership}</span>
          </div>

          {/* Подсказка о flip */}
          <div className="flex items-center gap-1" style={{ color: 'hsl(215 18% 32%)' }}>
            <Icon name="RefreshCw" size={9} />
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.55rem', letterSpacing: '0.06em' }}>
              ДЕТАЛИ
            </span>
          </div>
        </div>
      </div>

      {/* Угловые акценты */}
      <span className="absolute top-0 left-0 w-3 h-3 pointer-events-none" style={{
        borderTop: `1px solid ${topColor}50`,
        borderLeft: `1px solid ${topColor}50`,
      }} />
      <span className="absolute bottom-0 right-0 w-3 h-3 pointer-events-none" style={{
        borderBottom: `1px solid ${topColor}50`,
        borderRight: `1px solid ${topColor}50`,
      }} />
    </div>
  );
}

/* ── Обратная сторона ─────────────────────────────────────── */
function CardBack({ unit }: { unit: UnitCardProps['unit'] }) {
  const topColor   = RARITY_TOP_COLOR[unit.rarity] || RARITY_TOP_COLOR.common;
  const iconColor  = CLASS_COLORS[unit.class] || 'hsl(215 18% 52%)';
  const combatIcon = CLASS_ICONS[unit.class] || 'Sword';

  const abilities = unit.abilities ?? [];
  const traits    = unit.traits ?? [];

  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden"
      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
    >
      {/* Полоска редкости сверху */}
      <div className="h-0.5 w-full flex-shrink-0" style={{
        background: `linear-gradient(90deg, transparent, ${topColor}, transparent)`,
      }} />

      <div className="flex-1 flex flex-col px-3 py-2.5 overflow-hidden min-h-0">
        {/* Шапка оборота */}
        <div className="flex items-center justify-between mb-2 pb-2 flex-shrink-0" style={{
          borderBottom: '1px solid hsl(42 90% 52% / 0.12)',
        }}>
          <h3 className="text-xs leading-tight text-foreground truncate pr-2"
            style={{ fontFamily: 'Cinzel, serif', fontWeight: 600, letterSpacing: '0.02em' }}>
            {unit.name}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0 px-1.5 py-0.5 rounded-sm" style={{
            background: `${iconColor}18`,
            border: `1px solid ${iconColor}30`,
          }}>
            <Icon name={combatIcon} size={9} style={{ color: iconColor }} fallback="Shield" />
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.08em', color: iconColor, textTransform: 'uppercase' }}>
              {unit.class}
            </span>
          </div>
        </div>

        {/* Лор */}
        {unit.lore && (
          <div className="mb-2 flex-shrink-0">
            <p className="text-[10px] leading-relaxed italic line-clamp-2" style={{ color: 'hsl(38 15% 45%)' }}>
              «{unit.lore}»
            </p>
          </div>
        )}

        {/* Умения */}
        {abilities.length > 0 && (
          <div className="mb-2 flex-shrink-0">
            <div className="section-title mb-1.5" style={{ fontSize: '0.55rem' }}>Умения</div>
            <div className="space-y-1.5">
              {abilities.slice(0, 3).map((ab, i) => {
                const name = typeof ab === 'string' ? ab : ab.name;
                const desc = typeof ab === 'string' ? null : ab.description;
                return (
                  <div key={i} className="flex gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-sm flex-shrink-0 flex items-center justify-center mt-0.5" style={{
                      background: 'hsl(42 90% 52% / 0.12)',
                      border: '1px solid hsl(42 90% 52% / 0.25)',
                    }}>
                      <Icon name="Zap" size={7} style={{ color: 'hsl(42 90% 55%)' }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold text-foreground leading-tight" style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.03em' }}>
                        {name}
                      </div>
                      {desc && (
                        <div className="text-[9px] leading-relaxed line-clamp-2 mt-0.5" style={{ color: 'hsl(215 18% 42%)' }}>
                          {desc}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {abilities.length > 3 && (
                <div className="text-[9px]" style={{ color: 'hsl(215 18% 35%)' }}>
                  +{abilities.length - 3} ещё...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Черты */}
        {traits.length > 0 && (
          <div className="flex-shrink-0">
            <div className="section-title mb-1.5" style={{ fontSize: '0.55rem' }}>Черты</div>
            <div className="flex flex-wrap gap-1">
              {traits.slice(0, 4).map((t, i) => (
                <span key={i} className="text-[9px] px-1.5 py-0.5" style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  background: 'hsl(224 16% 13%)',
                  border: '1px solid hsl(224 16% 20%)',
                  borderRadius: '2px',
                  color: 'hsl(215 18% 55%)',
                }}>
                  {t.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Пустая оборотная сторона */}
        {abilities.length === 0 && traits.length === 0 && !unit.lore && (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-[10px] text-center" style={{ color: 'hsl(215 18% 30%)' }}>
              Нет доп. информации
            </span>
          </div>
        )}
      </div>

      {/* Подсказка */}
      <div className="flex-shrink-0 px-3 pb-2.5 flex items-center justify-center gap-1" style={{ color: 'hsl(215 18% 28%)' }}>
        <Icon name="RefreshCw" size={8} />
        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.5rem', letterSpacing: '0.06em' }}>
          ВЕРНУТЬ
        </span>
      </div>

      {/* Угловые акценты */}
      <span className="absolute top-0 left-0 w-3 h-3 pointer-events-none" style={{
        borderTop: `1px solid ${topColor}50`,
        borderLeft: `1px solid ${topColor}50`,
      }} />
      <span className="absolute bottom-0 right-0 w-3 h-3 pointer-events-none" style={{
        borderBottom: `1px solid ${topColor}50`,
        borderRight: `1px solid ${topColor}50`,
      }} />
    </div>
  );
}

/* ── Основной компонент с 3D-флипом ───────────────────────── */
export default function UnitCard({ unit, onClick, selected }: UnitCardProps) {
  const [flipped, setFlipped] = useState(false);
  const topColor = RARITY_TOP_COLOR[unit.rarity] || RARITY_TOP_COLOR.common;

  const handleClick = () => {
    if (flipped) {
      setFlipped(false);
    } else {
      onClick();
    }
  };

  return (
    <div
      style={{ perspective: '1000px', cursor: 'pointer' }}
      className="animate-fade-in"
    >
      {/* Контейнер флипа */}
      <div
        style={{
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          borderRadius: '3px',
        }}
        onClick={handleClick}
        onContextMenu={e => { e.preventDefault(); setFlipped(f => !f); }}
      >
        {/* Внешняя обёртка задаёт высоту — лицевая сторона определяет размер */}
        <div
          className={`border border-rarity-${unit.rarity} ${selected ? 'ring-1 ring-primary/60' : ''}`}
          style={{
            borderRadius: '3px',
            background: selected
              ? 'linear-gradient(160deg, hsl(42 90% 52% / 0.08), hsl(224 16% 9%))'
              : 'hsl(224 16% 8%)',
            minHeight: '380px',
            position: 'relative',
            boxShadow: selected
              ? `0 0 20px ${topColor}25`
              : undefined,
            transition: 'box-shadow 0.2s',
          }}
          onMouseEnter={e => {
            if (!selected && !flipped) {
              (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 28px hsl(0 0% 0% / 0.5), 0 0 0 1px ${topColor}30`;
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={e => {
            if (!selected) {
              (e.currentTarget as HTMLDivElement).style.boxShadow = '';
              (e.currentTarget as HTMLDivElement).style.transform = '';
            }
          }}
        >
          <CardFront unit={unit} selected={selected} />
          <CardBack unit={unit} />
        </div>
      </div>

      {/* Кнопка флипа — вне зоны onClick карточки */}
      <button
        onClick={e => { e.stopPropagation(); setFlipped(f => !f); }}
        className="mt-1.5 w-full flex items-center justify-center gap-1 py-1 rounded-sm transition-all"
        style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: '0.6rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: flipped ? 'hsl(42 90% 52%)' : 'hsl(215 18% 32%)',
          background: flipped ? 'hsl(42 90% 52% / 0.08)' : 'transparent',
          border: `1px solid ${flipped ? 'hsl(42 90% 52% / 0.3)' : 'hsl(215 18% 18%)'}`,
        }}
      >
        <Icon name="RefreshCw" size={9} />
        {flipped ? 'Характеристики' : 'Умения и лор'}
      </button>
    </div>
  );
}
