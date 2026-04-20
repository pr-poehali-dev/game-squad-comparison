import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRoles } from '@/hooks/useAppData';

function TooltipPortal({ role, description, anchorRef }: {
  role: string;
  description: string;
  anchorRef: React.RefObject<HTMLSpanElement | null>;
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
  }, [anchorRef]);

  return createPortal(
    <div style={{
      position: 'fixed',
      left: pos.x,
      top: pos.y,
      transform: 'translate(-50%, -100%)',
      zIndex: 9999,
      width: '200px',
      padding: '8px 12px',
      background: 'hsl(224 20% 9%)',
      border: '1px solid hsl(42 90% 52% / 0.35)',
      borderRadius: '3px',
      boxShadow: '0 12px 32px hsl(0 0% 0% / 0.6)',
      pointerEvents: 'none',
    }}>
      <div style={{
        fontFamily: 'Cinzel, serif',
        fontSize: '0.6rem',
        fontWeight: 600,
        color: 'hsl(42 90% 52%)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: '4px',
      }}>
        {role}
      </div>
      <div style={{
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '0.75rem',
        lineHeight: 1.5,
        color: 'hsl(38 15% 72%)',
      }}>
        {description}
      </div>
      {/* Стрелка вниз */}
      <div style={{
        position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
        borderTop: '6px solid hsl(42 90% 52% / 0.35)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
        borderTop: '5px solid hsl(224 20% 9%)',
      }} />
    </div>,
    document.body
  );
}

interface RoleTooltipProps {
  role: string;
  showDot?: boolean;
  size?: 'sm' | 'md';
}

export default function RoleTooltip({ role, showDot = false, size = 'sm' }: RoleTooltipProps) {
  const { roles: roleDefs } = useRoles();
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  const def = roleDefs.find(r => r.name === role);
  const description = def?.description;

  const fontSize = size === 'sm' ? '0.6rem' : '0.85rem';
  const color = size === 'sm' ? 'hsl(215 18% 42%)' : 'hsl(215 18% 60%)';

  return (
    <span className="inline-flex items-center gap-1">
      {showDot && (
        <span style={{ color: 'hsl(215 18% 30%)', fontSize: '0.5rem' }}>·</span>
      )}
      <span
        ref={ref}
        onMouseEnter={() => description && setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontSize,
          color,
          letterSpacing: '0.04em',
          cursor: description ? 'help' : 'default',
          borderBottom: description ? '1px dotted hsl(215 18% 35%)' : 'none',
          display: 'inline-block',
        }}
      >
        {role}
      </span>
      {visible && description && (
        <TooltipPortal role={role} description={description} anchorRef={ref} />
      )}
    </span>
  );
}
