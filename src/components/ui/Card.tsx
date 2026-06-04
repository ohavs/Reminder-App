import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { useRipple } from '../../hooks/useRipple';

type Tone = 'lowest' | 'low' | 'base' | 'high';

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  tone?: Tone;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  className?: string;
}

const BG: Record<Tone, string> = {
  lowest: 'var(--md-surface-container-lowest)',
  low:    'var(--md-surface-container-low)',
  base:   'var(--md-surface-container)',
  high:   'var(--md-surface-container-high)',
};

export function Card({ children, style, tone = 'low', onClick, className = '' }: CardProps) {
  const ripple = useRipple();
  return (
    <div
      className={`${onClick ? 'ripple-host pressable' : ''} ${className}`.trim()}
      onClick={onClick ? (e) => { ripple(e); onClick(e); } : undefined}
      style={{
        background: BG[tone],
        borderRadius: 'var(--r-lg)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--sh-1)',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
