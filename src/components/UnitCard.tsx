import { useState } from 'react';
import { Unit, UnitRole } from '@/data/types';
import { CARD_STATS } from '@/data/statGroups';
import RarityBadge from './RarityBadge';
import StatBar from './StatBar';
import Icon from '@/components/ui/icon';
import StarRating from './StarRating';
import { useRoles } from '@/hooks/useAppData';

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

/* ── Тултип для роли ──────────────────────────────────────── */
function RoleTooltip({ role, description, showDot }: { role: string; description?: string; showDot: boolean }) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="inline-flex items-center gap-1">
      {showDot && (
        <span style={{ color: 'hsl(215 18% 30%)', fontSize: '0.5rem' }}>·</span>
      )}
      <span
        onMouseEnter={() => description && setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        style={{
          position: 'relative',
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: '0.6rem',
          color: 'hsl(215 18% 42%)',
          letterSpacing: '0.04em',
          cursor: description ? 'help' : 'default',
          borderBottom: description ? '1px dotted hsl(215 18% 35%)' : 'none',
          display: 'inline-block',
        }}
      >
        {role}
        {visible && description && (
          <span
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 6px)',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 999,
              width: '180px',
              padding: '7px 10px',
              background: 'hsl(224 16% 10%)',
              border: '1px solid hsl(42 90% 52% / 0.3)',
              borderRadius: '3px',
              boxShadow: '0 8px 24px hsl(0 0% 0% / 0.5)',
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '0.7rem',
              fontWeight: 400,
              lineHeight: 1.5,
              letterSpacing: '0.02em',
              color: 'hsl(38 15% 75%)',
              textTransform: 'none',
              pointerEvents: 'none',
              whiteSpace: 'normal',
            }}
          >
            {/* Стрелочка вниз */}
            <span style={{
              position: 'absolute',
              bottom: '-5px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid hsl(42 90% 52% / 0.3)',
            }} />
            <span style={{
              position: 'absolute',
              bottom: '-4px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: '4px solid hsl(224 16% 10%)',
            }} />
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', fontWeight: 600, color: 'hsl(42 90% 52%)', display: 'block', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {role}
            </span>
            {description}
          </span>
        )}
      </span>
    </span>
  );
}

interface UnitCardProps {
  unit: Unit;
  onClick: () => void;
  selected?: boolean;
  compact?: boolean;
}

