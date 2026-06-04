import type { CSSProperties, MouseEvent } from 'react';
import { useRipple } from '../../hooks/useRipple';

type Variant = 'filled' | 'tonal' | 'tertiary' | 'outline' | 'text';

interface ButtonProps {
  variant?: Variant;
  icon?: string;
  children?: React.ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  style?: CSSProperties;
  full?: boolean;
  disabled?: boolean;
}

const BASE: Record<Variant, CSSProperties> = {
  filled:   { background: 'var(--md-primary)',             color: 'var(--md-on-primary)' },
  tonal:    { background: 'var(--md-secondary-container)', color: 'var(--md-on-secondary-container)' },
  tertiary: { background: 'var(--md-tertiary-container)',  color: 'var(--md-on-tertiary-container)' },
  outline:  { background: 'transparent', color: 'var(--md-primary)', border: '1.5px solid var(--md-outline-variant)' },
  text:     { background: 'transparent', color: 'var(--md-primary)' },
};

export function Button({ variant = 'filled', icon, children, onClick, style, full, disabled }: ButtonProps) {
  const ripple = useRipple();
  const base = BASE[variant];
  return (
    <button
      className="ripple-host pressable"
      disabled={disabled}
      onClick={(e) => { ripple(e); onClick?.(e); }}
      style={{
        ...base,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, height: 52, padding: '0 26px', borderRadius: 'var(--r-pill)',
        font: '600 16px var(--font-body)', border: (base as { border?: string }).border || 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: full ? '100%' : 'auto',
        opacity: disabled ? 0.5 : 1,
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
    >
      {icon && <span className="msym" style={{ fontSize: 20 }}>{icon}</span>}
      {children}
    </button>
  );
}
