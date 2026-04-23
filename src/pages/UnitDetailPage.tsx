import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUnits, useTreaties, useFormations } from '@/hooks/useAppData';
import { STAT_GROUPS } from '@/data/statGroups';
import { UnitStats, Ability, Trait, UnitRole, GuideBlock, Formation } from '@/data/types';
import StarRating from '@/components/StarRating';
import StatBar from '@/components/StatBar';
import RarityBadge from '@/components/RarityBadge';
import Icon from '@/components/ui/icon';
import RoleTooltip from '@/components/RoleTooltip';

const CLASS_ICONS: Record<string, string> = {
  'Пехота': 'Sword', 'Кавалерия': 'Zap', 'Стрелки': 'Crosshair', 'Осадные': 'Hammer',
};

const STAT_LABEL_MAP: Partial<Record<keyof UnitStats, string>> = {
  health: 'Здоровье', troops: 'Численность', leadership: 'Лидерство',
  moveSpeed: 'Скорость', rangeDistance: 'Дальность', ammo: 'Боезапас', morale: 'Работосп.',
  piercingPenetration: 'Проб. (прон.)', slashingPenetration: 'Проб. (руб.)', bluntPenetration: 'Проб. (дроб.)',
  piercingDamage: 'Прон. урон', slashingDamage: 'Руб. урон', bluntDamage: 'Дроб. урон',
  piercingDefense: 'Защ. (прон.)', slashingDefense: 'Защ. (руб.)', bluntDefense: 'Защ. (дроб.)',
  block: 'Блок', blockRecovery: 'Восст. блока',
};

function getRoles(role: UnitRole | UnitRole[]): UnitRole[] {
  return Array.isArray(role) ? role : [role];
}

function getAbilityObj(ab: string | Ability): Ability | null {
  if (typeof ab === 'string') return null;
  return ab;
}

function getAbilityName(ab: string | Ability): string {
  return typeof ab === 'string' ? ab : ab.name;
}

// ── Тултип умения ──
function AbilityTooltip({ ability }: { ability: Ability }) {
  const hasModifiers =
    (ability.statModifiers != null && Object.keys(ability.statModifiers).length > 0) ||
    (ability.statModifiersEx != null && Object.keys(ability.statModifiersEx).length > 0);
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 bg-card border border-border rounded-sm p-3 shadow-xl pointer-events-none">
      <div className="text-xs font-semibold text-foreground mb-1">{ability.name}</div>
      {ability.description && (
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">{ability.description}</p>
      )}
      {hasModifiers && (
        <div className="flex flex-wrap gap-1 border-t border-border pt-2">
          {Object.entries(ability.statModifiers || {}).map(([stat, val]) => (
            <span key={stat} className={`font-mono-data text-[10px] px-1.5 py-0.5 rounded-sm ${(val || 0) > 0 ? 'bg-blue-900/30 text-blue-400' : 'bg-orange-900/30 text-orange-400'}`}>
              {STAT_LABEL_MAP[stat as keyof UnitStats] ?? stat}: {(val || 0) > 0 ? '+' : ''}{val}
            </span>
          ))}
          {Object.entries(ability.statModifiersEx || {}).map(([stat, entry]) => (
            <span key={`ex-${stat}`} className={`font-mono-data text-[10px] px-1.5 py-0.5 rounded-sm ${entry.value > 0 ? 'bg-blue-900/30 text-blue-400' : 'bg-orange-900/30 text-orange-400'}`}>
              {STAT_LABEL_MAP[stat as keyof UnitStats] ?? stat}: {entry.value > 0 ? '+' : ''}{entry.value}%
            </span>
          ))}
        </div>
      )}
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border" />
    </div>
  );
}

