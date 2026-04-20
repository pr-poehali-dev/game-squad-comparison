import { useState } from 'react';
import { Unit, UnitRole } from '@/data/types';
import { CARD_STATS } from '@/data/statGroups';
import RarityBadge from './RarityBadge';
import StatBar from './StatBar';
import Icon from '@/components/ui/icon';
import StarRating from './StarRating';
import RoleTooltip from './RoleTooltip';

const CLASS_ICONS: Record<string, string> = {
  'Пехота': 'Sword',
  'Кавалерия': 'Zap',
  'Стрелки': 'Crosshair',
  'Осадные': 'Hammer',
};

const CLASS_HUE: Record<string, string> = {
  'Пехота':    '220 10% 60%',
  'Кавалерия': '42 76% 58%',
  'Стрелки':   '150 48% 50%',
  'Осадные':   '18 84% 58%',
};

const RARITY_HUE: Record<string, string> = {
  common:    '220 10% 60%',
  uncommon:  '150 48% 50%',
  rare:      '210 78% 58%',
  epic:      '282 58% 60%',
  legendary: '18 84% 58%',
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

export default function UnitCard({ unit, onClick, selected }: UnitCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);

  const roles = getRoles(unit.role);
  const combatIcon = CLASS_ICONS[unit.class] || 'Sword';
  const classHue = CLASS_HUE[unit.class] || '220 10% 60%';
  const rarityHue = RARITY_HUE[unit.rarity] || RARITY_HUE.common;
  const abilities = unit.abilities ?? [];
  const traits = unit.traits ?? [];

  const shellStyle: React.CSSProperties = {
    background:
      'linear-gradient(180deg, hsl(222 16% 12%) 0%, hsl(222 20% 7%) 100%)',
    border: selected
      ? `1.5px solid hsl(${rarityHue})`
      : `1px solid hsl(${rarityHue} / 0.35)`,
    borderRadius: '14px',
    boxShadow: selected
      ? `0 0 0 3px hsl(${rarityHue} / 0.2), 0 16px 32px hsl(222 40% 2% / 0.55), inset 0 1px 0 hsl(${rarityHue} / 0.2)`
      : hovered
      ? `0 14px 32px hsl(222 40% 2% / 0.55), 0 0 24px hsl(${rarityHue} / 0.15), inset 0 1px 0 hsl(${rarityHue} / 0.15)`
      : `0 6px 18px hsl(222 40% 2% / 0.45), inset 0 1px 0 hsl(${rarityHue} / 0.08)`,
    transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`card-flip-scene${flipped ? ' is-flipped' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          transform: hovered && !flipped ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div className="card-flip-inner">
          {/* ═════ ЛИЦО ═════ */}
          <div
            className="card-flip-front"
            style={{
              ...shellStyle,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative',
            }}
            onClick={onClick}
          >
            <div
              className="absolute top-0 left-0 right-0 h-[3px] z-10"
              style={{
                background: `linear-gradient(90deg, transparent, hsl(${rarityHue}) 20%, hsl(${rarityHue}) 80%, transparent)`,
                boxShadow: `0 0 12px hsl(${rarityHue} / 0.6)`,
              }}
            />

            <div
              className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg backdrop-blur-sm"
              style={{
                background: `linear-gradient(135deg, hsl(${classHue} / 0.2) 0%, hsl(222 18% 8% / 0.85) 100%)`,
                border: `1px solid hsl(${classHue} / 0.45)`,
                boxShadow: `inset 0 1px 0 hsl(${classHue} / 0.2)`,
              }}
            >
              <Icon name={combatIcon} size={11} style={{ color: `hsl(${classHue})` }} fallback="Shield" />
              <span
                className="uppercase"
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  color: `hsl(${classHue})`,
                }}
              >
                {unit.class}
              </span>
            </div>

            <div className="absolute top-3 right-3 z-10">
              <RarityBadge rarity={unit.rarity} />
            </div>

            <div
              className="relative overflow-hidden"
              style={{
                background:
                  `linear-gradient(180deg, hsl(${classHue} / 0.25) 0%, hsl(222 20% 8%) 100%)`,
                aspectRatio: '3/4',
              }}
            >
              {unit.avatar_url ? (
                <img
                  src={unit.avatar_url}
                  alt={unit.name}
                  className="w-full h-full object-cover object-top"
                  style={{
                    filter: hovered ? 'brightness(1.08) contrast(1.08) saturate(1.1)' : 'brightness(0.95) contrast(1.05)',
                    transition: 'transform 0.5s ease, filter 0.3s ease',
                    transform: hovered ? 'scale(1.06)' : 'scale(1)',
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon
                    name={combatIcon}
                    size={72}
                    style={{ color: `hsl(${classHue} / 0.25)` }}
                    fallback="Shield"
                  />
                </div>
              )}

              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse 90% 70% at 50% 40%, transparent 50%, hsl(222 22% 5% / 0.65) 100%)',
                }}
              />

              <div
                className="absolute inset-x-0 bottom-0 px-4 pt-12 pb-4"
                style={{
                  background:
                    'linear-gradient(to top, hsl(222 22% 5% / 0.98) 55%, transparent)',
                }}
              >
                <h3
                  className="truncate leading-tight mb-2"
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: 'hsl(38 24% 94%)',
                    textShadow: '0 2px 12px hsl(222 40% 2% / 0.7)',
                  }}
                >
                  {unit.name}
                </h3>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {(unit.stars ?? 0) > 0 && <StarRating value={unit.stars ?? 0} size={12} />}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {roles.map((role, i) => (
                      <RoleTooltip key={role} role={role} showDot={i > 0} size="sm" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Подвал: цифры всегда + статы разворачиваются при ховере */}
            <div
              style={{
                background:
                  'linear-gradient(180deg, hsl(222 16% 11%) 0%, hsl(222 18% 8%) 100%)',
                borderTop: `1px solid hsl(${rarityHue} / 0.3)`,
              }}
            >
              {/* Всегда видимые 4 числа */}
              <div className="grid grid-cols-4 px-3 py-3">
                <Pill icon="Users"  value={unit.stats.troops}          tint="42 76% 58%" />
                <Pill icon="Crown"  value={unit.stats.leadership}      tint="282 58% 65%" />
                <Pill icon="Sword"  value={unit.stats.slashingDamage}  tint="18 84% 58%" />
                <Pill icon="Shield" value={unit.stats.slashingDefense} tint="210 78% 60%" />
              </div>

              {/* Статы — плавно раскрываются при ховере */}
              <div
                style={{
                  overflow: 'hidden',
                  maxHeight: hovered && !flipped ? '220px' : '0px',
                  transition: 'max-height 0.3s cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                <div
                  className="px-4 pb-4 pt-1 space-y-2"
                  style={{
                    borderTop: `1px solid hsl(${rarityHue} / 0.2)`,
                  }}
                >
                  {CARD_STATS.map(({ key, label, max }) => (
                    <StatBar key={key} label={label} value={unit.stats[key]} max={max} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ═════ ОБОРОТ ═════ */}
          <div
            className="card-flip-back"
            style={{
              ...shellStyle,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              className="h-[3px]"
              style={{
                background: `linear-gradient(90deg, transparent, hsl(${rarityHue}) 20%, hsl(${rarityHue}) 80%, transparent)`,
                boxShadow: `0 0 12px hsl(${rarityHue} / 0.6)`,
              }}
            />

            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{
                background:
                  'linear-gradient(180deg, hsl(222 16% 12%) 0%, hsl(222 18% 9%) 100%)',
                borderBottom: '1px solid hsl(222 14% 18%)',
              }}
            >
              <h3
                className="truncate pr-2"
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'hsl(38 24% 92%)',
                }}
              >
                {unit.name}
              </h3>
              <div
                className="flex items-center gap-1.5 px-2 py-1 rounded-md"
                style={{
                  background: `hsl(${classHue} / 0.15)`,
                  border: `1px solid hsl(${classHue} / 0.4)`,
                }}
              >
                <Icon name={combatIcon} size={10} style={{ color: `hsl(${classHue})` }} fallback="Shield" />
                <span
                  className="uppercase"
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '0.58rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    color: `hsl(${classHue})`,
                  }}
                >
                  {unit.class}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-auto scrollbar-thin px-4 py-3">
              {unit.lore && (
                <div className="mb-4">
                  <SectionCap color={rarityHue}>Лор</SectionCap>
                  <p
                    className="italic leading-relaxed mt-2"
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '0.95rem',
                      color: 'hsl(222 10% 70%)',
                    }}
                  >
                    «{unit.lore}»
                  </p>
                </div>
              )}

              {abilities.length > 0 && (
                <div className="mb-4">
                  <SectionCap color={rarityHue}>Умения</SectionCap>
                  <div className="space-y-2.5 mt-2">
                    {abilities.map((ab, i) => {
                      const name = typeof ab === 'string' ? ab : ab.name;
                      const desc = typeof ab === 'string' ? null : ab.description;
                      return (
                        <div
                          key={i}
                          className="flex gap-3 p-2.5 rounded-lg"
                          style={{
                            background: 'hsl(222 16% 10%)',
                            border: '1px solid hsl(222 14% 18%)',
                          }}
                        >
                          <div
                            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md"
                            style={{
                              background:
                                'linear-gradient(135deg, hsl(42 76% 50% / 0.3), hsl(30 64% 36% / 0.15))',
                              border: '1px solid hsl(42 76% 58% / 0.5)',
                            }}
                          >
                            <Icon name="Flame" size={12} style={{ color: 'hsl(42 80% 68%)' }} />
                          </div>
                          <div className="min-w-0">
                            <div
                              style={{
                                fontFamily: 'Manrope, sans-serif',
                                fontSize: '0.86rem',
                                fontWeight: 700,
                                color: 'hsl(38 24% 90%)',
                              }}
                            >
                              {name}
                            </div>
                            {desc && (
                              <div
                                className="mt-1 leading-snug"
                                style={{
                                  fontFamily: 'Manrope, sans-serif',
                                  fontSize: '0.76rem',
                                  color: 'hsl(222 8% 60%)',
                                }}
                              >
                                {desc}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {traits.length > 0 && (
                <div>
                  <SectionCap color={rarityHue}>Черты</SectionCap>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {traits.map((t, i) => (
                      <span key={i} className="game-badge">
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {abilities.length === 0 && traits.length === 0 && !unit.lore && (
                <div className="flex-1 flex items-center justify-center py-10">
                  <span
                    className="italic"
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '0.95rem',
                      color: 'hsl(222 8% 50%)',
                    }}
                  >
                    Нет дополнительной информации.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setFlipped(f => !f)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all"
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: flipped ? 'hsl(42 76% 72%)' : 'hsl(222 10% 62%)',
          background: flipped
            ? 'linear-gradient(135deg, hsl(42 76% 50% / 0.16), hsl(42 76% 50% / 0.04))'
            : 'hsl(222 16% 11%)',
          border: flipped
            ? '1px solid hsl(42 76% 58% / 0.5)'
            : '1px solid hsl(222 14% 18%)',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          if (!flipped) {
            e.currentTarget.style.borderColor = 'hsl(42 76% 58% / 0.35)';
            e.currentTarget.style.color = 'hsl(42 76% 70%)';
          }
        }}
        onMouseLeave={e => {
          if (!flipped) {
            e.currentTarget.style.borderColor = 'hsl(222 14% 18%)';
            e.currentTarget.style.color = 'hsl(222 10% 62%)';
          }
        }}
      >
        <Icon name={flipped ? 'ArrowLeft' : 'ScrollText'} size={12} />
        {flipped ? 'К характеристикам' : 'Лор и умения'}
      </button>
    </div>
  );
}

/* ─── Мелкие компоненты ─── */

function Pill({ icon, value, tint }: { icon: string; value: number; tint: string }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <Icon name={icon} size={13} style={{ color: `hsl(${tint})` }} fallback="Circle" />
      <span
        className="font-mono-data"
        style={{ fontSize: '0.82rem', fontWeight: 600, color: 'hsl(38 20% 88%)' }}
      >
        {value}
      </span>
    </div>
  );
}

function SectionCap({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-1.5 h-1.5 rotate-45"
        style={{ background: `hsl(${color})` }}
      />
      <span
        className="uppercase"
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: '0.62rem',
          fontWeight: 700,
          letterSpacing: '0.2em',
          color: `hsl(${color})`,
        }}
      >
        {children}
      </span>
      <span
        className="flex-1 h-px"
        style={{
          background: `linear-gradient(90deg, hsl(${color} / 0.35), transparent)`,
        }}
      />
    </div>
  );
}