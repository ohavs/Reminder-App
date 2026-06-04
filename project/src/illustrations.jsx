/* ULTRA · soft 3D / claymorphism illustrations (SVG placeholders) */

/* A reusable soft clay blob backdrop */
function ClayBlob({ a, b, r = 0 }) {
  return (
    <g transform={`rotate(${r} 100 100)`}>
      <ellipse cx="100" cy="100" rx="86" ry="78" fill={a} />
      <ellipse cx="100" cy="92" rx="86" ry="70" fill={b} />
    </g>
  );
}

/* Big hero bell-clock for onboarding */
function ClayBell({ size = 220 }) {
  const id = React.useId().replace(/:/g, '');
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
        {/* bell body */}
        <path d="M100 34c-32 0-52 24-52 60 0 22-6 34-16 44 -5 5 -1 12 7 12h122c8 0 12-7 7-12 -10-10-16-22-16-44 0-36-20-60-52-60z"
          fill={`url(#pc${id})`} />
        {/* highlight */}
        <ellipse cx="78" cy="74" rx="16" ry="24" fill="#fff" opacity="0.30" />
        {/* top knob */}
        <circle cx="100" cy="30" r="11" fill={`url(#pt${id})`} />
        {/* clapper */}
        <path d="M88 152a12 12 0 0 0 24 0z" fill={`url(#pt${id})`} />
      </g>
    </svg>
  );
}

/* Location pin clay */
function ClayPin({ size = 120 }) {
  const id = React.useId().replace(/:/g, '');
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
        <path d="M60 18c-20 0-34 14-34 34 0 24 34 52 34 52s34-28 34-52c0-20-14-34-34-34z" fill={`url(#g${id})`} />
        <circle cx="60" cy="50" r="14" fill="var(--md-surface-container-lowest)" />
        <ellipse cx="50" cy="36" rx="7" ry="10" fill="#fff" opacity="0.3" />
      </g>
    </svg>
  );
}

/* Small clay round icon tile (used in lists / stats) */
function ClayTile({ icon, tone = 'primary', size = 56 }) {
  const bg = tone === 'tertiary' ? 'var(--md-tertiary-container)'
    : tone === 'secondary' ? 'var(--md-secondary-container)'
    : tone === 'error' ? 'var(--md-error-container)'
    : 'var(--md-primary-container)';
  const fg = tone === 'tertiary' ? 'var(--md-on-tertiary-container)'
    : tone === 'secondary' ? 'var(--md-on-secondary-container)'
    : tone === 'error' ? 'var(--md-on-error-container)'
    : 'var(--md-on-primary-container)';
  return (
    <div style={{
      width: size, height: size, borderRadius: 'calc(var(--r-md) * 0.9)',
      background: `radial-gradient(120% 120% at 32% 26%, color-mix(in oklab, ${bg} 70%, #fff 30%), ${bg})`,
      display: 'grid', placeItems: 'center', flexShrink: 0,
      boxShadow: `inset 0 2px 4px rgba(255,255,255,.45), 0 4px 10px -4px ${fg}`,
    }}>
      <span className="msym" style={{ color: fg, fontSize: size * 0.46 }}>{icon}</span>
    </div>
  );
}

/* Onboarding empty-state celebration */
function ClayCheck({ size = 160 }) {
  const id = React.useId().replace(/:/g, '');
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
        <path d="M58 76l14 14 30-32" fill="none" stroke="var(--md-on-primary)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

Object.assign(window, { ClayBell, ClayPin, ClayTile, ClayCheck, ClayBlob });
