import { Rarity } from '@/data/types';

const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Обычный',
  uncommon: 'Необычный',
  rare: 'Редкій',
  epic: 'Уникальный',
  legendary: 'Легендарный',
};

/* Геральдические цвета ранга — тусклые, без неона */
const RARITY_HUE: Record<Rarity, string> = {
  common:    '30 10% 48%',
  uncommon:  '70 22% 38%',
  rare:      '198 30% 42%',
  epic:      '280 20% 40%',
  legendary: '14 62% 44%',
};

interface RarityBadgeProps {
  rarity: Rarity;
  size?: 'sm' | 'md';
}

export default function RarityBadge({ rarity, size = 'sm' }: RarityBadgeProps) {
  const hue = RARITY_HUE[rarity];
  return (
    <span
      className="inline-flex items-center uppercase"
      style={{
        fontFamily: '"IM Fell English SC", serif',
        fontSize: size === 'sm' ? '0.58rem' : '0.68rem',
        fontWeight: 400,
        letterSpacing: '0.18em',
        padding: size === 'sm' ? '2px 8px' : '3px 10px',
        background: `hsl(${hue} / 0.22)`,
        border: `1px solid hsl(${hue} / 0.75)`,
        boxShadow:
          `inset 0 1px 0 hsl(${hue} / 0.35), 0 1px 0 hsl(0 0% 0% / 0.4)`,
        color: `hsl(${hue})`,
        borderRadius: 0,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        clipPath: 'none',
        textShadow: '0 1px 0 hsl(0 0% 0% / 0.5)',
      }}
    >
      {RARITY_LABELS[rarity]}
    </span>
  );
}
