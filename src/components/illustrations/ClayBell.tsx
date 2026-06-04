import { useId } from 'react';

export function ClayBell({ size = 220 }: { size?: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ display: 'block' }}>
      <defs>
        <radialGradient id={`pc${id}`} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor="var(--md-primary-container)" />
          <stop offset="100%" stopColor="var(--md-primary)" />
        </radialGradient>
        <radialGradient id={`pt${id}`} cx="40%" cy="28%" r="75%">
          <stop offset="0%" stopColor="var(--md-tertiary-container)" />
          <stop offset="100%" stopColor="var(--md-tertiary)" />
        </radialGradient>
        <filter id={`s${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="var(--md-primary)" floodOpacity="0.28" />
        </filter>
      </defs>
      <ellipse cx="100" cy="176" rx="62" ry="12" fill="var(--md-primary)" opacity="0.16" />
      <g filter={`url(#s${id})`}>
        <path
          d="M100 34c-32 0-52 24-52 60 0 22-6 34-16 44-5 5-1 12 7 12h122c8 0 12-7 7-12-10-10-16-22-16-44 0-36-20-60-52-60z"
          fill={`url(#pc${id})`}
        />
        <ellipse cx="78" cy="74" rx="16" ry="24" fill="#fff" opacity="0.30" />
        <circle cx="100" cy="30" r="11" fill={`url(#pt${id})`} />
        <path d="M88 152a12 12 0 0 0 24 0z" fill={`url(#pt${id})`} />
      </g>
    </svg>
  );
}
