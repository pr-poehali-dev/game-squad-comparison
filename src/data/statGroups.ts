import { UnitStats } from './types';

export interface StatDef {
  key: keyof UnitStats;
  label: string;
  max: number;
  unit?: string;
}

export interface StatGroup {
  label: string;
  icon: string;
  color: string;
  stats: StatDef[];
}

export const STAT_GROUPS: StatGroup[] = [
  {
    label: 'Основные',
    icon: 'Shield',
    color: 'text-blue-400',
    stats: [
      { key: 'health',        label: 'Здоровье',          max: 100 },
      { key: 'troops',        label: 'Численность',        max: 300 },
      { key: 'leadership',    label: 'Лидерство',          max: 100 },
      { key: 'moveSpeed',     label: 'Скорость движения',  max: 100 },
      { key: 'rangeDistance', label: 'Дальность стрельбы', max: 12, unit: 'кл.' },
      { key: 'ammo',          label: 'Боезапас',           max: 40 },
      { key: 'morale',        label: 'Работоспособность',  max: 100 },
    ],
  },
  {
    label: 'Атака',
    icon: 'Swords',
    color: 'text-red-400',
    stats: [
      { key: 'piercingPenetration', label: 'Пробивание (проникающ.)', max: 100 },
      { key: 'slashingPenetration', label: 'Пробивание (рубящ.)',      max: 100 },
      { key: 'bluntPenetration',    label: 'Пробивание (дробящ.)',     max: 100 },
      { key: 'piercingDamage',      label: 'Проникающий урон',         max: 100 },
      { key: 'slashingDamage',      label: 'Рубящий урон',             max: 100 },
      { key: 'bluntDamage',         label: 'Дробящий урон',            max: 100 },
    ],
  },
  {
    label: 'Защита',
    icon: 'ShieldCheck',
    color: 'text-green-400',
    stats: [
      { key: 'piercingDefense', label: 'Защита (проникающ.)', max: 100 },
      { key: 'slashingDefense', label: 'Защита (рубящ.)',      max: 100 },
      { key: 'bluntDefense',    label: 'Защита (дробящ.)',     max: 100 },
      { key: 'block',           label: 'Блок',                 max: 100 },
      { key: 'blockRecovery',   label: 'Восстановление блока', max: 100 },
    ],
  },
];

// Flat list for compare table
export const ALL_STATS: StatDef[] = STAT_GROUPS.flatMap(g => g.stats);

// Short labels for cards
export const CARD_STATS: StatDef[] = [
  { key: 'health',        label: 'Здоровье',   max: 100 },
  { key: 'slashingDamage',label: 'Руб. урон',  max: 100 },
  { key: 'piercingDamage',label: 'Прон. урон', max: 100 },
  { key: 'slashingDefense',label: 'Руб. защ.', max: 100 },
  { key: 'block',         label: 'Блок',       max: 100 },
  { key: 'moveSpeed',     label: 'Скорость',   max: 100 },
];
