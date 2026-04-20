import { useState } from 'react';
import { Unit, UnitRole } from '@/data/types';
import { CARD_STATS } from '@/data/statGroups';
import RarityBadge from './RarityBadge';
import StatBar from './StatBar';
import Icon from '@/components/ui/icon';
import StarRating from './StarRating';
import RoleTooltip from './RoleTooltip';

/* ─── Классы: иконка и тёплый оттенок, без магии/кислоты ─── */
const CLASS_ICONS: Record<string, string> = {
  Пехота: 'Sword',
  Кавалерия: 'Anvil',
  Стрелки: 'Crosshair',
  Осадные: 'Hammer',
};

const CLASS_INK: Record<string, string> = {
  Пехота: 'hsl(30 10% 54%)',      // сталь
  Кавалерия: 'hsl(28 42% 50%)',   // сёдельная кожа
  Стрелки: 'hsl(90 18% 44%)',     // охотничье сукно
  Осадные: 'hsl(14 48% 46%)',     // ржа
};

const CLASS_WASH: Record<string, string> = {
  Пехота:
    'linear-gradient(180deg, hsl(30 10% 22%) 0%, hsl(24 10% 10%) 100%)',
  Кавалерия:
    'linear-gradient(180deg, hsl(28 30% 22%) 0%, hsl(24 10% 10%) 100%)',
  Стрелки:
    'linear-gradient(180deg, hsl(90 14% 18%) 0%, hsl(24 10% 10%) 100%)',
  Осадные:
    'linear-gradient(180deg, hsl(14 30% 22%) 0%, hsl(24 10% 10%) 100%)',
};