export default function UnitCard({ unit, onClick, selected }: UnitCardProps) {
  const [flipped, setFlipped] = useState(false);
  const { roles: roleDefs } = useRoles();

  const roles      = getRoles(unit.role);
  const combatIcon = CLASS_ICONS[unit.class] || 'Sword';
  const iconColor  = CLASS_COLORS[unit.class] || 'hsl(215 18% 52%)';
  const bgGradient = CLASS_BG_GRADIENT[unit.class] || CLASS_BG_GRADIENT['Пехота'];
  const topColor   = RARITY_TOP_COLOR[unit.rarity] || RARITY_TOP_COLOR.common;
  const abilities  = unit.abilities ?? [];
  const traits     = unit.traits ?? [];

  const sharedBorderStyle = {
    borderRadius: '3px',
    background: selected
      ? 'linear-gradient(160deg, hsl(42 90% 52% / 0.08), hsl(224 16% 9%))'
      : 'hsl(224 16% 8%)',
    minHeight: '380px',
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>

      {/* Флип-сцена */}
      <div
        className={`card-flip-scene${flipped ? ' is-flipped' : ''}`}
        style={{ minHeight: '380px', borderRadius: '3px' }}
      >
        <div className="card-flip-inner">

          {/* ══ ЛИЦО ══════════════════════════════════════════ */}
          <div
            className={`card-flip-front border border-rarity-${unit.rarity}${selected ? ' ring-1 ring-primary/60' : ''}`}
            style={{ ...sharedBorderStyle, cursor: 'pointer', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            onClick={() => onClick()}
          >
            {/* Полоска редкости */}
            <div style={{ height: '2px', flexShrink: 0, background: `linear-gradient(90deg, transparent, ${topColor}, transparent)` }} />

            {/* Портрет */}
            <div className="relative flex-shrink-0 overflow-hidden" style={{ aspectRatio: '3/4', background: bgGradient, maxHeight: '52%' }}>
              {unit.avatar_url ? (
                <img src={unit.avatar_url} alt={unit.name} className="w-full h-full object-cover object-top"
                  style={{ filter: 'brightness(0.92) contrast(1.05)' }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon name={combatIcon} size={44} style={{ color: iconColor, opacity: 0.25 }} fallback="Shield" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
                style={{ background: 'linear-gradient(to top, hsl(224 16% 8%), transparent)' }} />
              <div className="absolute top-2 right-2"><RarityBadge rarity={unit.rarity} /></div>
              <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5"
                style={{ background: 'hsl(224 16% 7% / 0.85)', border: `1px solid ${iconColor}35`, borderRadius: '2px' }}>
                <Icon name={combatIcon} size={9} style={{ color: iconColor }} fallback="Shield" />
                <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.08em', color: iconColor, textTransform: 'uppercase' }}>
                  {unit.class}
                </span>
              </div>
            </div>

            {/* Нижняя часть */}
            <div className="flex flex-col flex-1 px-3 pt-2 pb-3">
              <h3 className="text-sm leading-tight text-foreground truncate mb-0.5"
                style={{ fontFamily: 'Cinzel, serif', fontWeight: 600, letterSpacing: '0.02em' }}>{unit.name}</h3>
              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                {(unit.stars ?? 0) > 0 && <StarRating value={unit.stars ?? 0} size={9} />}
                <div className="flex items-center gap-1 flex-wrap">
                  {roles.map((role, i) => {
                    const def = roleDefs.find(r => r.name === role);
                    return (
                      <RoleTooltip key={role} role={role} description={def?.description} showDot={i > 0} />
                    );
                  })}
                </div>
              </div>
              <div className="space-y-1.5 flex-1">
                {CARD_STATS.map(({ key, label, max }) => (
                  <StatBar key={key} label={label} value={unit.stats[key]} max={max} />
                ))}
              </div>
              <div className="flex justify-between items-center mt-2.5 pt-2"
                style={{ borderTop: '1px solid hsl(42 90% 52% / 0.1)' }}>
                <div className="flex items-center gap-1" style={{ color: 'hsl(215 18% 42%)' }}>
                  <Icon name="Users" size={10} />
                  <span className="font-mono-data" style={{ fontSize: '0.62rem' }}>{unit.stats.troops}</span>
                </div>
                <div className="flex items-center gap-1" style={{ color: 'hsl(215 18% 42%)' }}>
                  <Icon name="Crown" size={10} />
                  <span className="font-mono-data" style={{ fontSize: '0.62rem' }}>{unit.stats.leadership}</span>
                </div>
              </div>
            </div>

            {/* Углы */}
            <span className="absolute top-0 left-0 w-3 h-3 pointer-events-none"
              style={{ borderTop: `1px solid ${topColor}55`, borderLeft: `1px solid ${topColor}55` }} />
            <span className="absolute bottom-0 right-0 w-3 h-3 pointer-events-none"
              style={{ borderBottom: `1px solid ${topColor}55`, borderRight: `1px solid ${topColor}55` }} />
          </div>

          {/* ══ ОБОРОТ ════════════════════════════════════════ */}
          <div
            className={`card-flip-back border border-rarity-${unit.rarity}`}
            style={{ ...sharedBorderStyle, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            <div style={{ height: '2px', flexShrink: 0, background: `linear-gradient(90deg, transparent, ${topColor}, transparent)` }} />

            <div className="flex flex-col px-3 py-3 overflow-auto scrollbar-thin" style={{ flex: 1 }}>
              {/* Шапка */}
              <div className="flex items-center justify-between mb-3 pb-2 flex-shrink-0"
                style={{ borderBottom: '1px solid hsl(42 90% 52% / 0.12)' }}>
                <h3 className="text-xs text-foreground truncate pr-2"
                  style={{ fontFamily: 'Cinzel, serif', fontWeight: 600, letterSpacing: '0.02em' }}>{unit.name}</h3>
                <div className="flex items-center gap-1 flex-shrink-0 px-1.5 py-0.5"
                  style={{ background: `${iconColor}18`, border: `1px solid ${iconColor}35`, borderRadius: '2px' }}>
                  <Icon name={combatIcon} size={9} style={{ color: iconColor }} fallback="Shield" />
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.08em', color: iconColor, textTransform: 'uppercase' }}>
                    {unit.class}
                  </span>
                </div>
              </div>

              {/* Лор */}
              {unit.lore && (
                <div className="mb-3">
                  <p className="text-[10px] leading-relaxed italic" style={{ color: 'hsl(38 15% 45%)' }}>
                    «{unit.lore}»
                  </p>
                </div>
              )}

              {/* Умения */}
              {abilities.length > 0 && (
                <div className="mb-3">
                  <div className="mb-1.5" style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(42 90% 52% / 0.7)' }}>
                    Умения
                  </div>
                  <div className="space-y-2">
                    {abilities.map((ab, i) => {
                      const name = typeof ab === 'string' ? ab : ab.name;
                      const desc = typeof ab === 'string' ? null : ab.description;
                      return (
                        <div key={i} className="flex gap-2">
                          <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center mt-0.5"
                            style={{ background: 'hsl(42 90% 52% / 0.12)', border: '1px solid hsl(42 90% 52% / 0.3)', borderRadius: '2px' }}>
                            <Icon name="Zap" size={8} style={{ color: 'hsl(42 90% 55%)' }} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] font-semibold text-foreground leading-tight"
                              style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.03em' }}>{name}</div>
                            {desc && (
                              <div className="text-[9px] leading-relaxed mt-0.5" style={{ color: 'hsl(215 18% 42%)' }}>{desc}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Черты */}
              {traits.length > 0 && (
                <div>
                  <div className="mb-1.5" style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(42 90% 52% / 0.7)' }}>
                    Черты
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {traits.map((t, i) => (
                      <span key={i} style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.04em', padding: '1px 6px', background: 'hsl(224 16% 13%)', border: '1px solid hsl(224 16% 22%)', borderRadius: '2px', color: 'hsl(215 18% 55%)' }}>
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {abilities.length === 0 && traits.length === 0 && !unit.lore && (
                <div className="flex-1 flex items-center justify-center py-8">
                  <span style={{ fontSize: '0.7rem', color: 'hsl(215 18% 30%)', fontFamily: 'Rajdhani, sans-serif' }}>
                    Нет дополнительной информации
                  </span>
                </div>
              )}
            </div>

            {/* Углы */}
            <span className="absolute top-0 left-0 w-3 h-3 pointer-events-none"
              style={{ borderTop: `1px solid ${topColor}55`, borderLeft: `1px solid ${topColor}55` }} />
            <span className="absolute bottom-0 right-0 w-3 h-3 pointer-events-none"
              style={{ borderBottom: `1px solid ${topColor}55`, borderRight: `1px solid ${topColor}55` }} />
          </div>

        </div>
      </div>

      {/* Кнопка переворота */}
      <button
        onClick={() => setFlipped(f => !f)}
        style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: '0.6rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: flipped ? 'hsl(42 90% 52%)' : 'hsl(215 18% 35%)',
          background: flipped ? 'hsl(42 90% 52% / 0.08)' : 'transparent',
          border: `1px solid ${flipped ? 'hsl(42 90% 52% / 0.3)' : 'hsl(215 18% 16%)'}`,
          borderRadius: '2px',
          padding: '4px 0',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <Icon name="RefreshCw" size={9} />
        {flipped ? 'Характеристики' : 'Умения и лор'}
      </button>
    </div>
  );
}