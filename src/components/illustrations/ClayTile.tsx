import type { ToneName } from '../../types';

interface ClayTileProps {
  icon: string;
  tone?: ToneName;
  size?: number;
}

const BG: Record<ToneName, string> = {
  primary:   'var(--md-primary-container)',
  secondary: 'var(--md-secondary-container)',
  tertiary:  'var(--md-tertiary-container)',
  error:     'var(--md-error-container)',
};
const FG: Record<ToneName, string> = {
  primary:   'var(--md-on-primary-container)',
  secondary: 'var(--md-on-secondary-container)',
  tertiary:  'var(--md-on-tertiary-container)',
  error:     'var(--md-on-error-container)',
};

export function ClayTile({ icon, tone = 'primary', size = 56 }: ClayTileProps) {
  const bg = BG[tone];
  const fg = FG[tone];
  return (
    <div style={{
      width: size, height: size,
      borderRadius: 'calc(var(--r-md) * 0.9)',
      background: `radial-gradient(120% 120% at 32% 26%, color-mix(in oklab, ${bg} 70%, #fff 30%), ${bg})`,
      display: 'grid', placeItems: 'center', flexShrink: 0,
      boxShadow: `inset 0 2px 4px rgba(255,255,255,.45), 0 4px 10px -4px ${fg}`,
    }}>
      <span className="msym" style={{ color: fg, fontSize: size * 0.46 }}>{icon}</span>
    </div>
  );
}
