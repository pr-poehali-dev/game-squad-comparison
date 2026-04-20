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
      width: '240px',
      padding: '12px 14px',
      background: 'linear-gradient(180deg, hsl(222 18% 10%), hsl(222 20% 7%))',
      border: '1px solid hsl(42 76% 50% / 0.45)',
      borderRadius: '10px',
      boxShadow: '0 18px 42px hsl(222 40% 2% / 0.7), 0 0 18px hsl(42 76% 50% / 0.12), inset 0 1px 0 hsl(42 40% 40% / 0.12)',
      pointerEvents: 'none',
      backdropFilter: 'blur(6px)',
    }}>
      <div className="uppercase" style={{
        fontFamily: 'Manrope, sans-serif',
        fontSize: '0.66rem',
        fontWeight: 700,
        color: 'hsl(42 76% 68%)',
        letterSpacing: '0.18em',
        marginBottom: '6px',
      }}>
        {role}
      </div>
      <div style={{
        fontFamily: 'Manrope, sans-serif',
        fontSize: '0.82rem',
        lineHeight: 1.5,
        color: 'hsl(38 18% 82%)',
      }}>
        {description}
      </div>
      <div style={{
        position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
        borderTop: '6px solid hsl(42 76% 50% / 0.45)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
        borderTop: '5px solid hsl(222 18% 9%)',
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

  const fontSize = size === 'sm' ? '0.7rem' : '0.88rem';
  const color = size === 'sm' ? 'hsl(222 10% 68%)' : 'hsl(38 20% 84%)';

  return (
    <span className="inline-flex items-center gap-1.5">
      {showDot && (
        <span style={{ color: 'hsl(42 76% 50% / 0.8)', fontSize: '0.4rem' }}>◆</span>
      )}
      <span
        ref={ref}
        onMouseEnter={() => description && setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize,
          fontWeight: 500,
          color,
          letterSpacing: '0.01em',
          cursor: description ? 'help' : 'default',
          borderBottom: description ? '1px dotted hsl(42 76% 50% / 0.4)' : 'none',
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