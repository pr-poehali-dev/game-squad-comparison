export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type UnitClass = 'Пехота' | 'Кавалерия' | 'Стрелки' | 'Осадные';
export type UnitRole = 'Танк' | 'Урон' | 'Поддержка' | 'Разведчик' | 'Контроль';

export type TraitColor = 'green' | 'gray' | 'red';

export interface Trait {
  name: string;
  description?: string;
  color?: TraitColor;
}

export interface UnitStats {
  // Основные
  health: number;           // Здоровье
  troops: number;           // Численность отряда
  leadership: number;       // Лидерство
  moveSpeed: number;        // Скорость движения
  rangeDistance: number;    // Дальность стрельбы
  ammo: number;             // Боезапас
  morale: number;           // Работоспособность / мораль

  // Атака
  piercingPenetration: number;  // Пробивание брони (проникающ.)
  slashingPenetration: number;  // Пробивание брони (рубящ.)
  bluntPenetration: number;     // Пробивание брони (дробящ.)
  piercingDamage: number;       // Проникающий урон
  slashingDamage: number;       // Рубящий урон
  bluntDamage: number;          // Дробящий урон

  // Защита
  piercingDefense: number;      // Защита (проникающ.)
  slashingDefense: number;      // Защита (рубящ.)
  bluntDefense: number;         // Защита (дробящ.)
  block: number;                // Блок
  blockRecovery: number;        // Восстановление показателя блока
}

export interface Treaty {
  id: string;
  name: string;
  description: string;
  statModifiers: Partial<UnitStats>;
  compatibleClasses: UnitClass[];
  rarity: Rarity;
  avatar_url?: string;
}

export interface Ability {
  name: string;
  description?: string;
  statModifiers?: Partial<UnitStats>;
}

export interface Unit {
  id: string;
  name: string;
  class: UnitClass;
  role: UnitRole | UnitRole[];
  rarity: Rarity;
  stats: UnitStats;
  description: string;
  lore: string;
  abilities: (string | Ability)[];
  traits?: Trait[];
  avatar_url?: string;
}