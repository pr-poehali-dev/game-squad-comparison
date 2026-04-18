export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type UnitClass = 'Пехота' | 'Кавалерия' | 'Стрелки' | 'Осадные' | 'Магические';
export type UnitRole = 'Танк' | 'Урон' | 'Поддержка' | 'Разведчик' | 'Контроль';

export interface UnitStats {
  attack: number;
  defense: number;
  speed: number;
  health: number;
  morale: number;
  range: number;
}

export interface Treaty {
  id: string;
  name: string;
  description: string;
  statModifiers: Partial<UnitStats>;
  compatibleClasses: UnitClass[];
  rarity: Rarity;
}

export interface Unit {
  id: string;
  name: string;
  class: UnitClass;
  role: UnitRole;
  rarity: Rarity;
  stats: UnitStats;
  description: string;
  lore: string;
  abilities: string[];
  cost: number;
  upkeep: number;
  appliedTreaties?: string[];
}
