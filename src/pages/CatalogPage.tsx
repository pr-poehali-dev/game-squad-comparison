import { useState, useMemo } from 'react';
import { useUnits } from '@/hooks/useAppData';
import { UnitClass, UnitRole, Rarity } from '@/data/types';
import UnitCard from '@/components/UnitCard';
import Icon from '@/components/ui/icon';

const CLASSES: UnitClass[] = ['Пехота', 'Кавалерия', 'Стрелки', 'Осадные'];
const ROLES: UnitRole[] = ['Танк', 'Урон', 'Поддержка', 'Разведчик', 'Контроль'];
const RARITIES: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Обычный', uncommon: 'Необычный', rare: 'Редкий', epic: 'Уникальный', legendary: 'Легендарный'
};

interface CatalogPageProps {
  onSelectUnit: (id: string) => void;
}

export default function CatalogPage({ onSelectUnit }: CatalogPageProps) {
  const { units: UNITS, loading } = useUnits();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState<UnitClass | ''>('');
  const [roleFilter, setRoleFilter] = useState<UnitRole | ''>('');
  const [rarityFilter, setRarityFilter] = useState<Rarity | ''>('');
  const [sortBy, setSortBy] = useState<'name' | 'attack' | 'defense' | 'leadership' | 'stars'>('name');

  const filtered = useMemo(() => {
    return UNITS
      .filter(u => {
        if (search && !u.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (classFilter && u.class !== classFilter) return false;
        if (roleFilter) {
          const roles = Array.isArray(u.role) ? u.role : [u.role];
          if (!roles.includes(roleFilter as import('@/data/types').UnitRole)) return false;
        }
        if (rarityFilter && u.rarity !== rarityFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name, 'ru');
        if (sortBy === 'attack') return b.stats.slashingDamage - a.stats.slashingDamage;
        if (sortBy === 'defense') return b.stats.slashingDefense - a.stats.slashingDefense;
        if (sortBy === 'leadership') return b.stats.leadership - a.stats.leadership;
        if (sortBy === 'stars') return (b.stars ?? 0) - (a.stars ?? 0);
        return 0;
      });
  }, [search, classFilter, roleFilter, rarityFilter, sortBy]);

  const clearFilters = () => {
    setSearch(''); setClassFilter(''); setRoleFilter(''); setRarityFilter('');
  };

  const hasFilters = search || classFilter || roleFilter || rarityFilter;

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
      <Icon name="Loader" size={18} className="animate-spin mr-2" /> Загрузка...
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-foreground mb-1">Каталог Отрядов</h1>
        <p className="text-muted-foreground text-sm">
          {filtered.length} из {UNITS.length} отрядов
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-sm p-4 mb-6 space-y-3">
        {/* Search */}
        <div className="relative">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-muted border border-border rounded-sm pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-2">
          <select
            value={classFilter}
            onChange={e => setClassFilter(e.target.value as UnitClass | '')}
            className="bg-muted border border-border rounded-sm px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Все классы</option>
            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as UnitRole | '')}
            className="bg-muted border border-border rounded-sm px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Все роли</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select
            value={rarityFilter}
            onChange={e => setRarityFilter(e.target.value as Rarity | '')}
            className="bg-muted border border-border rounded-sm px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Вся редкость</option>
            {RARITIES.map(r => <option key={r} value={r}>{RARITY_LABELS[r]}</option>)}
          </select>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Сортировка:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="bg-muted border border-border rounded-sm px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="name">По названию</option>
              <option value="stars">По рейтингу ★</option>
              <option value="attack">По атаке</option>
              <option value="defense">По защите</option>
              <option value="leadership">По лидерству</option>
            </select>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <Icon name="X" size={12} />
                Сбросить
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Icon name="SearchX" size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Отряды не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(unit => (
            <UnitCard key={unit.id} unit={unit} onClick={() => onSelectUnit(unit.id)} />
          ))}
        </div>
      )}
    </div>
  );
}