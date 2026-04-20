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
      width: '220px',
      padding: '10px 13px',
      background: 'hsl(22 10% 8%)',
      border: '1px solid hsl(18 52% 48% / 0.7)',
      borderRadius: 0,
      boxShadow: '0 14px 34px hsl(0 0% 0% / 0.7), inset 0 1px 0 hsl(30 30% 30% / 0.25)',
      pointerEvents: 'none',
    }}>
      <div className="uppercase" style={{
        fontFamily: '"IM Fell English SC", serif',
        fontSize: '0.65rem',
        fontWeight: 400,
        color: 'hsl(18 62% 58%)',
        letterSpacing: '0.22em',
        marginBottom: '4px',
      }}>
        {role}
      </div>
      <div style={{
        fontFamily: '"IM Fell English", serif',
        fontSize: '0.82rem',
        lineHeight: 1.45,
        color: 'hsl(40 22% 78%)',
      }}>
        {description}
      </div>
      <div style={{
        position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
        borderTop: '6px solid hsl(18 52% 48% / 0.7)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
        borderTop: '5px solid hsl(22 10% 8%)',
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

  const fontSize = size === 'sm' ? '0.72rem' : '0.92rem';
  const color = size === 'sm' ? 'hsl(30 18% 62%)' : 'hsl(40 24% 78%)';

  return (
    <span className="inline-flex items-center gap-1">
      {showDot && (
        <span style={{ color: 'hsl(18 52% 42%)', fontSize: '0.55rem' }}>◆</span>
      )}
      <span
        ref={ref}
        onMouseEnter={() => description && setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="italic"
        style={{
          fontFamily: '"IM Fell English", serif',
          fontSize,
          color,
          letterSpacing: '0.02em',
          cursor: description ? 'help' : 'default',
          borderBottom: description ? '1px dotted hsl(18 52% 42% / 0.55)' : 'none',
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