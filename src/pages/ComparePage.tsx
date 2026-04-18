import { useState } from 'react';
import { UNITS } from '@/data/units';
import { Unit } from '@/data/types';
import RarityBadge from '@/components/RarityBadge';
import Icon from '@/components/ui/icon';

const STAT_KEYS: Array<{ key: keyof Unit['stats']; label: string; max: number }> = [
  { key: 'attack', label: 'Атака', max: 100 },
  { key: 'defense', label: 'Защита', max: 100 },
  { key: 'speed', label: 'Скорость', max: 100 },
  { key: 'health', label: 'Здоровье', max: 100 },
  { key: 'morale', label: 'Мораль', max: 100 },
  { key: 'range', label: 'Дальность', max: 12 },
];

export default function ComparePage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [picker, setPicker] = useState(false);

  const selectedUnits = UNITS.filter(u => selected.includes(u.id));

  const getBest = (key: keyof Unit['stats']) => {
    if (selectedUnits.length < 2) return null;
    return Math.max(...selectedUnits.map(u => u.stats[key]));
  };

  const toggleUnit = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-foreground mb-1">Сравнение Отрядов</h1>
        <p className="text-muted-foreground text-sm">Выберите до 4 отрядов для сравнения</p>
      </div>

      {/* Selector */}
      <div className="bg-card border border-border rounded-sm p-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          {selected.map(id => {
            const u = UNITS.find(x => x.id === id)!;
            return (
              <div key={id} className={`flex items-center gap-2 bg-muted border border-rarity-${u.rarity} rounded-sm px-3 py-2`}>
                <span className="text-sm text-foreground">{u.name}</span>
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
            <button onClick={() => setSelected([])} className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
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

      {/* Compare table */}
      {selectedUnits.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Icon name="GitCompare" size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Выберите отряды для сравнения</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          {/* Unit headers */}
          <div className="grid border-b border-border" style={{ gridTemplateColumns: `180px repeat(${selectedUnits.length}, 1fr)` }}>
            <div className="p-4 bg-muted/50" />
            {selectedUnits.map(u => (
              <div key={u.id} className={`p-4 border-l border-border`}>
                <div className={`rarity-${u.rarity} text-[10px] font-mono-data uppercase tracking-widest mb-1`}>
                  {u.rarity}
                </div>
                <div className="font-semibold text-sm text-foreground leading-tight">{u.name}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{u.class} · {u.role}</div>
              </div>
            ))}
          </div>

          {/* Stats rows */}
          {STAT_KEYS.map(({ key, label, max }, idx) => {
            const best = getBest(key);
            return (
              <div
                key={key}
                className={`grid border-b border-border ${idx % 2 === 0 ? '' : 'bg-muted/20'}`}
                style={{ gridTemplateColumns: `180px repeat(${selectedUnits.length}, 1fr)` }}
              >
                <div className="p-4 flex items-center">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">{label}</span>
                </div>
                {selectedUnits.map(u => {
                  const val = u.stats[key];
                  const isBest = best !== null && val === best;
                  const pct = (val / max) * 100;
                  return (
                    <div key={u.id} className={`p-4 border-l border-border ${isBest ? 'bg-primary/5' : ''}`}>
                      <div className={`font-mono-data text-lg font-medium mb-1 ${isBest ? 'text-primary' : 'text-foreground'}`}>
                        {val}
                        {isBest && selectedUnits.length > 1 && <span className="text-xs ml-1 opacity-70">▲</span>}
                      </div>
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
            className="grid bg-muted/30"
            style={{ gridTemplateColumns: `180px repeat(${selectedUnits.length}, 1fr)` }}
          >
            <div className="p-4 flex items-center">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Стоимость</span>
            </div>
            {selectedUnits.map(u => {
              const best = Math.min(...selectedUnits.map(x => x.cost));
              return (
                <div key={u.id} className={`p-4 border-l border-border ${u.cost === best ? 'bg-green-900/10' : ''}`}>
                  <span className={`font-mono-data text-lg font-medium ${u.cost === best ? 'text-green-400' : 'text-foreground'}`}>
                    {u.cost}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
