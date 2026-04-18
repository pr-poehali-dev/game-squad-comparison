import { useState } from 'react';
import { UNITS } from '@/data/units';
import { TREATIES } from '@/data/treaties';
import { STAT_GROUPS, ALL_STATS } from '@/data/statGroups';
import { Unit, UnitStats } from '@/data/types';
import RarityBadge from '@/components/RarityBadge';
import Icon from '@/components/ui/icon';

interface ComparePageProps {
  appliedTreaties: Record<string, string[]>;
  onApply: (unitId: string, treatyId: string) => void;
  onRemove: (unitId: string, treatyId: string) => void;
}

export default function ComparePage({ appliedTreaties, onApply, onRemove }: ComparePageProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [picker, setPicker] = useState(false);
  const [treatyPanelUnit, setTreatyPanelUnit] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState(0);

  const selectedUnits = UNITS.filter(u => selected.includes(u.id));

  const getEffectiveStat = (unit: Unit, key: keyof UnitStats) => {
    const ids = appliedTreaties[unit.id] || [];
    const bonus = TREATIES.filter(t => ids.includes(t.id))
      .reduce((acc, t) => acc + (t.statModifiers[key] || 0), 0);
    return unit.stats[key] + bonus;
  };

  const getBonus = (unit: Unit, key: keyof UnitStats) => {
    const ids = appliedTreaties[unit.id] || [];
    return TREATIES.filter(t => ids.includes(t.id))
      .reduce((acc, t) => acc + (t.statModifiers[key] || 0), 0);
  };

  const getBest = (key: keyof UnitStats) => {
    if (selectedUnits.length < 2) return null;
    return Math.max(...selectedUnits.map(u => getEffectiveStat(u, key)));
  };

  const toggleUnit = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev
    );
    if (treatyPanelUnit === id) setTreatyPanelUnit(null);
  };

  const treatyPanelUnitObj = treatyPanelUnit ? UNITS.find(u => u.id === treatyPanelUnit) : null;
  const compatibleTreaties = treatyPanelUnitObj
    ? TREATIES.filter(t => t.compatibleClasses.includes(treatyPanelUnitObj.class))
    : [];
  const activeTreatyIds = treatyPanelUnit ? (appliedTreaties[treatyPanelUnit] || []) : [];

  const currentGroupStats = STAT_GROUPS[activeGroup].stats;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-foreground mb-1">Сравнение Отрядов</h1>
        <p className="text-muted-foreground text-sm">Выберите до 4 отрядов · Применяйте трактаты прямо здесь</p>
      </div>

      {/* Selector */}
      <div className="bg-card border border-border rounded-sm p-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          {selected.map(id => {
            const u = UNITS.find(x => x.id === id)!;
            const count = (appliedTreaties[id] || []).length;
            return (
              <div key={id} className={`flex items-center gap-2 bg-muted border border-rarity-${u.rarity} rounded-sm px-3 py-2`}>
                <span className="text-sm text-foreground">{u.name}</span>
                {count > 0 && (
                  <span className="text-[10px] font-mono-data bg-primary/20 text-primary rounded-sm px-1 py-0.5">+{count}</span>
                )}
                <button onClick={() => toggleUnit(id)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Icon name="X" size={14} />
                </button>
              </div>
            );
          })}
          {selected.length < 4 && (
            <button
              onClick={() => setPicker(!picker)}
              className="flex items-center gap-2 bg-muted border border-dashed border-border rounded-sm px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
            >
              <Icon name="Plus" size={14} />
              Добавить отряд
            </button>
          )}
          {selected.length > 0 && (
            <button onClick={() => { setSelected([]); setTreatyPanelUnit(null); }} className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              <Icon name="Trash2" size={12} />
              Очистить
            </button>
          )}
        </div>

        {picker && (
          <div className="mt-3 border-t border-border pt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto scrollbar-thin">
            {UNITS.map(u => (
              <button
                key={u.id}
                onClick={() => { toggleUnit(u.id); if (selected.length + 1 >= 4) setPicker(false); }}
                disabled={selected.length >= 4 && !selected.includes(u.id)}
                className={`text-left px-3 py-2 rounded-sm border text-xs transition-all ${
                  selected.includes(u.id)
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-muted text-muted-foreground hover:border-primary/40 hover:text-foreground'
                } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                <div className="font-medium truncate">{u.name}</div>
                <div className="text-[10px] opacity-70">{u.class}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedUnits.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Icon name="GitCompare" size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Выберите отряды для сравнения</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-sm overflow-hidden">
            {/* Stat group tabs */}
            <div className="flex border-b border-border bg-muted/30">
              {STAT_GROUPS.map((g, idx) => (
                <button
                  key={g.label}
                  onClick={() => setActiveGroup(idx)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-all border-b-2 -mb-px ${
                    activeGroup === idx
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name={g.icon} size={12} className={activeGroup === idx ? g.color : ''} />
                  {g.label}
                </button>
              ))}
            </div>

            {/* Unit headers */}
            <div className="grid border-b border-border" style={{ gridTemplateColumns: `200px repeat(${selectedUnits.length}, 1fr)` }}>
              <div className="p-4 bg-muted/30" />
              {selectedUnits.map(u => {
                const treatyCount = (appliedTreaties[u.id] || []).length;
                const isActive = treatyPanelUnit === u.id;
                return (
                  <div key={u.id} className={`p-4 border-l border-border ${isActive ? 'bg-primary/5' : ''}`}>
                    <div className={`rarity-${u.rarity} text-[10px] font-mono-data uppercase tracking-widest mb-1`}>
                      {u.rarity}
                    </div>
                    <div className="font-semibold text-sm text-foreground leading-tight">{u.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 mb-2">{u.class} · {u.role}</div>
                    <button
                      onClick={() => setTreatyPanelUnit(isActive ? null : u.id)}
                      className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-sm border transition-all ${
                        isActive
                          ? 'border-primary text-primary bg-primary/10'
                          : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      }`}
                    >
                      <Icon name="ScrollText" size={10} />
                      Трактаты {treatyCount > 0 && <span className="font-mono-data">({treatyCount})</span>}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Stat rows */}
            {currentGroupStats.map(({ key, label, max, unit: unitLabel }, idx) => {
              const best = getBest(key);
              return (
                <div
                  key={key}
                  className={`grid border-b border-border ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}
                  style={{ gridTemplateColumns: `200px repeat(${selectedUnits.length}, 1fr)` }}
                >
                  <div className="p-3 flex items-center border-r border-border">
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                  {selectedUnits.map(u => {
                    const base = u.stats[key];
                    const bonus = getBonus(u, key);
                    const val = base + bonus;
                    const isBest = best !== null && val === best;
                    const pct = Math.min((val / max) * 100, 100);
                    return (
                      <div key={u.id} className={`p-3 border-l border-border ${isBest ? 'bg-primary/5' : ''}`}>
                        <div className={`font-mono-data text-base font-medium mb-0.5 ${isBest ? 'text-primary' : 'text-foreground'}`}>
                          {val}{unitLabel ? ` ${unitLabel}` : ''}
                          {isBest && selectedUnits.length > 1 && <span className="text-xs ml-1 opacity-60">▲</span>}
                        </div>
                        {bonus !== 0 && (
                          <div className={`font-mono-data text-[10px] mb-1 ${bonus > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {bonus > 0 ? '+' : ''}{bonus}
                          </div>
                        )}
                        <div className="h-0.5 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              background: isBest ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Cost row */}
            <div
              className="grid bg-muted/20"
              style={{ gridTemplateColumns: `200px repeat(${selectedUnits.length}, 1fr)` }}
            >
              <div className="p-3 flex items-center border-r border-border">
                <span className="text-xs text-muted-foreground">Стоимость найма</span>
              </div>
              {selectedUnits.map(u => {
                const cheapest = Math.min(...selectedUnits.map(x => x.cost));
                return (
                  <div key={u.id} className={`p-3 border-l border-border ${u.cost === cheapest ? 'bg-green-900/10' : ''}`}>
                    <span className={`font-mono-data text-base font-medium ${u.cost === cheapest ? 'text-green-400' : 'text-foreground'}`}>
                      {u.cost}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Treaty panel */}
          {treatyPanelUnit && treatyPanelUnitObj && (
            <div className="bg-card border border-primary/20 rounded-sm p-5 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Icon name="ScrollText" size={14} className="text-primary" />
                  Трактаты для «{treatyPanelUnitObj.name}»
                  <span className="text-xs text-muted-foreground font-normal">({treatyPanelUnitObj.class})</span>
                </h3>
                <button onClick={() => setTreatyPanelUnit(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Icon name="X" size={14} />
                </button>
              </div>

              {compatibleTreaties.length === 0 ? (
                <p className="text-xs text-muted-foreground">Нет совместимых трактатов</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {compatibleTreaties.map(t => {
                    const applied = activeTreatyIds.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        className={`border rounded-sm p-3 transition-all border-rarity-${t.rarity} ${applied ? 'bg-primary/5' : 'bg-muted/20'}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="text-xs font-medium text-foreground leading-tight mb-0.5">{t.name}</div>
                            <RarityBadge rarity={t.rarity} />
                          </div>
                          <button
                            onClick={() => applied ? onRemove(treatyPanelUnit, t.id) : onApply(treatyPanelUnit, t.id)}
                            className={`flex-shrink-0 text-[10px] px-2 py-1 rounded-sm border transition-all flex items-center gap-1 ${
                              applied
                                ? 'border-red-500/40 text-red-400 hover:bg-red-900/20'
                                : 'border-primary/40 text-primary hover:bg-primary/10'
                            }`}
                          >
                            <Icon name={applied ? 'Minus' : 'Plus'} size={10} />
                            {applied ? 'Снять' : 'Взять'}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(t.statModifiers).map(([stat, val]) => {
                            const statDef = ALL_STATS.find(s => s.key === stat);
                            const shortLabel = statDef
                              ? statDef.label.length > 15 ? statDef.label.slice(0, 14) + '…' : statDef.label
                              : stat;
                            return (
                              <span
                                key={stat}
                                className={`font-mono-data text-[10px] px-1.5 py-0.5 rounded-sm ${(val || 0) > 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}
                              >
                                {shortLabel}: {(val || 0) > 0 ? '+' : ''}{val}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
