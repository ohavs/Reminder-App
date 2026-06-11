import { useState } from 'react';
import { Icon } from './Icon';
import { WheelPicker } from './WheelPicker';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

interface TimeFieldProps {
  value: string; // "HH:mm"
  onChange: (v: string) => void;
}

export function TimeField({ value, onChange }: TimeFieldProps) {
  const [open, setOpen] = useState(false);
  const [h = '09', m = '00'] = value.split(':');

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', height: 56, padding: '0 18px',
          borderRadius: open ? 'var(--r-md) var(--r-md) 0 0' : 'var(--r-md)',
          border: '1.5px solid ' + (open ? 'var(--md-primary)' : 'var(--md-outline-variant)'),
          borderBottomWidth: open ? 0 : 1.5,
          background: 'var(--md-surface-container-lowest)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          transition: 'border-color 0.2s, border-radius 0.2s',
        }}
      >
        <span style={{
          font: '800 24px var(--font-display)', color: 'var(--md-on-surface)',
          fontVariantNumeric: 'tabular-nums', direction: 'ltr',
        }}>
          {h}:{m}
        </span>
        <span style={{
          transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s var(--ease-spring)',
          display: 'grid', placeItems: 'center', color: 'var(--md-on-surface-variant)',
        }}>
          <Icon name="chevron-left" size={20} style={{ transform: 'rotate(-90deg)' }} />
        </span>
      </button>

      {open && (
        <div className="reveal" style={{
          border: '1.5px solid var(--md-primary)', borderTop: 'none',
          borderRadius: '0 0 var(--r-md) var(--r-md)',
          background: 'var(--md-surface-container-lowest)',
          padding: '8px 18px 14px',
        }}>
          <div dir="ltr" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <WheelPicker options={HOURS} value={h} onChange={(nh) => onChange(`${nh}:${m}`)} width={72} />
            <span style={{ font: '800 24px var(--font-display)', color: 'var(--md-on-surface-variant)' }}>:</span>
            <WheelPicker options={MINUTES} value={m} onChange={(nm) => onChange(`${h}:${nm}`)} width={72} />
          </div>
        </div>
      )}
    </div>
  );
}
