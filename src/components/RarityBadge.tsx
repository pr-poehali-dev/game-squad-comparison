import { Rarity } from '@/data/types';

const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Обычный',
  uncommon: 'Необычный',
  rare: 'Редкий',
  epic: 'Уникальный',
  legendary: 'Легендарный',
};

const RARITY_HUE: Record<Rarity, string> = {
  common:    '220 10% 60%',
  uncommon:  '150 48% 50%',
  rare:      '210 78% 58%',
  epic:      '282 58% 60%',
  legendary: '18 84% 58%',
};

interface RarityBadgeProps {
  rarity: Rarity;
  size?: 'sm' | 'md';
}

export default function RarityBadge({ rarity, size = 'sm' }: RarityBadgeProps) {
  const hue = RARITY_HUE[rarity];
  return (
    <span
      className="inline-flex items-center uppercase backdrop-blur-sm"
      style={{
        fontFamily: 'Manrope, sans-serif',
        fontSize: size === 'sm' ? '0.6rem' : '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.14em',
        padding: size === 'sm' ? '3px 9px' : '4px 11px',
        background: `linear-gradient(135deg, hsl(${hue} / 0.3) 0%, hsl(${hue} / 0.12) 100%)`,
        border: `1px solid hsl(${hue} / 0.6)`,
        boxShadow:
          `inset 0 1px 0 hsl(${hue} / 0.35), 0 4px 10px hsl(${hue} / 0.25), 0 0 0 1px hsl(222 20% 5% / 0.6)`,
        color: `hsl(${hue})`,
        borderRadius: '6px',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        textShadow: '0 1px 0 hsl(0 0% 0% / 0.5)',
      }}
    >
      {RARITY_LABELS[rarity]}
    </span>
  );
}
