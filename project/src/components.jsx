/* ULTRA · shared MD3 Expressive UI components */

/* Material ripple on press */
function useRipple() {
  return React.useCallback((e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const d = Math.max(rect.width, rect.height) * 2;
    const span = document.createElement('span');
    span.className = 'ripple';
    span.style.width = span.style.height = d + 'px';
    span.style.left = e.clientX - rect.left - d / 2 + 'px';
    span.style.top = e.clientY - rect.top - d / 2 + 'px';
    el.appendChild(span);
    span.addEventListener('animationend', () => span.remove());
  }, []);
}

/* Filled / tonal / text button — pill shaped (MD3) */
function Button({ variant = 'filled', icon, children, onClick, style, full, ...rest }) {
  const ripple = useRipple();
  const base = {
    filled: { background: 'var(--md-primary)', color: 'var(--md-on-primary)' },
    tonal: { background: 'var(--md-secondary-container)', color: 'var(--md-on-secondary-container)' },
    tertiary: { background: 'var(--md-tertiary-container)', color: 'var(--md-on-tertiary-container)' },
    outline: { background: 'transparent', color: 'var(--md-primary)', border: '1.5px solid var(--md-outline-variant)' },
    text: { background: 'transparent', color: 'var(--md-primary)' },
  }[variant];
  return (
    <button
      className="ultra-btn ripple-host"
      onClick={(e) => { ripple(e); onClick && onClick(e); }}
      style={{
        ...base, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, height: 52, padding: '0 26px', borderRadius: 'var(--r-pill)',
        font: '600 16px var(--font-body)', border: base.border || 'none',
        cursor: 'pointer', width: full ? '100%' : 'auto', position: 'relative',
        overflow: 'hidden', WebkitTapHighlightColor: 'transparent', ...style,
      }}
      {...rest}
    >
      {icon && <span className="msym" style={{ fontSize: 20 }}>{icon}</span>}
      {children}
    </button>
  );
}

/* Surface card */
function Card({ children, style, tone = 'low', onClick, className = '' }) {
  const ripple = useRipple();
  const bg = {
    lowest: 'var(--md-surface-container-lowest)',
    low: 'var(--md-surface-container-low)',
    base: 'var(--md-surface-container)',
    high: 'var(--md-surface-container-high)',
  }[tone];
  return (
    <div
      className={`ultra-card ${onClick ? 'ripple-host pressable' : ''} ${className}`}
      onClick={onClick ? (e) => { ripple(e); onClick(e); } : undefined}
      style={{
        background: bg, borderRadius: 'var(--r-lg)', position: 'relative',
        overflow: 'hidden', boxShadow: 'var(--sh-1)', WebkitTapHighlightColor: 'transparent', ...style,
      }}
    >
      {children}
    </div>
  );
}

/* Filter / choice chip */
function Chip({ selected, icon, children, onClick }) {
  const ripple = useRipple();
  return (
    <button
      className="ripple-host"
      onClick={(e) => { ripple(e); onClick && onClick(e); }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7, height: 42,
        padding: '0 18px', borderRadius: 'var(--r-pill)', flexShrink: 0,
        border: selected ? 'none' : '1.5px solid var(--md-outline-variant)',
        background: selected ? 'var(--md-secondary-container)' : 'transparent',
        color: selected ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
        font: '600 14px/1 var(--font-body)', cursor: 'pointer', position: 'relative',
        overflow: 'hidden', whiteSpace: 'nowrap', WebkitTapHighlightColor: 'transparent',
        transition: 'background .25s var(--ease), border-color .25s var(--ease), color .25s var(--ease)',
      }}
    >
      {(selected || icon) && (
        <span className="msym" style={{ fontSize: 18, marginInlineStart: -2 }}>
          {selected ? 'check' : icon}
        </span>
      )}
      <span style={{ display: 'inline-block' }}>{children}</span>
    </button>
  );
}

/* Segmented control (e.g. urgent / normal) */
function Segmented({ options, value, onChange }) {
  return (
    <div style={{
      display: 'flex', borderRadius: 'var(--r-pill)', overflow: 'hidden',
      border: '1.5px solid var(--md-outline-variant)', height: 52,
    }}>
      {options.map((o, i) => {
        const active = value === o.value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              border: 'none', borderInlineStart: i ? '1.5px solid var(--md-outline-variant)' : 'none',
              background: active ? 'var(--md-secondary-container)' : 'transparent',
              color: active ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
              font: '600 15px var(--font-body)', cursor: 'pointer',
              transition: 'background .3s var(--ease-spring)', WebkitTapHighlightColor: 'transparent',
            }}>
            {active && <span className="msym" style={{ fontSize: 18 }}>check</span>}
            {o.icon && !active && <span className="msym" style={{ fontSize: 18 }}>{o.icon}</span>}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* Toggle switch (MD3) */
function Switch({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)}
      aria-pressed={checked}
      style={{
        width: 56, height: 32, borderRadius: 'var(--r-pill)', position: 'relative',
        border: checked ? 'none' : '2px solid var(--md-outline)',
        background: checked ? 'var(--md-primary)' : 'var(--md-surface-container-highest)',
        cursor: 'pointer', transition: 'background .28s var(--ease)', flexShrink: 0,
        WebkitTapHighlightColor: 'transparent',
      }}>
      <span style={{
        position: 'absolute', top: '50%', insetInlineStart: checked ? 26 : 6,
        width: checked ? 22 : 16, height: checked ? 22 : 16, borderRadius: '50%',
        background: checked ? 'var(--md-on-primary)' : 'var(--md-outline)',
        transform: 'translateY(-50%)',
        transition: 'inset-inline-start .28s var(--ease-spring), width .2s, height .2s',
      }} />
    </button>
  );
}

/* Section label */
function SectionTitle({ children, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '4px 2px 12px' }}>
      <h2 style={{ font: '700 21px var(--font-display)', color: 'var(--md-on-surface)', margin: 0 }}>{children}</h2>
      {action}
    </div>
  );
}

/* App top bar */
function TopBar({ title, leading, actions }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px 14px',
      minHeight: 56,
    }}>
      {leading}
      <div style={{ flex: 1 }}>{title}</div>
      <div style={{ display: 'flex', gap: 4 }}>{actions}</div>
    </div>
  );
}

/* Round icon button */
function IconButton({ icon, onClick, tone, size = 44, fontSize = 24, style }) {
  const ripple = useRipple();
  return (
    <button className="ripple-host" onClick={(e) => { ripple(e); onClick && onClick(e); }}
      style={{
        width: size, height: size, borderRadius: '50%', border: 'none', cursor: 'pointer',
        background: tone === 'container' ? 'var(--md-surface-container-high)' : 'transparent',
        color: 'var(--md-on-surface)', display: 'grid', placeItems: 'center',
        position: 'relative', overflow: 'hidden', WebkitTapHighlightColor: 'transparent',
        flexShrink: 0, ...style,
      }}>
      <span className="msym" style={{ fontSize }}>{icon}</span>
    </button>
  );
}

Object.assign(window, {
  useRipple, Button, Card, Chip, Segmented, Switch, SectionTitle, TopBar, IconButton,
});
