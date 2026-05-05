import { useState, useEffect } from 'react';
import { Rarity, UnitClass, UnitRole, Ability, UnitStats, Trait, TraitColor, Formation } from '@/data/types';
import { ALL_STATS, STAT_GROUPS } from '@/data/statGroups';
import { UnitRoleDef, TraitDef, AbilityDef } from '@/hooks/useAppData';
import Icon from '@/components/ui/icon';
import RarityBadge from '@/components/RarityBadge';
import AvatarUpload from '@/components/AvatarUpload';
import { StarPicker } from '@/components/StarRating';
import GuideEditor from '@/components/GuideEditor';
import { GuideBlock } from '@/data/types';

export const UNIT_CLASSES: UnitClass[] = ['Пехота', 'Кавалерия', 'Стрелки', 'Осадные'];
export const RARITIES: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
export const RARITY_LABELS: Record<Rarity, string> = { common: 'Обычный', uncommon: 'Необычный', rare: 'Редкий', epic: 'Уникальный', legendary: 'Легендарный' };

export const DEFAULT_UNIT_STATS = {
  health: 0, troops: 0, leadership: 0, moveSpeed: 0, rangeDistance: 0, ammo: 0, morale: 0,
  piercingPenetration: 0, slashingPenetration: 0, bluntPenetration: 0,
  piercingDamage: 0, slashingDamage: 0, bluntDamage: 0,
  piercingDefense: 0, slashingDefense: 0, bluntDefense: 0,
  block: 0, blockRecovery: 0,
};

export const STAT_LABELS: Partial<Record<string, string>> = Object.fromEntries(ALL_STATS.map(s => [s.key, s.label]));

// ── Toast ──
export function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-sm text-sm shadow-lg border
      ${type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-600' : 'bg-destructive/10 border-destructive/30 text-destructive'}`}>
      <Icon name={type === 'success' ? 'CheckCircle' : 'AlertCircle'} size={14} />
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><Icon name="X" size={12} /></button>
    </div>
  );
}

