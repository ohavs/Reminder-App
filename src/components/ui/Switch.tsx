interface SwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
}

export function Switch({ checked, onChange }: SwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 56, height: 32, borderRadius: 'var(--r-pill)',
        position: 'relative',
        border: checked ? 'none' : '2px solid var(--md-outline)',
        background: checked ? 'var(--md-primary)' : 'var(--md-surface-container-highest)',
        cursor: 'pointer',
        transition: 'background 0.28s var(--ease)',
        flexShrink: 0,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span style={{
        position: 'absolute', top: '50%',
        insetInlineStart: checked ? 26 : 6,
        width: checked ? 22 : 16,
        height: checked ? 22 : 16,
        borderRadius: '50%',
        background: checked ? 'var(--md-on-primary)' : 'var(--md-outline)',
        transform: 'translateY(-50%)',
        transition: 'inset-inline-start 0.28s var(--ease-spring), width 0.2s, height 0.2s',
      }} />
    </button>
  );
}
