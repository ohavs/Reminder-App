import { useState } from 'react';
import { HEB_MONTHS, HEB_DAYS_SHORT } from '../../data/sampleData';
import { Icon } from './Icon';
import { IconButton } from './IconButton';

interface DateFieldProps {
  value: string; // "YYYY-MM-DD" or ""
  onChange: (v: string) => void;
}

function fmt(value: string): string {
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return '';
  const weekday = new Date(y, m - 1, d).toLocaleDateString('he-IL', { weekday: 'long' });
  return `${weekday}, ${d} ב${HEB_MONTHS[m - 1]} ${y}`;
}

export function DateField({ value, onChange }: DateFieldProps) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const initial = value ? new Date(value) : today;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const dateStr = (d: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

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
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          transition: 'border-color 0.2s, border-radius 0.2s',
        }}
      >
        <span style={{
          font: value ? '700 16px var(--font-body)' : '500 16px var(--font-body)',
          color: value ? 'var(--md-on-surface)' : 'var(--md-on-surface-variant)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {value ? fmt(value) : 'ללא תאריך מוגדר'}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {value && (
            <span
              role="button"
              aria-label="נקה תאריך"
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              style={{
                width: 26, height: 26, borderRadius: '50%', display: 'grid', placeItems: 'center',
                background: 'var(--md-surface-container-high)', color: 'var(--md-on-surface-variant)',
                cursor: 'pointer',
              }}
            >
              <Icon name="x" size={14} />
            </span>
          )}
          <span style={{
            transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s var(--ease-spring)',
            display: 'grid', placeItems: 'center', color: 'var(--md-on-surface-variant)',
          }}>
            <Icon name="chevron-left" size={20} style={{ transform: 'rotate(-90deg)' }} />
          </span>
        </span>
      </button>

      {open && (
        <div className="reveal" style={{
          border: '1.5px solid var(--md-primary)', borderTop: 'none',
          borderRadius: '0 0 var(--r-md) var(--r-md)',
          background: 'var(--md-surface-container-lowest)',
          padding: '12px 14px 14px',
        }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <IconButton icon="chevron-right" size={34} fontSize={18} tone="container" onClick={prevMonth} />
            <div style={{ font: '800 15px var(--font-display)', color: 'var(--md-on-surface)' }}>
              {`${HEB_MONTHS[viewMonth]} ${viewYear}`}
            </div>
            <IconButton icon="chevron-left" size={34} fontSize={18} tone="container" onClick={nextMonth} />
          </div>

          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 6 }}>
            {HEB_DAYS_SHORT.map((d) => (
              <div key={d} style={{
                textAlign: 'center', font: '700 11px var(--font-body)',
                color: 'var(--md-on-surface-variant)',
              }}>{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
            {cells.map((d, idx) => {
              if (d === null) return <div key={`e${idx}`} style={{ height: 38 }} />;
              const ds = dateStr(d);
              const isSel = ds === value;
              const isToday = ds === todayStr;
              return (
                <button
                  key={d}
                  onClick={() => { onChange(ds); setOpen(false); }}
                  style={{
                    height: 38, borderRadius: isSel ? 'var(--r-xs)' : '50%',
                    border: isToday && !isSel ? '2px solid var(--md-primary)' : 'none',
                    cursor: 'pointer', display: 'grid', placeItems: 'center', padding: 0,
                    background: isSel ? 'var(--md-primary)' : isToday ? 'var(--md-primary-container)' : 'transparent',
                    color: isSel ? 'var(--md-on-primary)' : isToday ? 'var(--md-on-primary-container)' : 'var(--md-on-surface)',
                    font: `${isSel || isToday ? 800 : 500} 13px var(--font-body)`,
                    fontVariantNumeric: 'tabular-nums',
                    transition: 'all 0.2s var(--ease-spring)',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
