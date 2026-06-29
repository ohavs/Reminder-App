import { useState } from 'react';
import type { Reminder } from '../types';
import { HEB_MONTHS, HEB_DAYS_SHORT } from '../data/sampleData';
import { CATEGORIES } from '../data/sampleData';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TopBar } from '../components/ui/TopBar';
import { SectionTitle } from '../components/ui/SectionTitle';
import { IconButton } from '../components/ui/IconButton';
import { Icon } from '../components/ui/Icon';
import { ClayTile } from '../components/illustrations/ClayTile';

interface CalendarScreenProps {
  reminders: Reminder[];
  onOpen: (r: Reminder) => void;
  onToggle: (id: string) => void;
  onAdd?: (date: string) => void;
}

export function CalendarScreen({ reminders, onOpen, onToggle, onAdd }: CalendarScreenProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [sel, setSel] = useState(today.getDate());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayDow = new Date(viewYear, viewMonth, 1).getDay();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const dateStr = (d: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const dotMap: Record<string, number> = {};
  reminders.forEach((r) => {
    if (r.dueDate) dotMap[r.dueDate] = (dotMap[r.dueDate] || 0) + 1;
  });

  const selDateStr = dateStr(sel);
  const selReminders = reminders.filter((r) => r.dueDate === selDateStr);

  return (
    <div className="screen-pad">
      <TopBar
        title={<div style={{ font: '800 24px var(--font-display)', color: 'var(--md-on-surface)' }}>לוח שנה</div>}
        actions={[
          <IconButton key="t" icon="calendar-check" tone="container"
            onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); setSel(today.getDate()); }}
            label="היום" />
        ]}
      />

      <Card tone="lowest" className="reveal" style={{ padding: 18, marginBottom: 22 }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <IconButton icon="chevron-right" size={38} fontSize={22} tone="container" onClick={prevMonth} />
          <div style={{ font: '800 18px var(--font-display)', color: 'var(--md-on-surface)' }}>
            {`${HEB_MONTHS[viewMonth]} ${viewYear}`}
          </div>
          <IconButton icon="chevron-left" size={38} fontSize={22} tone="container" onClick={nextMonth} />
        </div>

        {/* Headers + grid, nudged a few px to optically centre within the card */}
        <div style={{ transform: 'translateX(4px)' }}>
        {/* Day-of-week headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 10 }}>
          {HEB_DAYS_SHORT.map((d) => (
            <div key={d} style={{
              textAlign: 'center', font: '700 12px var(--font-body)',
              color: 'var(--md-on-surface-variant)',
            }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', columnGap: 4, rowGap: 4 }}>
          {cells.map((d, idx) => {
            if (d === null) return <div key={`e${idx}`} style={{ aspectRatio: '1' }} />;
            const isSel = d === sel;
            const isToday = isCurrentMonth && d === today.getDate();
            const count = dotMap[dateStr(d)] || 0;
            return (
              <div
                key={d}
                style={{ position: 'relative', aspectRatio: '1', display: 'grid', placeItems: 'center' }}
              >
                <button
                  onClick={() => setSel(d)}
                  style={{
                    width: 42, height: 42,
                    borderRadius: isSel ? 'var(--r-sm)' : '50%',
                    border: isToday && !isSel ? '2px solid var(--md-primary)' : 'none',
                    cursor: 'pointer', display: 'grid', placeItems: 'center', padding: 0,
                    background: isSel ? 'var(--md-primary)' : isToday ? 'var(--md-primary-container)' : 'transparent',
                    color: isSel ? 'var(--md-on-primary)' : isToday ? 'var(--md-on-primary-container)' : 'var(--md-on-surface)',
                    transition: 'all 0.25s var(--ease-spring)',
                    boxShadow: isSel ? 'var(--sh-1)' : 'none',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <span style={{
                    font: `${isToday || isSel ? 800 : 500} 15px var(--font-body)`,
                    fontVariantNumeric: 'tabular-nums', lineHeight: 1,
                  }}>
                    {d}
                  </span>
                </button>
                {count > 0 && (
                  <span style={{
                    position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)',
                    width: 6, height: 6, borderRadius: '50%',
                    background: isSel ? 'var(--md-on-primary)' : 'var(--md-tertiary)',
                  }} />
                )}
              </div>
            );
          })}
        </div>
        </div>
      </Card>

      <SectionTitle
        action={
          <span style={{ font: '600 13px var(--font-body)', color: 'var(--md-on-surface-variant)' }}>
            {isCurrentMonth && sel === today.getDate() ? 'היום' : `${sel} ב${HEB_MONTHS[viewMonth]}`}
          </span>
        }
      >
        לוח הזמנים
      </SectionTitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {selReminders.map((r, i) => {
          const cat = CATEGORIES[r.cat];
          const tone = cat?.tone ?? 'primary';
          return (
            <div key={r.id} style={{ display: 'flex', gap: 14 }}>
              <div style={{
                width: 48, flexShrink: 0, textAlign: 'center',
                font: '800 13px var(--font-body)',
                color: 'var(--md-on-surface-variant)', paddingTop: 18,
              }}>
                {r.time}
              </div>
              <div style={{ flex: 1 }}>
                <Card tone="lowest" onClick={() => onOpen(r)}
                  className="reveal"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                    animationDelay: `${i * 50}ms`,
                    opacity: r.done ? 0.6 : 1,
                  }}>
                  <ClayTile icon={r.icon} tone={tone} size={46} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      font: '700 15px var(--font-body)', color: 'var(--md-on-surface)',
                      textDecoration: r.done ? 'line-through' : 'none',
                    }}>{r.title}</div>
                    {r.sub && (
                      <div style={{ font: '500 13px var(--font-body)', color: 'var(--md-on-surface-variant)', marginTop: 2 }}>
                        {r.sub}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggle(r.id); }}
                    style={{
                      width: 30, height: 30, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                      border: r.done ? 'none' : '2px solid var(--md-outline)',
                      background: r.done ? 'var(--md-primary)' : 'transparent',
                      color: 'var(--md-on-primary)', display: 'grid', placeItems: 'center',
                      WebkitTapHighlightColor: 'transparent',
                    }}>
                    {r.done && <Icon name="check" size={16} color="var(--md-on-primary)" />}
                  </button>
                </Card>
              </div>
            </div>
          );
        })}

        {selReminders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 20px 6px', color: 'var(--md-on-surface-variant)' }}>
            <Icon name="calendar-check" size={42} color="var(--md-on-surface-variant)" />
            <div style={{ font: '600 15px var(--font-body)', marginTop: 10 }}>אין תזכורות ביום זה</div>
          </div>
        )}
      </div>

      {/* Single add button — always available for the selected day */}
      {onAdd && (
        <Button variant="tonal" full icon="plus" style={{ marginTop: 16 }} onClick={() => onAdd(selDateStr)}>
          הוסף תזכורת ליום זה
        </Button>
      )}
    </div>
  );
}
