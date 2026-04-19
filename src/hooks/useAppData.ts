import { useState, useEffect, useCallback } from 'react';
import { unitsApi, treatiesApi } from '@/lib/api';
import { Unit, Treaty, UnitStats } from '@/data/types';

// Конвертирует объект из API в тип Unit
function apiToUnit(u: Record<string, unknown>): Unit {
  return {
    id: u.id as string,
    name: u.name as string,
    class: u.class as Unit['class'],
    role: u.role as Unit['role'],
    rarity: u.rarity as Unit['rarity'],
    description: (u.description as string) || '',
    lore: (u.lore as string) || '',
    abilities: (u.abilities as string[]) || [],
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
