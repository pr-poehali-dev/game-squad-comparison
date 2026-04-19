import { useState, useEffect, useCallback } from 'react';
import { unitsApi, treatiesApi, seedApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useUnits, useTreaties } from '@/hooks/useAppData';
import Icon from '@/components/ui/icon';
import RarityBadge from '@/components/RarityBadge';
import { Rarity, UnitClass, UnitRole } from '@/data/types';

type AdminTab = 'units' | 'treaties';

const UNIT_CLASSES: UnitClass[] = ['Пехота', 'Кавалерия', 'Стрелки', 'Осадные', 'Магические'];
const UNIT_ROLES: UnitRole[] = ['Танк', 'Урон', 'Поддержка', 'Разведчик', 'Контроль'];
const RARITIES: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const RARITY_LABELS: Record<Rarity, string> = { common: 'Обычный', uncommon: 'Необычный', rare: 'Редкий', epic: 'Эпический', legendary: 'Легендарный' };

const DEFAULT_UNIT_STATS = {
  health: 0, troops: 0, leadership: 0, moveSpeed: 0, rangeDistance: 0, ammo: 0, morale: 0,
  piercingPenetration: 0, slashingPenetration: 0, bluntPenetration: 0,
  piercingDamage: 0, slashingDamage: 0, bluntDamage: 0,
  piercingDefense: 0, slashingDefense: 0, bluntDefense: 0,
  block: 0, blockRecovery: 0,
};

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
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

