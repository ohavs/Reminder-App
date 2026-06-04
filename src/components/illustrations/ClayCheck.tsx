import { useId } from 'react';

export function ClayCheck({ size = 160 }: { size?: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 160 160">
      <defs>
        <radialGradient id={`c${id}`} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor="var(--md-primary-container)" />
          <stop offset="100%" stopColor="var(--md-primary)" />
        </radialGradient>
        <filter id={`cf${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="var(--md-primary)" floodOpacity="0.3" />
        </filter>
      </defs>
      <ellipse cx="80" cy="142" rx="42" ry="8" fill="var(--md-primary)" opacity="0.16" />
      <g filter={`url(#cf${id})`}>
        <circle cx="80" cy="74" r="50" fill={`url(#c${id})`} />
        <ellipse cx="62" cy="54" rx="12" ry="18" fill="#fff" opacity="0.3" />
        <path
          d="M58 76l14 14 30-32"
          fill="none"
          stroke="var(--md-on-primary)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