function AbilityTag({ ab }: { ab: string | Ability }) {
  const [show, setShow] = useState(false);
  const obj = getAbilityObj(ab);
  const name = getAbilityName(ab);
  const hasModifiers = obj && (
    (obj.statModifiers != null && Object.keys(obj.statModifiers).length > 0) ||
    (obj.statModifiersEx != null && Object.keys(obj.statModifiersEx).length > 0)
  );
  const hasInfo = obj && (obj.description || hasModifiers);

  return (
    <div className="relative inline-block">
      <span
        onMouseEnter={() => hasInfo && setShow(true)}
        onMouseLeave={() => setShow(false)}
        className={`inline-flex items-center gap-1.5 border rounded-sm px-3 py-1.5 text-xs transition-colors select-none
          ${hasModifiers ? 'bg-blue-950/40 border-blue-500/40 text-blue-300 cursor-help'
            : hasInfo ? 'bg-muted border-border text-foreground cursor-help'
            : 'bg-muted border-border text-foreground'}`}
      >
        {hasModifiers && <Icon name="Zap" size={10} className="text-blue-400" />}
        {name}
        {hasInfo && <Icon name="Info" size={10} className="text-muted-foreground opacity-60" />}
      </span>
      {show && hasInfo && obj && <AbilityTooltip ability={obj} />}
    </div>
  );
}

// ── Тултип особенности (trait) ──
const TRAIT_STYLES: Record<string, string> = {
  green: 'bg-green-950/40 border-green-600/40 text-green-300',
  gray:  'bg-muted border-border text-muted-foreground',
  red:   'bg-red-950/40 border-red-600/40 text-red-300',
};

function TraitTooltip({ trait }: { trait: Trait }) {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-52 bg-card border border-border rounded-sm p-3 shadow-xl pointer-events-none">
      <div className="text-xs font-semibold text-foreground mb-1">{trait.name}</div>
      {trait.description && (
        <p className="text-[11px] text-muted-foreground leading-relaxed">{trait.description}</p>
      )}
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border" />
    </div>
  );
}

function TraitTag({ trait }: { trait: Trait }) {
  const [show, setShow] = useState(false);
  const color = trait.color || 'gray';
  const hasDesc = !!trait.description;

  return (
    <div className="relative inline-block">
      <span
        onMouseEnter={() => hasDesc && setShow(true)}
        onMouseLeave={() => setShow(false)}
        className={`inline-flex items-center gap-1.5 border rounded-sm px-3 py-1.5 text-xs font-medium transition-colors select-none ${TRAIT_STYLES[color]} ${hasDesc ? 'cursor-help' : ''}`}
      >
        {color === 'green' && <Icon name="TrendingUp" size={10} />}
        {color === 'red' && <Icon name="TrendingDown" size={10} />}
        {trait.name}
        {hasDesc && <Icon name="Info" size={10} className="opacity-50" />}
      </span>
      {show && hasDesc && <TraitTooltip trait={trait} />}
    </div>
  );
}

// ── Тег построения с тултипом (портал) ──
function FormationTag({ formation }: { formation: Formation }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
  }, [visible]);

  return (
    <>
      <div
        ref={ref}
        onMouseEnter={() => formation.description && setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="flex items-center gap-2 px-3 py-2 rounded-sm border border-border bg-muted/40 cursor-help transition-colors hover:border-primary/40"
      >
        {formation.avatar_url && (
          <img src={formation.avatar_url} alt={formation.name}
            className="w-8 h-8 rounded-sm object-cover flex-shrink-0 border border-border" />
        )}
        <div>
          <div className="text-xs font-semibold text-foreground" style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.04em' }}>
            {formation.name}
          </div>
          {formation.description && (
            <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <Icon name="Info" size={9} className="opacity-60" />
              <span>Наведи для описания</span>
            </div>
          )}
        </div>
      </div>
      {visible && formation.description && createPortal(
        <div style={{
          position: 'fixed', left: pos.x, top: pos.y,
          transform: 'translate(-50%, -100%)',
          zIndex: 9999, width: '240px', padding: '10px 14px',
          background: 'hsl(224 20% 9%)',
          border: '1px solid hsl(42 90% 52% / 0.35)',
          borderRadius: '3px',
          boxShadow: '0 12px 32px hsl(0 0% 0% / 0.6)',
          pointerEvents: 'none',
        }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', fontWeight: 600, color: 'hsl(42 90% 52%)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
            {formation.name}
          </div>
          <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.8rem', lineHeight: 1.55, color: 'hsl(38 15% 72%)' }}>
            {formation.description}
          </div>
          <div style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid hsl(42 90% 52% / 0.35)' }} />
          <div style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid hsl(224 20% 9%)' }} />
        </div>,
        document.body
      )}
    </>
  );
}

// ── Секция руководства ──
function GuideSection({ title, icon, blocks }: { title: string; icon: string; blocks: GuideBlock[] }) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <div className="bg-card border border-border rounded-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
        <Icon name={icon} size={14} className="text-primary" />
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest">{title}</h2>
      </div>
      <div className="p-5 space-y-4">
        {blocks.map((block, i) => (
          block.type === 'image' ? (
            <div key={i} className="rounded-sm overflow-hidden border border-border">
              <img
                src={block.content}
                alt=""
                className="w-full object-cover max-h-80"
                style={{ display: 'block' }}
              />
            </div>
          ) : (
            <p key={i} className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {block.content}
            </p>
          )
        ))}
      </div>
    </div>
  );
}