// ── ConfirmModal ──
export function ConfirmModal({ name, type, onConfirm, onCancel }: { name: string; type: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
      <div className="bg-card border border-border rounded-sm p-6 w-full max-w-sm shadow-xl">
        <h3 className="text-sm font-semibold mb-3">Подтверждение удаления</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Вы уверены, что хотите удалить {type} <span className="text-foreground font-medium">«{name}»</span>?
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm border border-border rounded-sm hover:bg-muted transition-colors">
            Отмена
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-sm hover:bg-destructive/90 transition-colors">
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}

// ── UnitModal ──
interface UnitFormData {
  name: string;
  class: UnitClass;
  roles: UnitRole[];
  rarity: Rarity;
  description: string;
  lore: string;
  avatar_url: string;
  stars: number;
  guide_upgrade: GuideBlock[];
  guide_gameplay: GuideBlock[];
  abilities: never[];
  stats: typeof DEFAULT_UNIT_STATS;
  formations: number[];
}

function getRawRoles(raw: unknown): UnitRole[] {
  if (Array.isArray(raw)) return raw as UnitRole[];
  if (typeof raw === 'string') return [raw as UnitRole];
  return ['Танк'];
}

export function UnitModal({ unit, onSave, onClose, availableRoles, availableFormations, availableTraits, availableAbilities }: {
  unit?: Record<string, unknown> | null;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
  availableRoles: UnitRoleDef[];
  availableFormations: Formation[];
  availableTraits: TraitDef[];
  availableAbilities: AbilityDef[];
}) {
  const editing = !!unit;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const rawAbilities = (unit?.abilities as unknown[]) || [];
  const rawTraits = (unit?.traits as unknown[]) || [];

  const initSelectedTraitIds = (): number[] => {
    if (!rawTraits.length) return [];
    return rawTraits
      .map(rt => {
        const name = typeof rt === 'string' ? rt : (rt as Trait).name;
        const found = availableTraits.find(at => at.name === name);
        return found ? found.id : null;
      })
      .filter((id): id is number => id !== null);
  };

  const initSelectedAbilityIds = (): number[] => {
    if (!editing || !rawAbilities.length) return [];
    return rawAbilities
      .map(ra => {
        const name = typeof ra === 'string' ? ra : (ra as Ability).name;
        const found = availableAbilities.find(a => a.name === name);
        return found ? found.id : null;
      })
      .filter((id): id is number => id !== null);
  };

  const [selectedTraitIds, setSelectedTraitIds] = useState<number[]>(initSelectedTraitIds);
  const [selectedAbilityIds, setSelectedAbilityIds] = useState<number[]>(initSelectedAbilityIds);
  const [form, setForm] = useState<UnitFormData>({
    name: (unit?.name as string) || '',
    class: (unit?.class as UnitClass) || 'Пехота',
    roles: getRawRoles(unit?.role),
    rarity: (unit?.rarity as Rarity) || 'common',
    description: (unit?.description as string) || '',
    lore: (unit?.lore as string) || '',
    avatar_url: (unit?.avatar_url as string) || '',
    stars: typeof unit?.stars === 'number' ? unit.stars as number : 0,
    guide_upgrade: Array.isArray(unit?.guide_upgrade) ? unit.guide_upgrade as GuideBlock[] : [],
    guide_gameplay: Array.isArray(unit?.guide_gameplay) ? unit.guide_gameplay as GuideBlock[] : [],
    abilities: [],
    stats: { ...DEFAULT_UNIT_STATS, ...((unit?.stats as Record<string, number>) || {}) },
    formations: Array.isArray(unit?.formations) ? (unit.formations as number[]) : [],
  });

  const set = (key: keyof UnitFormData, val: unknown) => setForm(f => ({ ...f, [key]: val }));
  const setStat = (key: string, val: string) => setForm(f => ({ ...f, stats: { ...f.stats, [key]: parseFloat(val) || 0 } }));

  const toggleRole = (r: UnitRole) => setForm(f => ({
    ...f,
    roles: f.roles.includes(r) ? f.roles.filter(x => x !== r) : [...f.roles, r],
  }));

  const toggleFormation = (id: number) => setForm(f => ({
    ...f,
    formations: f.formations.includes(id) ? f.formations.filter(x => x !== id) : [...f.formations, id],
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Поле "название" обязательно'); return; }
    if (form.roles.length === 0) { setError('Выберите хотя бы одну роль'); return; }
    setLoading(true);
    setError('');
    try {
      const abilities = selectedAbilityIds
        .map(id => availableAbilities.find(a => a.id === id))
        .filter(Boolean)
        .map(a => {
          const hasInfo = a!.description || Object.keys(a!.statModifiers || {}).length > 0 || Object.keys(a!.statModifiersEx || {}).length > 0;
          if (!hasInfo) return a!.name;
          return {
            name: a!.name,
            description: a!.description || undefined,
            statModifiers: Object.keys(a!.statModifiers || {}).length > 0 ? a!.statModifiers : undefined,
            statModifiersEx: Object.keys(a!.statModifiersEx || {}).length > 0 ? a!.statModifiersEx : undefined,
          };
        });
      const traits = selectedTraitIds
        .map(id => availableTraits.find(t => t.id === id))
        .filter(Boolean)
        .map(t => ({ name: t!.name, description: t!.description || undefined, color: t!.color }));
      await onSave({
        name: form.name.trim(), class: form.class, role: form.roles,
        rarity: form.rarity, description: form.description, lore: form.lore,
        avatar_url: form.avatar_url, stars: form.stars,
        guide_upgrade: form.guide_upgrade, guide_gameplay: form.guide_gameplay,
        abilities, traits, stats: form.stats, formations: form.formations,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-background border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 overflow-y-auto py-6">
      <div className="bg-card border border-border rounded-sm w-full max-w-2xl shadow-xl mx-4">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-sm font-semibold">{editing ? 'Редактировать отряд' : 'Добавить отряд'}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><Icon name="X" size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-sm bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
              <Icon name="AlertCircle" size={12} /> {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-1.5">Название *</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} placeholder="Железная Стража" required />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Класс</label>
              <select value={form.class} onChange={e => set('class', e.target.value)} className={inputCls}>
                {UNIT_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Редкость</label>
              <select value={form.rarity} onChange={e => set('rarity', e.target.value)} className={inputCls}>
                {RARITIES.map(r => <option key={r} value={r}>{RARITY_LABELS[r]}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-2">Роли (можно несколько)</label>
              <div className="flex flex-wrap gap-2">
                {availableRoles.map(r => (
                  <button key={r.id} type="button" onClick={() => toggleRole(r.name as UnitRole)}
                    title={r.description || undefined}
                    className={`px-3 py-1.5 text-xs rounded-sm border transition-colors ${form.roles.includes(r.name as UnitRole) ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground hover:border-foreground/40'}`}>
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-2">Построения (можно несколько)</label>
              {availableFormations.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Нет доступных построений. Создайте их во вкладке «Построения».</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableFormations.map(f => {
                    const selected = form.formations.includes(f.id);
                    return (
                      <button key={f.id} type="button" onClick={() => toggleFormation(f.id)}
                        title={f.description || undefined}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm border transition-colors ${selected ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground hover:border-foreground/40'}`}>
                        {f.avatar_url && (
                          <img src={f.avatar_url} alt="" className="w-4 h-4 rounded-sm object-cover flex-shrink-0" />
                        )}
                        {f.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-1.5">Описание</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} className={inputCls + ' resize-none'} rows={2} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-1.5">Хроника</label>
              <textarea value={form.lore} onChange={e => set('lore', e.target.value)} className={inputCls + ' resize-none'} rows={2} />
            </div>
            <div className="col-span-2">
              <AvatarUpload value={form.avatar_url} onChange={url => set('avatar_url', url)} aspectRatio="3/4" label="Аватар отряда (пропорции карточки)" folder="units" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-2">Звёзды отряда (0–5)</label>
              <StarPicker value={form.stars} onChange={v => set('stars', v)} />
            </div>
          </div>

          {/* Особенности */}
          <div>
            <h4 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Особенности</h4>
            {availableTraits.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Сначала создайте особенности в разделе «Особенности».</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableTraits.map(t => {
                  const selected = selectedTraitIds.includes(t.id);
                  const colorCls = t.color === 'green'
                    ? selected ? 'bg-green-900/40 border-green-500 text-green-400' : 'border-green-500/30 text-green-400/60 hover:border-green-500 hover:text-green-400'
                    : t.color === 'red'
                    ? selected ? 'bg-red-900/40 border-red-500 text-red-400' : 'border-red-500/30 text-red-400/60 hover:border-red-500 hover:text-red-400'
                    : selected ? 'bg-muted border-foreground/40 text-foreground' : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground';
                  return (
                    <button key={t.id} type="button"
                      onClick={() => setSelectedTraitIds(prev => prev.includes(t.id) ? prev.filter(id => id !== t.id) : [...prev, t.id])}
                      title={t.description || undefined}
                      className={`px-3 py-1.5 text-xs rounded-sm border transition-colors ${colorCls}`}>
                      {selected && <span className="mr-1">✓</span>}{t.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Умения */}
          <div>
            <h4 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Умения</h4>
            {availableAbilities.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Сначала создайте умения в разделе «Умения».</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableAbilities.map(a => {
                  const selected = selectedAbilityIds.includes(a.id);
                  const hasMods = Object.keys(a.statModifiers || {}).length > 0 || Object.keys(a.statModifiersEx || {}).length > 0;
                  return (
                    <button key={a.id} type="button"
                      onClick={() => setSelectedAbilityIds(prev => prev.includes(a.id) ? prev.filter(id => id !== a.id) : [...prev, a.id])}
                      title={[a.description, a.adminComment ? `📝 ${a.adminComment}` : ''].filter(Boolean).join('\n\n') || undefined}
                      className={`px-3 py-1.5 text-xs rounded-sm border transition-colors flex items-center gap-1 ${
                        selected
                          ? hasMods ? 'bg-blue-900/30 border-blue-500 text-blue-300' : 'bg-primary/10 border-primary text-primary'
                          : 'border-border text-muted-foreground hover:border-foreground/40'
                      }`}>
                      {hasMods && <Icon name="Zap" size={9} className={selected ? 'text-blue-400' : 'text-muted-foreground'} />}
                      {selected && <span className="mr-0.5">✓</span>}{a.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Характеристики */}
          <div>
            <h4 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Характеристики</h4>
            <div className="space-y-4">
              {STAT_GROUPS.map(group => (
                <div key={group.label}>
                  <div className={`flex items-center gap-1.5 mb-2 ${group.color}`}>
                    <Icon name={group.icon} size={12} />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">{group.label}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {group.stats.map(({ key, label }) => (
                      <div key={key}>
                        <label className="text-[10px] text-muted-foreground block mb-1">{label}</label>
                        <input
                          type="number"
                          value={form.stats[key as keyof typeof DEFAULT_UNIT_STATS] ?? 0}
                          onChange={e => setStat(key, e.target.value)}
                          className={inputCls + ' font-mono-data'}
                          step="0.01"
                          min={-9999}
                          max={key === 'health' ? 30000 : 9999}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <GuideEditor label="Рекомендации по прокачке" value={form.guide_upgrade} onChange={v => set('guide_upgrade', v)} />
          <GuideEditor label="Рекомендации по игре" value={form.guide_gameplay} onChange={v => set('guide_gameplay', v)} />

          <div className="flex gap-3 justify-end pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-sm hover:bg-muted transition-colors">Отмена</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {loading ? 'Сохраняем...' : (editing ? 'Сохранить' : 'Добавить')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── TreatyModal ──
interface ModifierEntry {
  value: string;
  type: 'flat' | 'percent';
}

function initModifiers(treaty?: Record<string, unknown> | null): Record<string, ModifierEntry> {
  const ex = (treaty?.statModifiersEx as Record<string, { value: number; type: 'flat' | 'percent' }>) || {};
  const flat = (treaty?.statModifiers as Record<string, number>) || {};
  const result: Record<string, ModifierEntry> = {};
  for (const [k, v] of Object.entries(flat)) result[k] = { value: String(v), type: 'flat' };
  for (const [k, v] of Object.entries(ex)) result[k] = { value: String(v.value), type: v.type };
  return result;
}

export function TreatyModal({ treaty, onSave, onClose }: {
  treaty?: Record<string, unknown> | null;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
}) {
  const editing = !!treaty;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState((treaty?.name as string) || '');
  const [description, setDescription] = useState((treaty?.description as string) || '');
  const [rarity, setRarity] = useState<Rarity>((treaty?.rarity as Rarity) || 'common');
  const [classes, setClasses] = useState<UnitClass[]>((treaty?.compatibleClasses as UnitClass[]) || []);
  const [avatarUrl, setAvatarUrl] = useState((treaty?.avatar_url as string) || '');
  const [modifiers, setModifiers] = useState<Record<string, ModifierEntry>>(initModifiers(treaty));
  const [newModKey, setNewModKey] = useState('health');
  const [newModVal, setNewModVal] = useState('');
  const [newModType, setNewModType] = useState<'flat' | 'percent'>('flat');

  const inputCls = "w-full bg-background border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";
  const statOptions = Object.keys(DEFAULT_UNIT_STATS);

  const toggleClass = (cls: UnitClass) => setClasses(prev => prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]);
  const addModifier = () => {
    if (!newModVal) return;
    setModifiers(prev => ({ ...prev, [newModKey]: { value: newModVal, type: newModType } }));
    setNewModVal('');
  };
  const removeModifier = (key: string) => setModifiers(prev => { const n = { ...prev }; delete n[key]; return n; });
  const toggleModType = (key: string) => setModifiers(prev => ({
    ...prev, [key]: { ...prev[key], type: prev[key].type === 'flat' ? 'percent' : 'flat' }
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Поле "название" обязательно'); return; }
    setLoading(true);
    setError('');
    try {
      const statModifiers: Record<string, number> = {};
      const statModifiersEx: Record<string, { value: number; type: string }> = {};
      for (const [k, entry] of Object.entries(modifiers)) {
        const n = parseFloat(entry.value);
        if (!isNaN(n)) {
          if (entry.type === 'percent') statModifiersEx[k] = { value: n, type: 'percent' };
          else statModifiers[k] = n;
        }
      }
      await onSave({ name: name.trim(), description, rarity, compatibleClasses: classes, statModifiers, statModifiersEx, avatar_url: avatarUrl });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 overflow-y-auto py-6">
      <div className="bg-card border border-border rounded-sm w-full max-w-lg shadow-xl mx-4">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-sm font-semibold">{editing ? 'Редактировать трактат' : 'Добавить трактат'}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><Icon name="X" size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-sm bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
              <Icon name="AlertCircle" size={12} /> {error}
            </div>
          )}
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Название *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="Железная Дисциплина" required />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Описание</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className={inputCls + ' resize-none'} rows={3} />
          </div>
          <AvatarUpload value={avatarUrl} onChange={setAvatarUrl} aspectRatio="1/1" label="Аватар трактата" folder="treaties" />
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Редкость</label>
            <select value={rarity} onChange={e => setRarity(e.target.value as Rarity)} className={inputCls}>
              {RARITIES.map(r => <option key={r} value={r}>{RARITY_LABELS[r]}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-2">Совместимые классы</label>
            <div className="flex flex-wrap gap-2">
              {UNIT_CLASSES.map(cls => (
                <button key={cls} type="button" onClick={() => toggleClass(cls)}
                  className={`px-3 py-1.5 text-xs rounded-sm border transition-colors ${classes.includes(cls) ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground hover:border-foreground/40'}`}>
                  {cls}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-2">Модификаторы характеристик</label>
            {Object.entries(modifiers).length > 0 && (
              <div className="space-y-1.5 mb-3">
                {Object.entries(modifiers).map(([key, entry]) => (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground font-mono-data flex-1 truncate">{STAT_LABELS[key] || key}</span>
                    <span className={`font-mono-data font-semibold ${parseFloat(entry.value) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {parseFloat(entry.value) >= 0 ? '+' : ''}{entry.value}{entry.type === 'percent' ? '%' : ''}
                    </span>
                    <button type="button" onClick={() => toggleModType(key)}
                      className={`px-1.5 py-0.5 rounded-sm border text-[10px] transition-colors ${entry.type === 'percent' ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:border-foreground/40'}`}>
                      {entry.type === 'percent' ? '%' : '#'}
                    </button>
                    <button type="button" onClick={() => removeModifier(key)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Icon name="X" size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <select value={newModKey} onChange={e => setNewModKey(e.target.value)} className="flex-1 bg-background border border-border rounded-sm px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                {statOptions.map(s => <option key={s} value={s}>{STAT_LABELS[s] || s}</option>)}
              </select>
              <input type="number" value={newModVal} onChange={e => setNewModVal(e.target.value)}
                className="w-20 bg-background border border-border rounded-sm px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="±знач." />
              <button type="button" onClick={() => setNewModType(t => t === 'flat' ? 'percent' : 'flat')}
                className={`px-2 py-1.5 text-xs rounded-sm border transition-colors ${newModType === 'percent' ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:border-foreground/40'}`}>
                {newModType === 'percent' ? '%' : '#'}
              </button>
              <button type="button" onClick={addModifier} className="px-3 py-1.5 text-xs bg-muted border border-border rounded-sm hover:bg-muted/80 transition-colors">
                + Добавить
              </button>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-sm hover:bg-muted transition-colors">Отмена</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {loading ? 'Сохраняем...' : (editing ? 'Сохранить' : 'Добавить')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── RarityBadge re-export for convenience ──
export { RarityBadge };
