import { useState, useEffect, useCallback } from 'react';
import { unitsApi, treatiesApi } from '@/lib/api';
import { Unit, Treaty, UnitStats, Ability, Trait } from '@/data/types';

// Конвертирует abilities — поддерживает и строки, и объекты Ability
function parseAbilities(raw: unknown): (string | Ability)[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(item => {
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item !== null && 'name' in item) {
      return item as Ability;
    }
    return String(item);
  });
}

function parseRole(raw: unknown): Unit['role'] {
  if (Array.isArray(raw)) return raw as Unit['role'];
  if (typeof raw === 'string') return raw as Unit['role'];
  return 'Урон';
}

function parseTraits(raw: unknown): Trait[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(item => {
    if (typeof item === 'string') return { name: item };
    return item as Trait;
  });
}

// Конвертирует объект из API в тип Unit
function apiToUnit(u: Record<string, unknown>): Unit {
  return {
    id: u.id as string,
    name: u.name as string,
    class: u.class as Unit['class'],
    role: parseRole(u.role),
    rarity: u.rarity as Unit['rarity'],
    description: (u.description as string) || '',
    lore: (u.lore as string) || '',
    abilities: parseAbilities(u.abilities),
    traits: parseTraits(u.traits),
    avatar_url: (u.avatar_url as string) || '',
    stats: (u.stats as UnitStats) || {} as UnitStats,
  };
}

// Конвертирует объект из API в тип Treaty
function apiToTreaty(t: Record<string, unknown>): Treaty {
  return {
    id: t.id as string,
    name: t.name as string,
    description: (t.description as string) || '',
    compatibleClasses: (t.compatibleClasses as Treaty['compatibleClasses']) || [],
    rarity: t.rarity as Treaty['rarity'],
    statModifiers: (t.statModifiers as Partial<UnitStats>) || {},
    avatar_url: (t.avatar_url as string) || '',
  };
}

let cachedUnits: Unit[] | null = null;
let cachedTreaties: Treaty[] | null = null;
let unitsPromise: Promise<Unit[]> | null = null;
let treatiesPromise: Promise<Treaty[]> | null = null;

export function useUnits() {
  const [units, setUnits] = useState<Unit[]>(cachedUnits || []);
  const [loading, setLoading] = useState(!cachedUnits);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (cachedUnits) { setUnits(cachedUnits); setLoading(false); return; }
    if (!unitsPromise) {
      unitsPromise = unitsApi.list().then(data => {
        const mapped = (data.units as Record<string, unknown>[]).map(apiToUnit);
        cachedUnits = mapped;
        return mapped;
      });
    }
    try {
      const result = await unitsPromise;
      setUnits(result);
    } catch {
      setError('Не удалось загрузить отряды');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const invalidate = () => {
    cachedUnits = null;
    unitsPromise = null;
    setLoading(true);
    load();
  };

  return { units, loading, error, invalidate };
}

export function useTreaties() {
  const [treaties, setTreaties] = useState<Treaty[]>(cachedTreaties || []);
  const [loading, setLoading] = useState(!cachedTreaties);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (cachedTreaties) { setTreaties(cachedTreaties); setLoading(false); return; }
    if (!treatiesPromise) {
      treatiesPromise = treatiesApi.list().then(data => {
        const mapped = (data.treaties as Record<string, unknown>[]).map(apiToTreaty);
        cachedTreaties = mapped;
        return mapped;
      });
    }
    try {
      const result = await treatiesPromise;
      setTreaties(result);
    } catch {
      setError('Не удалось загрузить трактаты');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const invalidate = () => {
    cachedTreaties = null;
    treatiesPromise = null;
    setLoading(true);
    load();
  };

  return { treaties, loading, error, invalidate };
}