interface UnitDetailPageProps {
  unitId: string;
  appliedTreaties: Record<string, string[]>;
  onBack: () => void;
  onApplyTreaty?: (unitId: string, treatyId: string) => void;
  onRemoveTreaty?: (unitId: string, treatyId: string) => void;
}

export default function UnitDetailPage({ unitId, appliedTreaties, onBack, onApplyTreaty, onRemoveTreaty }: UnitDetailPageProps) {
  const { units } = useUnits();
  const { treaties } = useTreaties();
  const { formations: allFormations } = useFormations();
  const [activeGroup, setActiveGroup] = useState(0);
  const [showAvailable, setShowAvailable] = useState(false);

  const unit = units.find(u => u.id === unitId);
  if (!unit) return null;

  const roles = getRoles(unit.role);
  const myTreatyIds = appliedTreaties[unit.id] || [];
  const myTreaties = treaties.filter(t => myTreatyIds.includes(t.id));
  const availableTreaties = treaties.filter(
    t => !myTreatyIds.includes(t.id) &&
    (t.compatibleClasses.length === 0 || t.compatibleClasses.includes(unit.class as never))
  );

  const getTreatyBonus = (stat: keyof UnitStats) =>
    myTreaties.reduce((acc, t) => {
      const ex = t.statModifiersEx?.[stat];
      if (ex) return acc + (ex.type === 'percent' ? Math.round(unit.stats[stat] * ex.value / 100) : ex.value);
      return acc + (t.statModifiers[stat] || 0);
    }, 0);

  const getAbilityBonus = (stat: keyof UnitStats) =>
    unit.abilities.reduce((acc, ab) => {
      const obj = getAbilityObj(ab);
      if (!obj) return acc;
      const ex = obj.statModifiersEx?.[stat];
      if (ex) return acc + (ex.type === 'percent' ? Math.round(unit.stats[stat] * ex.value / 100) : ex.value);
      return acc + (obj.statModifiers?.[stat] || 0);
    }, 0);

  const statGroup = STAT_GROUPS[activeGroup];

  const activeAbilities = unit.abilities.filter(ab => {
    const obj = getAbilityObj(ab);
    return (obj?.statModifiers && Object.keys(obj.statModifiers).length > 0) ||
           (obj?.statModifiersEx != null && Object.keys(obj.statModifiersEx).length > 0);
  });

  const traits = unit.traits || [];
  const unitFormations = allFormations.filter(f => (unit.formations || []).includes(f.id));

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <Icon name="ChevronLeft" size={16} />
        Назад к каталогу
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header */}
          <div className={`bg-card border border-rarity-${unit.rarity} rounded-sm p-6`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-sm bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                {unit.avatar_url ? (
                  <img src={unit.avatar_url} alt={unit.name} className="w-full h-full object-cover" />
                ) : (
                  <Icon name={CLASS_ICONS[unit.class] || 'Shield'} size={28} className="text-primary" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-semibold text-foreground">{unit.name}</h1>
                  {(unit.stars ?? 0) > 0 && <StarRating value={unit.stars ?? 0} size={16} />}
                </div>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">{unit.class}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="flex items-center gap-1 flex-wrap">
                    {roles.map((role, i) => (
                      <RoleTooltip key={role} role={role} showDot={i > 0} size="md" />
                    ))}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <RarityBadge rarity={unit.rarity} size="md" />
                </div>
              </div>
            </div>
            <p className="text-sm text-foreground leading-relaxed mb-3">{unit.description}</p>
            {unit.lore && (
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Хроника</div>
                <p className="text-xs text-muted-foreground italic leading-relaxed border-l-2 border-primary/30 pl-3">{unit.lore}</p>
              </div>
            )}
          </div>

          {/* Особенности */}
          {traits.length > 0 && (
            <div className="bg-card border border-border rounded-sm p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2 uppercase tracking-widest">
                <Icon name="Star" size={14} className="text-primary" />
                Особенности
              </h2>
              <div className="flex flex-wrap gap-2">
                {traits.map((tr, i) => <TraitTag key={i} trait={tr} />)}
              </div>
            </div>
          )}

          {/* Построения */}
          {unitFormations.length > 0 && (
            <div className="bg-card border border-border rounded-sm p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2 uppercase tracking-widest">
                <Icon name="Shield" size={14} className="text-primary" />
                Построения
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {unitFormations.map(f => <FormationTag key={f.id} formation={f} />)}
              </div>
            </div>
          )}

          {/* Stats tabs */}
          <div className="bg-card border border-border rounded-sm overflow-hidden">
            <div className="flex border-b border-border">
              {STAT_GROUPS.map((g, idx) => (
                <button key={g.label} onClick={() => setActiveGroup(idx)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-all border-b-2 -mb-px ${activeGroup === idx ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  <Icon name={g.icon} size={13} className={activeGroup === idx ? g.color : ''} />
                  {g.label}
                </button>
              ))}
              {(myTreaties.length > 0 || activeAbilities.length > 0) && (
                <div className="ml-auto flex items-center gap-3 px-4">
                  {myTreaties.length > 0 && <span className="text-xs text-green-400 font-mono-data">+{myTreaties.length} трактатов</span>}
                  {activeAbilities.length > 0 && (
                    <span className="text-xs text-blue-400 font-mono-data flex items-center gap-1">
                      <Icon name="Zap" size={10} /> {activeAbilities.length} умений
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {statGroup.stats.map(({ key, label, max, unit: unitLabel }) => (
                <StatBar key={key} label={label} value={unit.stats[key]} max={max}
                  bonus={getTreatyBonus(key)} abilityBonus={getAbilityBonus(key)} unitLabel={unitLabel} />
              ))}
            </div>

            {(myTreaties.length > 0 || activeAbilities.length > 0) && (
              <div className="px-5 pb-4 flex flex-wrap gap-3 border-t border-border pt-3">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> бонус трактата</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> штраф трактата</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> бонус умения</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> штраф умения</span>
              </div>
            )}
          </div>

          {/* Умения */}
          <div className="bg-card border border-border rounded-sm p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2 uppercase tracking-widest">
              <Icon name="Wand2" size={14} className="text-primary" />
              Умения
            </h2>
            <div className="flex flex-wrap gap-2">
              {unit.abilities.map((ab, i) => <AbilityTag key={i} ab={ab} />)}
            </div>
          </div>

          <GuideSection
            title="Рекомендации по прокачке"
            icon="TrendingUp"
            blocks={unit.guide_upgrade || []}
          />

          <GuideSection
            title="Рекомендации по игре"
            icon="Gamepad2"
            blocks={unit.guide_gameplay || []}
          />
        </div>

        {/* Right */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-sm p-5">
            <h2 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-widest">Экономика</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Icon name="Users" size={12} /> Численность</span>
                <span className="font-mono-data text-sm text-foreground">{unit.stats.troops}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Icon name="Crown" size={12} /> Лидерство</span>
                <span className="font-mono-data text-sm text-foreground">{unit.stats.leadership}</span>
              </div>
            </div>
          </div>

          {/* Трактаты */}
          <div className="bg-card border border-border rounded-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Трактаты</h2>
              {onApplyTreaty && availableTreaties.length > 0 && (
                <button
                  onClick={() => setShowAvailable(v => !v)}
                  className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest transition-colors px-2 py-1 rounded-sm"
                  style={{
                    color: showAvailable ? 'hsl(42 76% 68%)' : 'hsl(222 8% 55%)',
                    background: showAvailable ? 'hsl(42 76% 50% / 0.12)' : 'hsl(222 14% 14%)',
                    border: showAvailable ? '1px solid hsl(42 76% 50% / 0.35)' : '1px solid hsl(222 14% 20%)',
                  }}
                >
                  <Icon name={showAvailable ? 'ChevronUp' : 'Plus'} size={10} />
                  {showAvailable ? 'Свернуть' : 'Добавить'}
                </button>
              )}
            </div>

            {/* Применённые трактаты */}
            {myTreaties.length === 0 && !showAvailable ? (
              <p className="text-xs text-muted-foreground">Трактаты не применены</p>
            ) : (
              <div className="space-y-2">
                {myTreaties.map(t => (
                  <div key={t.id} className={`border border-rarity-${t.rarity} rounded-sm p-3`}>
                    <div className="flex items-center gap-2 mb-2">
                      {t.avatar_url && (
                        <div className="w-7 h-7 rounded-sm overflow-hidden flex-shrink-0 bg-muted">
                          <img src={t.avatar_url} alt={t.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <span className="text-xs font-medium text-foreground flex-1">{t.name}</span>
                      <RarityBadge rarity={t.rarity} />
                      {onRemoveTreaty && (
                        <button
                          onClick={() => onRemoveTreaty(unit.id, t.id)}
                          className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-sm transition-colors"
                          style={{ color: 'hsl(355 72% 60%)', background: 'hsl(355 72% 20% / 0.2)', border: '1px solid hsl(355 72% 40% / 0.3)' }}
                          title="Снять трактат"
                        >
                          <Icon name="X" size={10} />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(t.statModifiers).map(([stat, val]) => (
                        <span key={stat} className={`font-mono-data text-[10px] px-1.5 py-0.5 rounded-sm ${(val || 0) > 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                          {STAT_LABEL_MAP[stat as keyof UnitStats] ?? stat}: {(val || 0) > 0 ? '+' : ''}{val}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Доступные трактаты */}
            {showAvailable && availableTreaties.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2 border-t border-border pt-3">Доступные</div>
                {availableTreaties.map(t => (
                  <div key={t.id} className="border border-border rounded-sm p-3 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 mb-1.5">
                      {t.avatar_url && (
                        <div className="w-7 h-7 rounded-sm overflow-hidden flex-shrink-0 bg-muted">
                          <img src={t.avatar_url} alt={t.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <span className="text-xs font-medium text-foreground flex-1">{t.name}</span>
                      <RarityBadge rarity={t.rarity} />
                      {onApplyTreaty && (
                        <button
                          onClick={() => onApplyTreaty(unit.id, t.id)}
                          className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-sm transition-colors"
                          style={{ color: 'hsl(150 48% 60%)', background: 'hsl(150 48% 20% / 0.2)', border: '1px solid hsl(150 48% 40% / 0.3)' }}
                          title="Применить трактат"
                        >
                          <Icon name="Plus" size={10} />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(t.statModifiers).map(([stat, val]) => (
                        <span key={stat} className={`font-mono-data text-[10px] px-1.5 py-0.5 rounded-sm ${(val || 0) > 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                          {STAT_LABEL_MAP[stat as keyof UnitStats] ?? stat}: {(val || 0) > 0 ? '+' : ''}{val}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Бонусы умений */}
          {activeAbilities.length > 0 && (
            <div className="bg-card border border-blue-500/20 rounded-sm p-5">
              <h2 className="text-xs font-semibold text-blue-400 mb-4 uppercase tracking-widest flex items-center gap-1.5">
                <Icon name="Zap" size={12} /> Бонусы умений
              </h2>
              <div className="space-y-3">
                {activeAbilities.map((ab, i) => {
                  const obj = getAbilityObj(ab)!;
                  return (
                    <div key={i} className="border border-blue-500/20 rounded-sm p-3">
                      <div className="text-xs font-medium text-foreground mb-1.5">{obj.name}</div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(obj.statModifiers!).map(([stat, val]) => (
                          <span key={stat} className={`font-mono-data text-[10px] px-1.5 py-0.5 rounded-sm ${(val || 0) > 0 ? 'bg-blue-900/30 text-blue-400' : 'bg-orange-900/30 text-orange-400'}`}>
                            {STAT_LABEL_MAP[stat as keyof UnitStats] ?? stat}: {(val || 0) > 0 ? '+' : ''}{val}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}