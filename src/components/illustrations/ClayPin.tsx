import { useId } from 'react';

export function ClayPin({ size = 120 }: { size?: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <defs>
        <radialGradient id={`g${id}`} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor="var(--md-tertiary-container)" />
          <stop offset="100%" stopColor="var(--md-tertiary)" />
        </radialGradient>
        <filter id={`f${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="var(--md-tertiary)" floodOpacity="0.3" />
        </filter>
      </defs>
      <ellipse cx="60" cy="108" rx="26" ry="6" fill="var(--md-tertiary)" opacity="0.2" />
      <g filter={`url(#f${id})`}>
        <path
          d="M60 18c-20 0-34 14-34 34 0 24 34 52 34 52s34-28 34-52c0-20-14-34-34-34z"
          fill={`url(#g${id})`}
        />
        <circle cx="60" cy="50" r="14" fill="var(--md-surface-container-lowest)" />
        <ellipse cx="50" cy="36" rx="7" ry="10" fill="#fff" opacity="0.3" />
      </g>
    </svg>
  );
}
