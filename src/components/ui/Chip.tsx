import type { MouseEvent, ReactNode } from 'react';
import { useRipple } from '../../hooks/useRipple';
import { Icon } from './Icon';

interface ChipProps {
  selected?: boolean;
  icon?: string;
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

export function Chip({ selected, icon, children, onClick }: ChipProps) {
  const ripple = useRipple();
  return (
    <button
      className="ripple-host"
      onClick={(e) => { ripple(e); onClick?.(e); }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        height: 40, padding: '0 16px', borderRadius: 'var(--r-pill)',
        flexShrink: 0,
        border: selected ? 'none' : '1.5px solid var(--md-outline-variant)',
        background: selected ? 'var(--md-secondary-container)' : 'transparent',
        color: selected ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
        font: '600 14px/1 var(--font-body)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        WebkitTapHighlightColor: 'transparent',
        transition: 'background 0.25s var(--ease), border-color 0.25s var(--ease), color 0.25s var(--ease)',
      }}
    >
      {(selected || icon) && (
        <Icon name={selected ? 'check' : (icon ?? 'check')} size={16} style={{ marginInlineStart: -2 }} />
      )}
      <span style={{ display: 'inline-block' }}>{children}</span>
    </button>
  );
}
