import { useState, useMemo } from 'react';
import { useUnits, useRoles } from '@/hooks/useAppData';
import { UnitClass, Rarity } from '@/data/types';
import UnitCard from '@/components/UnitCard';
import Icon from '@/components/ui/icon';

const CLASSES: UnitClass[] = ['Пехота', 'Кавалерия', 'Стрелки', 'Осадные'];
const RARITIES: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Обычный',
  uncommon: 'Необычный',
  rare: 'Редкий',
  epic: 'Уникальный',
  legendary: 'Легендарный',
};

interface CatalogPageProps {
  onSelectUnit: (id: string) => void;
}

export default function CatalogPage({ onSelectUnit }: CatalogPageProps) {
  const { units: UNITS, loading } = useUnits();
  const { roles } = useRoles();

  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState<UnitClass | ''>('');
  const [roleFilter, setRoleFilter] = useState('');
  const [rarityFilter, setRarityFilter] = useState<Rarity | ''>('');
  const [sortBy, setSortBy] = useState<
    'name' | 'attack' | 'defense' | 'leadership' | 'stars'
  >('name');

  const filtered = useMemo(() => {
    return UNITS.filter(u => {
      if (search && !u.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (classFilter && u.class !== classFilter) return false;
      if (roleFilter) {
        const unitRoles = Array.isArray(u.role) ? u.role : [u.role];
        if (!unitRoles.includes(roleFilter as import('@/data/types').UnitRole)) return false;
      }
      if (rarityFilter && u.rarity !== rarityFilter) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'ru');
      if (sortBy === 'attack') return b.stats.slashingDamage - a.stats.slashingDamage;
      if (sortBy === 'defense') return b.stats.slashingDefense - a.stats.slashingDefense;
      if (sortBy === 'leadership') return b.stats.leadership - a.stats.leadership;
      if (sortBy === 'stars') return (b.stars ?? 0) - (a.stars ?? 0);
      return 0;
    });
  }, [search, classFilter, roleFilter, rarityFilter, sortBy, UNITS]);

  const clearFilters = () => {
    setSearch('');
    setClassFilter('');
    setRoleFilter('');
    setRarityFilter('');
  };

  const hasFilters = search || classFilter || roleFilter || rarityFilter;

  if (loading)
    return (
      <div className="flex items-center justify-center py-28 text-muted-foreground">
        <Icon name="Loader" size={18} className="animate-spin mr-2" />
        <span className="font-fell italic">составляется реестръ…</span>
      </div>
    );

  const selectStyle: React.CSSProperties = {
    fontFamily: '"IM Fell English", serif',
    fontSize: '0.88rem',
    color: 'hsl(40 24% 82%)',
    background: 'hsl(24 10% 9%)',
    border: '1px solid hsl(30 14% 22%)',
    padding: '0.4rem 0.7rem',
    borderRadius: 0,
    boxShadow: 'inset 0 1px 0 hsl(0 0% 0% / 0.4)',
    outline: 'none',
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* ── ЗАГОЛОВОК — гербовой лист ─────────────────────── */}
      <header className="mb-10 relative">
        <div className="flex items-center justify-center gap-4 mb-3">
          <span className="flex-1 h-px bg-primary/30" />
          <span className="w-2 h-2 bg-primary rotate-45" />
          <span
            className="uppercase"
            style={{
              fontFamily: '"IM Fell English SC", serif',
              fontSize: '0.72rem',
              letterSpacing: '0.42em',
              color: 'hsl(18 52% 52%)',
            }}
          >
            Гильдейскiй реэстръ
          </span>
          <span className="w-2 h-2 bg-primary rotate-45" />
          <span className="flex-1 h-px bg-primary/30" />
        </div>

        <h1
          className="text-center"
          style={{
            fontFamily: '"UnifrakturCook", serif',
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            fontWeight: 700,
            color: 'hsl(40 38% 90%)',
            textShadow:
              '0 2px 0 hsl(0 0% 0% / 0.7), 0 0 30px hsl(18 52% 42% / 0.25)',
            letterSpacing: '0.01em',
            lineHeight: 1,
          }}
        >
          Книга Отрядовъ
        </h1>

        <p
          className="text-center mt-3 italic"
          style={{
            fontFamily: '"IM Fell English", serif',
            fontSize: '1.05rem',
            color: 'hsl(30 18% 58%)',
          }}
        >
          Записи о всехъ ротахъ, хоругвяхъ и дружинахъ, ведомыхъ сей гильдiею.
        </p>

        <div
          className="mt-5 text-center font-mono-data"
          style={{ color: 'hsl(18 52% 42% / 0.8)', fontSize: '0.72rem', letterSpacing: '0.28em' }}
        >
          {String(filtered.length).padStart(3, '0')} ⁄ {String(UNITS.length).padStart(3, '0')} ВНЕСЕНО
        </div>
      </header>

      {/* ── ПАНЕЛЬ ФИЛЬТРОВ — писцовая таблица ─────────────── */}
      <div
        className="mb-8 relative"
        style={{
          background:
            'linear-gradient(180deg, hsl(26 12% 10%) 0%, hsl(22 10% 7%) 100%)',
          border: '1px solid hsl(30 14% 20%)',
          boxShadow:
            'inset 0 1px 0 hsl(30 30% 28% / 0.2), 0 4px 14px hsl(0 0% 0% / 0.35)',
        }}
      >
        {/* Геральдические уголки */}
        <span className="absolute -top-[3px] -left-[3px] w-[6px] h-[6px] bg-primary rotate-45" />
        <span className="absolute -top-[3px] -right-[3px] w-[6px] h-[6px] bg-primary rotate-45" />
        <span className="absolute -bottom-[3px] -left-[3px] w-[6px] h-[6px] bg-primary rotate-45" />
        <span className="absolute -bottom-[3px] -right-[3px] w-[6px] h-[6px] bg-primary rotate-45" />

        <div className="p-5 space-y-4">
          {/* Поиск */}
          <div className="relative">
            <Icon
              name="Search"
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: 'hsl(18 52% 45%)' }}
            />
            <input
              type="text"
              placeholder="Найти отрядъ по имени…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-3"
              style={{
                ...selectStyle,
                padding: '0.65rem 0.8rem 0.65rem 2.4rem',
                fontSize: '1rem',
                fontStyle: 'italic',
              }}
            />
          </div>

          {/* Фильтры */}
          <div className="flex flex-wrap items-center gap-2.5">
            <FilterLabel>Классъ</FilterLabel>
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value as UnitClass | '')}
              style={selectStyle}
            >
              <option value="">Всякiй</option>
              {CLASSES.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <FilterLabel>Назначенiе</FilterLabel>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="">Всякое</option>
              {roles.map(r => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>

            <FilterLabel>Рангъ</FilterLabel>
            <select
              value={rarityFilter}
              onChange={e => setRarityFilter(e.target.value as Rarity | '')}
              style={selectStyle}
            >
              <option value="">Всякiй</option>
              {RARITIES.map(r => (
                <option key={r} value={r}>
                  {RARITY_LABELS[r]}
                </option>
              ))}
            </select>

            <div className="ml-auto flex items-center gap-2">
              <FilterLabel>Упорядочить</FilterLabel>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                style={selectStyle}
              >
                <option value="name">по имени</option>
                <option value="stars">по звёздамъ</option>
                <option value="attack">по натиску</option>
                <option value="defense">по защите</option>
                <option value="leadership">по лидерству</option>
              </select>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-2 transition-colors"
                  style={{
                    fontFamily: '"IM Fell English", serif',
                    fontSize: '0.85rem',
                    fontStyle: 'italic',
                    color: 'hsl(30 12% 58%)',
                    border: '1px solid hsl(30 14% 22%)',
                    background: 'transparent',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'hsl(4 62% 58%)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'hsl(30 12% 58%)')}
                >
                  <Icon name="X" size={13} />
                  сбросить
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── СЕТКА ОТРЯДОВ ─ */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <Icon
            name="ScrollText"
            size={56}
            className="mx-auto mb-4"
            style={{ color: 'hsl(18 52% 42% / 0.35)' }}
          />
          <p
            className="italic"
            style={{
              fontFamily: '"IM Fell English", serif',
              fontSize: '1.1rem',
              color: 'hsl(30 14% 52%)',
            }}
          >
            Ни одного отряда по сему условiю не найдено.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(unit => (
            <UnitCard
              key={unit.id}
              unit={unit}
              onClick={() => onSelectUnit(unit.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="uppercase"
      style={{
        fontFamily: '"IM Fell English SC", serif',
        fontSize: '0.62rem',
        letterSpacing: '0.28em',
        color: 'hsl(18 52% 48%)',
      }}
    >
      {children}
    </span>
  );
}
