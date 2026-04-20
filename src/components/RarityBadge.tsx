import { Rarity } from '@/data/types';

const RARITY_LABELS: Record<Rarity, string> = {
  common:    'Обычный',
  uncommon:  'Необычный',
  rare:      'Редкий',
  epic:      'Уникальный',
  legendary: 'Легендарный',
};

/* Фоны для каждой редкости — полупрозрачные */
const RARITY_BG: Record<Rarity, string> = {
  common:    'hsl(215 18% 52% / 0.1)',
  uncommon:  'hsl(148 52% 44% / 0.1)',
  rare:      'hsl(210 88% 58% / 0.1)',
  epic:      'hsl(272 68% 62% / 0.1)',
  legendary: 'hsl(42 90% 52% / 0.12)',
};

const RARITY_BORDER: Record<Rarity, string> = {
  common:    'hsl(215 18% 52% / 0.2)',
  uncommon:  'hsl(148 52% 44% / 0.25)',
  rare:      'hsl(210 88% 58% / 0.25)',
  epic:      'hsl(272 68% 62% / 0.25)',
  legendary: 'hsl(42 90% 52% / 0.35)',
};

interface RarityBadgeProps {
  rarity: Rarity;
  size?: 'sm' | 'md';
}

export default function RarityBadge({ rarity, size = 'sm' }: RarityBadgeProps) {
  return (
    <span
      className={`rarity-${rarity} inline-flex items-center`}
      style={{
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: size === 'sm' ? '0.6rem' : '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        padding: size === 'sm' ? '1px 5px' : '2px 7px',
        background: RARITY_BG[rarity],
        border: `1px solid ${RARITY_BORDER[rarity]}`,
        borderRadius: '2px',
        clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {RARITY_LABELS[rarity]}
    </span>
  );
}