function ConfirmModal({ name, type, onConfirm, onCancel }: { name: string; type: string; onConfirm: () => void; onCancel: () => void }) {
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

// ───── Unit Form ─────
interface UnitFormData {
  name: string;
  class: UnitClass;
  role: UnitRole;
  rarity: Rarity;
  description: string;
  lore: string;
  abilities: string;
  stats: typeof DEFAULT_UNIT_STATS;
}

function UnitModal({ unit, onSave, onClose }: {
  unit?: Record<string, unknown> | null;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
}) {
  const editing = !!unit;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<UnitFormData>({
    name: (unit?.name as string) || '',
    class: (unit?.class as UnitClass) || 'Пехота',
    role: (unit?.role as UnitRole) || 'Урон',
    rarity: (unit?.rarity as Rarity) || 'common',
    description: (unit?.description as string) || '',
    lore: (unit?.lore as string) || '',
    abilities: ((unit?.abilities as string[]) || []).join(', '),
    stats: { ...DEFAULT_UNIT_STATS, ...((unit?.stats as Record<string, number>) || {}) },
  });

  const set = (key: keyof UnitFormData, val: unknown) => setForm(f => ({ ...f, [key]: val }));
  const setStat = (key: string, val: string) => setForm(f => ({ ...f, stats: { ...f.stats, [key]: parseInt(val) || 0 } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Поле "название" обязательно'); return; }
    setLoading(true);
    setError('');
    try {
      await onSave({
        name: form.name.trim(),
        class: form.class,
        role: form.role,
        rarity: form.rarity,
        description: form.description,
        lore: form.lore,
        abilities: form.abilities.split(',').map(s => s.trim()).filter(Boolean),
        stats: form.stats,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-background border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";
  const statKeys = Object.keys(DEFAULT_UNIT_STATS);

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
              <label className="text-xs text-muted-foreground block mb-1.5">Роль</label>
              <select value={form.role} onChange={e => set('role', e.target.value)} className={inputCls}>
                {UNIT_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Редкость</label>
              <select value={form.rarity} onChange={e => set('rarity', e.target.value)} className={inputCls}>
                {RARITIES.map(r => <option key={r} value={r}>{RARITY_LABELS[r]}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-1.5">Описание</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} className={inputCls + ' resize-none'} rows={2} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-1.5">Лор</label>
              <textarea value={form.lore} onChange={e => set('lore', e.target.value)} className={inputCls + ' resize-none'} rows={2} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-1.5">Способности (через запятую)</label>
              <input type="text" value={form.abilities} onChange={e => set('abilities', e.target.value)} className={inputCls} placeholder="Щитовая стена, Боевое закалывание" />
            </div>
          </div>

          <div>
            <h4 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Характеристики</h4>
            <div className="grid grid-cols-3 gap-3">
              {statKeys.map(key => (
                <div key={key}>
                  <label className="text-[10px] text-muted-foreground block mb-1">{key}</label>
                  <input
                    type="number"
                    value={form.stats[key as keyof typeof DEFAULT_UNIT_STATS]}
                    onChange={e => setStat(key, e.target.value)}
                    className={inputCls + ' font-mono-data'}
                    min={-9999} max={9999}
                  />
                </div>
              ))}
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

// ───── Treaty Form ─────
function TreatyModal({ treaty, onSave, onClose }: {
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
  const [modifiers, setModifiers] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries((treaty?.statModifiers as Record<string, number>) || {}).map(([k, v]) => [k, String(v)]))
  );
  const [newModKey, setNewModKey] = useState('health');
  const [newModVal, setNewModVal] = useState('');

  const inputCls = "w-full bg-background border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  const toggleClass = (cls: UnitClass) => {
    setClasses(prev => prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]);
  };

  const addModifier = () => {
    if (!newModVal) return;
    setModifiers(prev => ({ ...prev, [newModKey]: newModVal }));
    setNewModVal('');
  };

  const removeModifier = (key: string) => {
    setModifiers(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Поле "название" обязательно'); return; }
    setLoading(true);
    setError('');
    try {
      const statModifiers: Record<string, number> = {};
      for (const [k, v] of Object.entries(modifiers)) {
        const n = parseFloat(v);
        if (!isNaN(n)) statModifiers[k] = n;
      }
      await onSave({ name: name.trim(), description, rarity, compatibleClasses: classes, statModifiers });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  const statOptions = Object.keys(DEFAULT_UNIT_STATS);

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
                <button
                  key={cls}
                  type="button"
                  onClick={() => toggleClass(cls)}
                  className={`px-3 py-1.5 text-xs rounded-sm border transition-colors ${
                    classes.includes(cls) ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground hover:border-foreground/40'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-2">Модификаторы характеристик</label>
            {Object.entries(modifiers).length > 0 && (
              <div className="space-y-1.5 mb-3">
                {Object.entries(modifiers).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground font-mono-data w-40">{key}</span>
                    <span className={`font-mono-data font-semibold ${parseFloat(val) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {parseFloat(val) >= 0 ? '+' : ''}{val}
                    </span>
                    <button type="button" onClick={() => removeModifier(key)} className="ml-auto text-muted-foreground hover:text-destructive transition-colors">
                      <Icon name="X" size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <select value={newModKey} onChange={e => setNewModKey(e.target.value)} className="flex-1 bg-background border border-border rounded-sm px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                {statOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input
                type="number"
                value={newModVal}
                onChange={e => setNewModVal(e.target.value)}
                className="w-24 bg-background border border-border rounded-sm px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="±значение"
              />
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

// ───── Main AdminPage ─────
export default function AdminPage() {
  const { user } = useAuth();
  const { invalidate: invalidateUnits } = useUnits();
  const { invalidate: invalidateTreaties } = useTreaties();
  const [tab, setTab] = useState<AdminTab>('units');
  const [units, setUnits] = useState<Record<string, unknown>[]>([]);
  const [treaties, setTreaties] = useState<Record<string, unknown>[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [seedLoading, setSeedLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string; kind: 'unit' | 'treaty' } | null>(null);
  const [unitModal, setUnitModal] = useState<{ open: boolean; unit?: Record<string, unknown> | null }>({ open: false });
  const [treatyModal, setTreatyModal] = useState<{ open: boolean; treaty?: Record<string, unknown> | null }>({ open: false });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [u, t] = await Promise.all([unitsApi.list(), treatiesApi.list()]);
      setUnits(u.units || []);
      setTreaties(t.treaties || []);
    } catch {
      showToast('Ошибка загрузки данных', 'error');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSeed = async () => {
    setSeedLoading(true);
    try {
      const res = await seedApi.run();
      const u = res.units as { inserted: number; skipped: number };
      const t = res.treaties as { inserted: number; skipped: number };
      showToast(`Импортировано: ${u.inserted} отрядов, ${t.inserted} трактатов`);
      await loadData();
      invalidateUnits();
      invalidateTreaties();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Ошибка импорта', 'error');
    } finally {
      setSeedLoading(false);
    }
  };

  const handleSaveUnit = async (data: Record<string, unknown>) => {
    if (unitModal.unit) {
      await unitsApi.update(unitModal.unit.id as string, data);
      showToast('Отряд успешно обновлён');
    } else {
      await unitsApi.create(data);
      showToast('Отряд успешно добавлен');
    }
    await loadData();
    invalidateUnits();
  };

  const handleSaveTreaty = async (data: Record<string, unknown>) => {
    if (treatyModal.treaty) {
      await treatiesApi.update(treatyModal.treaty.id as string, data);
      showToast('Трактат успешно обновлён');
    } else {
      await treatiesApi.create(data);
      showToast('Трактат успешно добавлен');
    }
    await loadData();
    invalidateTreaties();
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.kind === 'unit') {
        await unitsApi.delete(confirmDelete.id);
        showToast('Отряд успешно удалён');
        invalidateUnits();
      } else {
        await treatiesApi.delete(confirmDelete.id);
        showToast('Трактат успешно удалён');
        invalidateTreaties();
      }
      await loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Ошибка удаления', 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  if (!user?.is_admin) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center space-y-3">
          <Icon name="ShieldOff" size={32} className="text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">Доступ только для администраторов</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-base font-semibold text-foreground" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.05em' }}>
            ПАНЕЛЬ УПРАВЛЕНИЯ
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Управление данными справочника</p>
        </div>
        <button
          onClick={handleSeed}
          disabled={seedLoading}
          className="flex items-center gap-2 px-3 py-2 text-xs border border-border rounded-sm hover:bg-muted disabled:opacity-50 transition-colors"
        >
          <Icon name={seedLoading ? 'Loader' : 'Download'} size={13} className={seedLoading ? 'animate-spin' : ''} />
          Импортировать базовые данные
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {(['units', 'treaties'] as AdminTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px ${
              tab === t ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'units' ? 'Отряды' : 'Трактаты'}
          </button>
        ))}
      </div>

      {/* Units Tab */}
      {tab === 'units' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground">{units.length} отрядов</span>
            <button
              onClick={() => setUnitModal({ open: true, unit: null })}
              className="flex items-center gap-2 px-3 py-2 text-xs bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
            >
              <Icon name="Plus" size={13} /> Добавить отряд
            </button>
          </div>
          {loadingData ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Загрузка...</div>
          ) : units.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Отрядов пока нет</div>
          ) : (
            <div className="space-y-2">
              {units.map(unit => (
                <div key={unit.id as string} className="bg-card border border-border rounded-sm p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">{unit.name as string}</span>
                      <RarityBadge rarity={unit.rarity as Rarity} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{unit.class as string}</span>
                      <span>·</span>
                      <span>{unit.role as string}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setUnitModal({ open: true, unit })}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-sm hover:bg-muted transition-colors"
                    >
                      <Icon name="Pencil" size={11} /> Редактировать
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ id: unit.id as string, name: unit.name as string, kind: 'unit' })}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-destructive/40 text-destructive rounded-sm hover:bg-destructive/10 transition-colors"
                    >
                      <Icon name="Trash2" size={11} /> Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Treaties Tab */}
      {tab === 'treaties' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground">{treaties.length} трактатов</span>
            <button
              onClick={() => setTreatyModal({ open: true, treaty: null })}
              className="flex items-center gap-2 px-3 py-2 text-xs bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
            >
              <Icon name="Plus" size={13} /> Добавить трактат
            </button>
          </div>
          {loadingData ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Загрузка...</div>
          ) : treaties.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Трактатов пока нет</div>
          ) : (
            <div className="space-y-2">
              {treaties.map(treaty => (
                <div key={treaty.id as string} className="bg-card border border-border rounded-sm p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">{treaty.name as string}</span>
                      <RarityBadge rarity={treaty.rarity as Rarity} />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{treaty.description as string}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTreatyModal({ open: true, treaty })}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-sm hover:bg-muted transition-colors"
                    >
                      <Icon name="Pencil" size={11} /> Редактировать
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ id: treaty.id as string, name: treaty.name as string, kind: 'treaty' })}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-destructive/40 text-destructive rounded-sm hover:bg-destructive/10 transition-colors"
                    >
                      <Icon name="Trash2" size={11} /> Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {unitModal.open && (
        <UnitModal unit={unitModal.unit} onSave={handleSaveUnit} onClose={() => setUnitModal({ open: false })} />
      )}
      {treatyModal.open && (
        <TreatyModal treaty={treatyModal.treaty} onSave={handleSaveTreaty} onClose={() => setTreatyModal({ open: false })} />
      )}
      {confirmDelete && (
        <ConfirmModal
          name={confirmDelete.name}
          type={confirmDelete.kind === 'unit' ? 'отряд' : 'трактат'}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}