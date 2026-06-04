import type { CSSProperties, MouseEvent } from 'react';
import { useRipple } from '../../hooks/useRipple';

interface IconButtonProps {
  icon: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  tone?: 'container' | 'transparent';
  size?: number;
  fontSize?: number;
  style?: CSSProperties;
  label?: string;
}

export function IconButton({ icon, onClick, tone, size = 44, fontSize = 24, style, label }: IconButtonProps) {
  const ripple = useRipple();
  return (
    <button
      className="ripple-host"
      aria-label={label}
      onClick={(e) => { ripple(e); onClick?.(e); }}
      style={{
        width: size, height: size, borderRadius: '50%', border: 'none',
        cursor: 'pointer',
        background: tone === 'container' ? 'var(--md-surface-container-high)' : 'transparent',
        color: 'var(--md-on-surface)',
        display: 'grid', placeItems: 'center',
        flexShrink: 0,
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
    >
      <span className="msym" style={{ fontSize }}>{icon}</span>
    </button>
  );
}
