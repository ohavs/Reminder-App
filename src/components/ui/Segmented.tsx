import { Icon } from './Icon';

interface Option {
  value: string;
  label: string;
  icon?: string;
}

interface SegmentedProps {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
}

export function Segmented({ options, value, onChange }: SegmentedProps) {
  return (
    <div style={{
      display: 'flex', borderRadius: 'var(--r-pill)', overflow: 'hidden',
      border: '1.5px solid var(--md-outline-variant)', height: 52,
    }}>
      {options.map((o, i) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              border: 'none',
              borderInlineStart: i > 0 ? '1.5px solid var(--md-outline-variant)' : 'none',
              background: active ? 'var(--md-secondary-container)' : 'transparent',
              color: active ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
              font: '600 15px var(--font-body)',
              cursor: 'pointer',
              transition: 'background 0.3s var(--ease-spring)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {active && <Icon name="check" size={17} />}
            {o.icon && !active && <Icon name={o.icon} size={17} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