const RARITY_SEAL: Record<string, string> = {
  common: 'hsl(30 10% 48%)',
  uncommon: 'hsl(70 22% 38%)',
  rare: 'hsl(198 30% 42%)',
  epic: 'hsl(280 20% 40%)',
  legendary: 'hsl(14 62% 44%)',
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
  const ink = CLASS_INK[unit.class] || 'hsl(30 10% 54%)';
  const wash = CLASS_WASH[unit.class] || CLASS_WASH['Пехота'];
  const sealColor = RARITY_SEAL[unit.rarity] || RARITY_SEAL.common;
  const abilities = unit.abilities ?? [];
  const traits = unit.traits ?? [];

  /* Единая оболочка карточки — «железный переплёт» */
  const shellStyle: React.CSSProperties = {
    background: 'hsl(22 10% 7%)',
    border: selected
      ? '1px solid hsl(18 62% 56%)'
      : '1px solid hsl(30 14% 18%)',
    boxShadow: selected
      ? '0 0 0 1px hsl(18 52% 42% / 0.4), 0 12px 28px hsl(0 0% 0% / 0.55), inset 0 1px 0 hsl(30 30% 28% / 0.2)'
      : '0 4px 14px hsl(0 0% 0% / 0.5), inset 0 1px 0 hsl(30 30% 24% / 0.18)',
    borderRadius: 0,
  };

  return (
    <div className="animate-fade-in flex flex-col gap-1.5 relative">
      {/* ─── Геральдические ромбы-заклёпки в углах внешней рамки ─── */}
      <span
        className="absolute -top-[3px] -left-[3px] w-[6px] h-[6px] rotate-45 z-10 pointer-events-none"
        style={{ background: sealColor }}
      />
      <span
        className="absolute -top-[3px] -right-[3px] w-[6px] h-[6px] rotate-45 z-10 pointer-events-none"
        style={{ background: sealColor }}
      />

      {/* ─── Флип-сцена ─── */}
      <div
        className={`card-flip-scene${flipped ? ' is-flipped' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="card-flip-inner">
          {/* ══════════ ЛИЦО — «гербовой листъ» ══════════ */}
          <div
            className="card-flip-front"
            style={{
              ...shellStyle,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative',
              transition: 'box-shadow 0.25s, border-color 0.25s',
            }}
            onClick={onClick}
          >
            {/* Клеймо ранга — сургучная печать в углу */}
            <div className="absolute top-2 right-2 z-10">
              <RarityBadge rarity={unit.rarity} />
            </div>

            {/* Клеймо класса — кованый ярлык */}
            <div
              className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-1"
              style={{
                background: 'hsl(22 10% 7% / 0.88)',
                border: `1px solid ${ink}`,
                boxShadow: 'inset 0 1px 0 hsl(30 30% 30% / 0.2)',
              }}
            >
              <Icon name={combatIcon} size={10} style={{ color: ink }} fallback="Shield" />
              <span
                className="uppercase"
                style={{
                  fontFamily: '"IM Fell English SC", serif',
                  fontSize: '0.58rem',
                  letterSpacing: '0.18em',
                  color: ink,
                }}
              >
                {unit.class}
              </span>
            </div>

            {/* Портрет — гравюрная сцена */}
            <div
              className="relative overflow-hidden"
              style={{ background: wash, aspectRatio: '3/4' }}
            >
              {unit.avatar_url ? (
                <img
                  src={unit.avatar_url}
                  alt={unit.name}
                  className="w-full h-full object-cover object-top"
                  style={{
                    filter:
                      'sepia(0.25) saturate(0.85) brightness(0.88) contrast(1.1)',
                    transition: 'transform 0.5s ease, filter 0.3s ease',
                    transform: hovered ? 'scale(1.04)' : 'scale(1)',
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon
                    name={combatIcon}
                    size={64}
                    style={{ color: ink, opacity: 0.22 }}
                    fallback="Shield"
                  />
                </div>
              )}

              {/* Виньет: тени по краям, как на старой гравюре */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse 90% 70% at 50% 50%, transparent 55%, hsl(22 10% 4% / 0.55) 100%)',
                }}
              />

              {/* Нижняя полоса-лента с именем — пергаментная плашка */}
              <div
                className="absolute inset-x-0 bottom-0 px-3.5 pt-10 pb-3.5"
                style={{
                  background:
                    'linear-gradient(to top, hsl(22 10% 6% / 0.98) 55%, transparent)',
                }}
              >
                <h3
                  className="truncate leading-tight"
                  style={{
                    fontFamily: '"IM Fell English SC", serif',
                    fontSize: '1.05rem',
                    fontWeight: 400,
                    letterSpacing: '0.06em',
                    color: 'hsl(40 38% 90%)',
                    textShadow: '0 2px 0 hsl(0 0% 0% / 0.6)',
                  }}
                >
                  {unit.name}
                </h3>

                <div className="flex items-center gap-2 flex-wrap mt-1">
                  {(unit.stars ?? 0) > 0 && <StarRating value={unit.stars ?? 0} size={10} />}
                  {roles.map((role, i) => (
                    <RoleTooltip key={role} role={role} showDot={i > 0} size="sm" />
                  ))}
                </div>
              </div>
            </div>

            {/* Подвал — медные пломбы с числами (всегда видны) */}
            <div
              className="flex items-center justify-between px-3 py-2"
              style={{
                background:
                  'linear-gradient(180deg, hsl(26 12% 11%) 0%, hsl(22 10% 8%) 100%)',
                borderTop: `1px solid ${sealColor}55`,
              }}
            >
              <Pill icon="Users" value={unit.stats.troops} />
              <Pill icon="Crown" value={unit.stats.leadership} />
              <Pill icon="Sword" value={unit.stats.slashingDamage} />
              <Pill icon="Shield" value={unit.stats.slashingDefense} />
            </div>

            {/* Парящие статы при ховере — пергаментный свиток */}
            <div
              className="absolute left-2 right-2 bottom-[52px] p-3 pointer-events-none"
              style={{
                background:
                  'linear-gradient(180deg, hsl(38 22% 80%) 0%, hsl(34 24% 72%) 100%)',
                border: '1px solid hsl(20 40% 26%)',
                boxShadow:
                  '0 6px 18px hsl(0 0% 0% / 0.6), inset 0 1px 0 hsl(40 30% 94% / 0.5)',
                opacity: hovered && !flipped ? 1 : 0,
                transform: hovered && !flipped ? 'translateY(0)' : 'translateY(10px)',
                transition: 'opacity 0.22s ease, transform 0.22s ease',
              }}
            >
              <div
                className="uppercase mb-2"
                style={{
                  fontFamily: '"IM Fell English SC", serif',
                  fontSize: '0.58rem',
                  letterSpacing: '0.28em',
                  color: 'hsl(20 40% 28%)',
                  textAlign: 'center',
                  borderBottom: '1px solid hsl(20 40% 28% / 0.4)',
                  paddingBottom: '4px',
                }}
              >
                Выпись ротная
              </div>
              <div className="space-y-1.5">
                {CARD_STATS.map(({ key, label, max }) => (
                  <StatBar key={key} label={label} value={unit.stats[key]} max={max} />
                ))}
              </div>
            </div>
          </div>

          {/* ══════════ ОБОРОТ — «внутреннiй разделъ» ══════════ */}
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
              className="px-4 py-3 flex items-center justify-between"
              style={{
                background:
                  'linear-gradient(180deg, hsl(26 12% 11%) 0%, hsl(22 10% 8%) 100%)',
                borderBottom: `1px solid ${sealColor}55`,
              }}
            >
              <h3
                className="truncate pr-2"
                style={{
                  fontFamily: '"IM Fell English SC", serif',
                  fontSize: '0.95rem',
                  letterSpacing: '0.06em',
                  color: 'hsl(40 38% 88%)',
                }}
              >
                {unit.name}
              </h3>
              <div
                className="flex items-center gap-1 px-1.5 py-0.5 flex-shrink-0"
                style={{
                  background: `${ink}22`,
                  border: `1px solid ${ink}66`,
                }}
              >
                <Icon name={combatIcon} size={10} style={{ color: ink }} fallback="Shield" />
                <span
                  className="uppercase"
                  style={{
                    fontFamily: '"IM Fell English SC", serif',
                    fontSize: '0.55rem',
                    letterSpacing: '0.18em',
                    color: ink,
                  }}
                >
                  {unit.class}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-auto scrollbar-thin px-4 py-3">
              {unit.lore && (
                <div className="mb-3">
                  <SectionCap>Лѣтопись</SectionCap>
                  <p
                    className="italic leading-relaxed mt-1"
                    style={{
                      fontFamily: '"IM Fell English", serif',
                      fontSize: '0.82rem',
                      color: 'hsl(30 18% 64%)',
                    }}
                  >
                    «{unit.lore}»
                  </p>
                </div>
              )}

              {abilities.length > 0 && (
                <div className="mb-3">
                  <SectionCap>Искусства</SectionCap>
                  <div className="space-y-2 mt-1">
                    {abilities.map((ab, i) => {
                      const name = typeof ab === 'string' ? ab : ab.name;
                      const desc = typeof ab === 'string' ? null : ab.description;
                      return (
                        <div key={i} className="flex gap-2">
                          <div
                            className="flex-shrink-0 w-4 h-4 mt-0.5 flex items-center justify-center rotate-45"
                            style={{
                              background: 'hsl(18 52% 42% / 0.2)',
                              border: '1px solid hsl(18 52% 48%)',
                            }}
                          >
                            <Icon
                              name="Flame"
                              size={8}
                              className="-rotate-45"
                              style={{ color: 'hsl(18 62% 58%)' }}
                            />
                          </div>
                          <div className="min-w-0">
                            <div
                              className="leading-tight"
                              style={{
                                fontFamily: '"IM Fell English", serif',
                                fontSize: '0.82rem',
                                color: 'hsl(40 30% 82%)',
                                fontWeight: 500,
                              }}
                            >
                              {name}
                            </div>
                            {desc && (
                              <div
                                className="italic leading-snug mt-0.5"
                                style={{
                                  fontFamily: '"IM Fell English", serif',
                                  fontSize: '0.72rem',
                                  color: 'hsl(30 14% 52%)',
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
                  <SectionCap>Знаки ротные</SectionCap>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {traits.map((t, i) => (
                      <span
                        key={i}
                        className="game-badge"
                        style={{ fontSize: '0.65rem' }}
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {abilities.length === 0 && traits.length === 0 && !unit.lore && (
                <div className="flex-1 flex items-center justify-center py-8">
                  <span
                    className="italic"
                    style={{
                      fontFamily: '"IM Fell English", serif',
                      fontSize: '0.82rem',
                      color: 'hsl(30 14% 45%)',
                    }}
                  >
                    Записей более не имѣется.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка переворота — «оборотъ листа» */}
      <button
        onClick={() => setFlipped(f => !f)}
        className="w-full flex items-center justify-center gap-2 py-2 transition-all"
        style={{
          fontFamily: '"IM Fell English SC", serif',
          fontSize: '0.68rem',
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: flipped ? 'hsl(18 62% 58%)' : 'hsl(30 12% 52%)',
          background: flipped ? 'hsl(18 52% 42% / 0.12)' : 'hsl(22 10% 8%)',
          border: flipped
            ? '1px solid hsl(18 52% 48%)'
            : '1px solid hsl(30 14% 18%)',
          cursor: 'pointer',
        }}
      >
        <Icon name={flipped ? 'ArrowLeft' : 'ScrollText'} size={11} />
        {flipped ? 'къ лицу' : 'внутренiй листъ'}
      </button>
    </div>
  );
}

/* ─── Маленькие компоненты ─── */

function Pill({ icon, value }: { icon: string; value: number }) {
  return (
    <div
      className="flex items-center gap-1"
      style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.68rem',
        color: 'hsl(30 18% 62%)',
      }}
    >
      <Icon name={icon} size={11} style={{ color: 'hsl(18 52% 48%)' }} fallback="Circle" />
      <span>{value}</span>
    </div>
  );
}

function SectionCap({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="uppercase"
      style={{
        fontFamily: '"IM Fell English SC", serif',
        fontSize: '0.58rem',
        letterSpacing: '0.28em',
        color: 'hsl(18 52% 52%)',
      }}
    >
      {children}
    </div>
  );
}
