import { useState } from 'react';
import { UNITS } from '@/data/units';
import { TREATIES } from '@/data/treaties';
import { STAT_GROUPS } from '@/data/statGroups';
import { UnitStats } from '@/data/types';
import StatBar from '@/components/StatBar';
import RarityBadge from '@/components/RarityBadge';
import Icon from '@/components/ui/icon';

const CLASS_ICONS: Record<string, string> = {
  'Пехота': 'Sword', 'Кавалерия': 'Zap', 'Стрелки': 'Target', 'Осадные': 'Hammer', 'Магические': 'Sparkles',
};

interface UnitDetailPageProps {
  unitId: string;
  appliedTreaties: Record<string, string[]>;
  onBack: () => void;
}

export default function UnitDetailPage({ unitId, appliedTreaties, onBack }: UnitDetailPageProps) {
  const [activeGroup, setActiveGroup] = useState(0);

  const unit = UNITS.find(u => u.id === unitId);
  if (!unit) return null;

  const myTreatyIds = appliedTreaties[unit.id] || [];
  const myTreaties = TREATIES.filter(t => myTreatyIds.includes(t.id));

  const getBonus = (stat: keyof UnitStats) =>
    myTreaties.reduce((acc, t) => acc + (t.statModifiers[stat] || 0), 0);

  const statGroup = STAT_GROUPS[activeGroup];

  const STAT_LABEL_MAP: Partial<Record<keyof UnitStats, string>> = {
    health: 'Здоровье', troops: 'Численность', leadership: 'Лидерство',
    moveSpeed: 'Скорость', rangeDistance: 'Дальность', ammo: 'Боезапас', morale: 'Работосп.',
    piercingPenetration: 'Проб. (прон.)', slashingPenetration: 'Проб. (руб.)', bluntPenetration: 'Проб. (дроб.)',
    piercingDamage: 'Прон. урон', slashingDamage: 'Руб. урон', bluntDamage: 'Дроб. урон',
    piercingDefense: 'Защ. (прон.)', slashingDefense: 'Защ. (руб.)', bluntDefense: 'Защ. (дроб.)',
    block: 'Блок', blockRecovery: 'Восст. блока',
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <Icon name="ChevronLeft" size={16} />
        Назад к каталогу
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header */}
          <div className={`bg-card border border-rarity-${unit.rarity} rounded-sm p-6`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-sm bg-muted flex items-center justify-center flex-shrink-0">
                <Icon name={CLASS_ICONS[unit.class] || 'Shield'} size={28} className="text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">{unit.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">{unit.class}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground">{unit.role}</span>
                  <span className="text-muted-foreground">·</span>
                  <RarityBadge rarity={unit.rarity} size="md" />
                </div>
              </div>
            </div>
            <p className="text-sm text-foreground leading-relaxed mb-3">{unit.description}</p>
            <p className="text-xs text-muted-foreground italic leading-relaxed border-l-2 border-primary/30 pl-3">{unit.lore}</p>
          </div>

          {/* Stats tabs */}
          <div className="bg-card border border-border rounded-sm overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-border">
              {STAT_GROUPS.map((g, idx) => (
                <button
                  key={g.label}
                  onClick={() => setActiveGroup(idx)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-all border-b-2 -mb-px ${
                    activeGroup === idx
                      ? `border-primary text-foreground`
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name={g.icon} size={13} className={activeGroup === idx ? g.color : ''} />
                  {g.label}
                </button>
              ))}
              {myTreaties.length > 0 && (
                <div className="ml-auto flex items-center px-4">
                  <span className="text-xs text-green-400 font-mono-data">+{myTreaties.length} трактатов</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {statGroup.stats.map(({ key, label, max, unit: unitLabel }) => (
                <StatBar
                  key={key}
                  label={label}
                  value={unit.stats[key]}
                  max={max}
                  bonus={getBonus(key)}
                  unitLabel={unitLabel}
                />
              ))}
            </div>
          </div>

          {/* Abilities */}
          <div className="bg-card border border-border rounded-sm p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2 uppercase tracking-widest">
              <Icon name="Wand2" size={14} className="text-primary" />
              Способности
            </h2>
            <div className="flex flex-wrap gap-2">
              {unit.abilities.map(ab => (
                <span key={ab} className="bg-muted border border-border rounded-sm px-3 py-1.5 text-xs text-foreground">
                  {ab}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          {/* Economy */}
          <div className="bg-card border border-border rounded-sm p-5">
            <h2 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-widest">Экономика</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Icon name="Users" size={12} /> Численность
                </span>
                <span className="font-mono-data text-sm text-foreground">{unit.stats.troops}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Icon name="Coins" size={12} /> Стоимость найма
                </span>
                <span className="font-mono-data text-sm text-foreground">{unit.cost}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Icon name="RefreshCw" size={12} /> Содержание/ход
                </span>
                <span className="font-mono-data text-sm text-foreground">{unit.upkeep}</span>
              </div>
              {unit.stats.ammo > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Icon name="Crosshair" size={12} /> Боезапас
                  </span>
                  <span className="font-mono-data text-sm text-foreground">{unit.stats.ammo}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Icon name="TrendingDown" size={12} /> За 10 ходов
                </span>
                <span className="font-mono-data text-sm text-primary">{unit.cost + unit.upkeep * 10}</span>
              </div>
            </div>
          </div>

          {/* Applied Treaties */}
          <div className="bg-card border border-border rounded-sm p-5">
            <h2 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-widest">Трактаты</h2>
            {myTreaties.length === 0 ? (
              <p className="text-xs text-muted-foreground">Трактаты не применены</p>
            ) : (
              <div className="space-y-3">
                {myTreaties.map(t => (
                  <div key={t.id} className={`border border-rarity-${t.rarity} rounded-sm p-3`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-medium text-foreground">{t.name}</span>
                      <RarityBadge rarity={t.rarity} />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(t.statModifiers).map(([stat, val]) => (
                        <span
                          key={stat}
                          className={`font-mono-data text-[10px] px-1.5 py-0.5 rounded-sm ${(val || 0) > 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}
                        >
                          {STAT_LABEL_MAP[stat as keyof UnitStats] ?? stat}: {(val || 0) > 0 ? '+' : ''}{val}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
