import { useState } from 'react';
import type { Reminder, CategoryKey, ThemeMode } from '../types';
import { CATEGORIES, CATEGORY_ORDER } from '../data/sampleData';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { TopBar } from '../components/ui/TopBar';
import { SectionTitle } from '../components/ui/SectionTitle';
import { IconButton } from '../components/ui/IconButton';
import { ClayTile } from '../components/illustrations/ClayTile';

function ProgressRing({ value, size = 100, stroke = 11 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - value);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="color-mix(in oklab, var(--md-primary) 16%, transparent)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--md-primary)" strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          className="ring-grow"
          style={{ '--ring-c': c, '--ring-off': off } as React.CSSProperties} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center', lineHeight: 1 }}>
          <div style={{ font: '800 26px var(--font-display)', color: 'var(--md-on-surface)' }}>
            {Math.round(value * 100)}<span style={{ fontSize: 14 }}>%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, tone, value, label }: { icon: string; tone: 'error' | 'tertiary'; value: number; label: string }) {
  const isError = tone === 'error';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 38, height: 38, borderRadius: 'var(--r-sm)', display: 'grid', placeItems: 'center', flexShrink: 0,
        background: isError ? 'var(--md-error-container)' : 'var(--md-tertiary-container)',
        color: isError ? 'var(--md-on-error-container)' : 'var(--md-on-tertiary-container)',
      }}>
        <span className="msym" style={{ fontSize: 21 }}>{icon}</span>
      </div>
      <div>
        <div style={{ font: '800 19px var(--font-display)', color: 'var(--md-on-surface)', lineHeight: 1 }}>{value}</div>
        <div style={{ font: '500 12px var(--font-body)', color: 'var(--md-on-surface-variant)', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

function PriorityDot({ priority }: { priority: 'urgent' | 'normal' }) {
  const urgent = priority === 'urgent';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      font: '700 12px var(--font-body)',
      color: urgent ? 'var(--md-error)' : 'var(--md-on-surface-variant)',
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: urgent ? 'var(--md-error)' : 'var(--md-tertiary)',
        display: 'inline-block',
      }} />
      {urgent ? 'דחוף' : 'רגיל'}
    </span>
  );
}

function ReminderRow({ r, onToggle, onOpen, index }: {
  r: Reminder; onToggle: (id: string) => void; onOpen: (r: Reminder) => void; index: number;
}) {
  const cat = CATEGORIES[r.cat];
  const tone = cat?.tone ?? (r.priority === 'urgent' ? 'error' : 'primary');
  return (
    <Card tone="lowest" onClick={() => onOpen(r)}
      className="reveal"
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: 14,
        animationDelay: `${index * 50}ms`,
        opacity: r.done ? 0.6 : 1,
      }}>
      <ClayTile icon={r.icon} tone={tone} size={54} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          font: '700 16px var(--font-body)', color: 'var(--md-on-surface)',
          textDecoration: r.done ? 'line-through' : 'none', marginBottom: 4,
        }}>{r.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            font: '500 13px var(--font-body)', color: 'var(--md-on-surface-variant)',
          }}>
            <span className="msym" style={{ fontSize: 16 }}>
              {r.kind === 'place' ? 'location_on' : 'schedule'}
            </span>
            {r.kind === 'place'
              ? `${r.trigger === 'arrive' ? 'בהגעה ל' : 'ביציאה מ'}${r.place}`
              : r.time}
          </span>
          <PriorityDot priority={r.priority} />
        </div>
        {r.done && r.doneAt && (
          <div style={{
            marginTop: 8, padding: '6px 10px', borderRadius: 'var(--r-xs)',
            background: 'var(--md-primary-container)', color: 'var(--md-on-primary-container)',
            font: '600 12px var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            <span className="msym" style={{ fontSize: 15 }}>check_circle</span>
            {`בוצע בשעה ${r.doneAt}`}
          </div>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(r.id); }}
        aria-label="סמן כבוצע"
        style={{
          width: 34, height: 34, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
          border: r.done ? 'none' : '2px solid var(--md-outline)',
          background: r.done ? 'var(--md-primary)' : 'transparent',
          color: 'var(--md-on-primary)', display: 'grid', placeItems: 'center',
          transition: 'all 0.25s var(--ease-spring)', WebkitTapHighlightColor: 'transparent',
        }}>
        {r.done && <span className="msym" style={{ fontSize: 20 }}>check</span>}
      </button>
    </Card>
  );
}

function CatHeader({ cat, count }: { cat: CategoryKey; count: number }) {
  const c = CATEGORIES[cat];
  if (!c) return null;
  const colors: Record<string, { bg: string; fg: string }> = {
    error:     { bg: 'var(--md-error-container)',     fg: 'var(--md-on-error-container)' },
    primary:   { bg: 'var(--md-primary-container)',   fg: 'var(--md-on-primary-container)' },
    tertiary:  { bg: 'var(--md-tertiary-container)',  fg: 'var(--md-on-tertiary-container)' },
    secondary: { bg: 'var(--md-secondary-container)', fg: 'var(--md-on-secondary-container)' },
  };
  const { bg, fg } = colors[c.tone] ?? colors.primary;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '20px 2px 12px' }}>
      <span style={{
        width: 28, height: 28, borderRadius: 'var(--r-xs)',
        background: bg, color: fg, display: 'grid', placeItems: 'center',
      }}>
        <span className="msym" style={{ fontSize: 17 }}>{c.icon}</span>
      </span>
      <span style={{ font: '700 16px var(--font-display)', color: 'var(--md-on-surface)' }}>{c.label}</span>
      <span style={{ font: '600 13px var(--font-body)', color: 'var(--md-on-surface-variant)' }}>{count}</span>
    </div>
  );
}

