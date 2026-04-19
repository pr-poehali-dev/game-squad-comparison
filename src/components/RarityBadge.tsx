import { Rarity } from '@/data/types';

const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Обычный',
  uncommon: 'Необычный',
  rare: 'Редкий',
  epic: 'Уникальный',
  legendary: 'Легендарный',
};

interface RarityBadgeProps {
  rarity: Rarity;
  size?: 'sm' | 'md';
}

export default function RarityBadge({ rarity, size = 'sm' }: RarityBadgeProps) {
  return (
    <span className={`rarity-${rarity} font-mono-data uppercase tracking-widest ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
      {RARITY_LABELS[rarity]}
    </span>
  );
}