interface HomeScreenProps {
  reminders: Reminder[];
  onToggle: (id: string) => void;
  onOpen: (r: Reminder) => void;
  name: string;
  onOpenColor: () => void;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
}

export function HomeScreen({ reminders, onToggle, onOpen, name, onOpenColor, mode, setMode }: HomeScreenProps) {
  const [filter, setFilter] = useState<'all' | CategoryKey>('all');
  const pending = reminders.filter((r) => !r.done);
  const next = pending[0];
  const doneCount = reminders.filter((r) => r.done).length;
  const urgentCount = reminders.filter((r) => r.priority === 'urgent' && !r.done).length;
  const progress = reminders.length ? doneCount / reminders.length : 0;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'בוקר טוב' : hour < 18 ? 'צהריים טובים' : 'ערב טוב';

  const shown = filter === 'all' ? reminders : reminders.filter((r) => r.cat === filter);
  const groups = CATEGORY_ORDER
    .map((c) => ({ cat: c, items: shown.filter((r) => r.cat === c) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="screen-pad">
      <TopBar
        title={
          <div>
            <div style={{ font: '500 14px var(--font-body)', color: 'var(--md-on-surface-variant)' }}>
              {greet} ☀️
            </div>
            <div style={{ font: '800 24px var(--font-display)', color: 'var(--md-on-surface)' }}>
              {name}
            </div>
          </div>
        }
        actions={[
          <IconButton key="c" icon="palette" tone="container" onClick={onOpenColor} label="צבע דינמי" />,
          <IconButton key="t" icon={mode === 'dark' ? 'light_mode' : 'dark_mode'} tone="container"
            onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
            label="החלף מצב תצוגה" />,
        ]}
      />

      {/* Hero */}
      <Card tone="base" className="reveal" style={{
        padding: 20, marginBottom: 16, position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(150% 130% at 90% -10%, var(--md-primary-container), var(--md-surface-container) 75%)',
        boxShadow: 'var(--sh-2)',
      }}>
        <div style={{ position: 'absolute', insetInlineStart: -30, bottom: -40, width: 120, height: 120, borderRadius: '50%', background: 'color-mix(in oklab, var(--md-tertiary) 22%, transparent)', filter: 'blur(4px)' }} />
        <div style={{ position: 'absolute', insetInlineStart: 40, top: -20, width: 50, height: 50, borderRadius: '50%', background: 'color-mix(in oklab, var(--md-primary) 24%, transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
          <ClayTile
            icon={next ? next.icon : 'celebration'}
            tone={next ? (CATEGORIES[next.cat]?.tone ?? 'primary') : 'primary'}
            size={66}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: '600 13px var(--font-body)', color: 'var(--md-on-primary-container)', opacity: 0.9, marginBottom: 4 }}>
              {next ? 'התזכורת הבאה' : 'סיימת הכל להיום!'}
            </div>
            <div style={{ font: '800 21px var(--font-display)', color: 'var(--md-on-surface)' }}>
              {next ? next.title : 'כל הכבוד 🎉'}
            </div>
            {next && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, font: '600 14px var(--font-body)', color: 'var(--md-on-surface-variant)' }}>
                <span className="msym" style={{ fontSize: 17 }}>
                  {next.kind === 'place' ? 'location_on' : 'schedule'}
                </span>
                {next.kind === 'place' ? next.place : `היום בשעה ${next.time}`}
              </div>
            )}
          </div>
          {next && (
            <IconButton icon="snooze" tone="container" style={{ background: 'var(--md-surface-container-lowest)' }} />
          )}
        </div>
      </Card>

      {/* Progress bento */}
      <Card tone="lowest" className="reveal" style={{
        padding: 18, marginBottom: 26, display: 'flex', alignItems: 'center', gap: 18,
      }}>
        <ProgressRing value={progress} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ font: '700 16px var(--font-display)', color: 'var(--md-on-surface)' }}>התקדמות היום</div>
            <div style={{ font: '500 13px var(--font-body)', color: 'var(--md-on-surface-variant)', marginTop: 2 }}>
              {`${doneCount} מתוך ${reminders.length} הושלמו`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            <MiniStat icon="pending_actions" tone="tertiary" value={pending.length} label="ממתינות" />
            <MiniStat icon="priority_high" tone="error" value={urgentCount} label="דחופות" />
          </div>
        </div>
      </Card>

      {/* Category filter */}
      <SectionTitle>המשימות שלי</SectionTitle>
      <div className="hide-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 4 }}>
        <Chip selected={filter === 'all'} icon="apps" onClick={() => setFilter('all')}>הכל</Chip>
        {CATEGORY_ORDER.map((c) => (
          <Chip key={c} selected={filter === c} icon={CATEGORIES[c].icon} onClick={() => setFilter(c)}>
            {CATEGORIES[c].label}
          </Chip>
        ))}
      </div>

      {/* Grouped list */}
      {groups.map((g) => (
        <div key={g.cat}>
          <CatHeader cat={g.cat} count={g.items.length} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {g.items.map((r, i) => (
              <ReminderRow key={r.id} r={r} index={i} onToggle={onToggle} onOpen={onOpen} />
            ))}
          </div>
        </div>
      ))}

      {groups.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--md-on-surface-variant)' }}>
          <span className="msym" style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>
            check_circle
          </span>
          <div style={{ font: '600 16px var(--font-body)' }}>אין תזכורות בקטגוריה זו</div>
        </div>
      )}
    </div>
  );
}
