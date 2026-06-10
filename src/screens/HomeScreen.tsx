import { useState } from 'react';
import type { Reminder, CategoryKey, ThemeMode, SharedList } from '../types';
import { CATEGORIES, CATEGORY_ORDER } from '../data/sampleData';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { TopBar } from '../components/ui/TopBar';
import { SectionTitle } from '../components/ui/SectionTitle';
import { IconButton } from '../components/ui/IconButton';
import { Icon } from '../components/ui/Icon';
import { ClayTile } from '../components/illustrations/ClayTile';

function ProgressRing({ value, size = 88, stroke = 10 }: { value: number; size?: number; stroke?: number }) {
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
          <div style={{ font: '800 22px var(--font-display)', color: 'var(--md-on-surface)' }}>
            {Math.round(value * 100)}<span style={{ fontSize: 12 }}>%</span>
          </div>
        </div>
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
            <Icon name={r.kind === 'place' ? 'location' : 'clock'} size={15} color="var(--md-on-surface-variant)" />
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
            <Icon name="check-circle" size={14} color="var(--md-on-primary-container)" />
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
        {r.done && <Icon name="check" size={18} color="var(--md-on-primary)" />}
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
        background: bg, display: 'grid', placeItems: 'center',
      }}>
        <Icon name={c.icon} size={16} color={fg} />
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
  lists: SharedList[];
  activeListId: string | null;
  onSelectList: (id: string | null) => void;
  onManageLists: () => void;
}

export function HomeScreen({
  reminders, onToggle, onOpen, name, onOpenColor, mode, setMode,
  lists, activeListId, onSelectList, onManageLists,
}: HomeScreenProps) {
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

  const divider = (
    <div style={{
      height: 1, background: 'color-mix(in oklab, var(--md-outline-variant) 45%, transparent)',
      margin: '12px 0',
    }} />
  );

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
          <IconButton key="t" icon={mode === 'dark' ? 'sun' : 'moon'} tone="container"
            onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
            label="החלף מצב תצוגה" />,
        ]}
      />

      {/* Combined hero + progress card */}
      <Card tone="base" className="reveal" style={{
        padding: 18, marginBottom: 20, position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(150% 130% at 90% -10%, var(--md-primary-container), var(--md-surface-container) 75%)',
        boxShadow: 'var(--sh-2)',
      }}>
        <div style={{ position: 'absolute', insetInlineStart: -30, bottom: -40, width: 120, height: 120, borderRadius: '50%', background: 'color-mix(in oklab, var(--md-tertiary) 22%, transparent)', filter: 'blur(4px)' }} />

        {/* Next reminder row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          <ClayTile
            icon={next ? next.icon : 'check-circle'}
            tone={next ? (CATEGORIES[next.cat]?.tone ?? 'primary') : 'primary'}
            size={60}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: '600 12px var(--font-body)', color: 'var(--md-on-primary-container)', opacity: 0.85, marginBottom: 3 }}>
              {next ? 'התזכורת הבאה' : 'סיימת הכל להיום!'}
            </div>
            <div style={{
              font: '800 19px var(--font-display)', color: 'var(--md-on-surface)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {next ? next.title : 'כל הכבוד 🎉'}
            </div>
            {next && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4, font: '500 13px var(--font-body)', color: 'var(--md-on-surface-variant)' }}>
                <Icon name={next.kind === 'place' ? 'location' : 'clock'} size={14} color="var(--md-on-surface-variant)" />
                {next.kind === 'place' ? next.place : `בשעה ${next.time}`}
              </div>
            )}
          </div>
          <ProgressRing value={progress} size={82} stroke={9} />
        </div>

        {divider}

        {/* Stats strip */}
        <div style={{ display: 'flex', position: 'relative' }}>
          {[
            { value: `${doneCount}/${reminders.length}`, label: 'בוצעו' },
            { value: pending.length, label: 'ממתינות' },
            { value: urgentCount, label: 'דחופות', urgent: urgentCount > 0 },
          ].map((s, i, arr) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
              <div style={{
                font: '800 17px var(--font-display)',
                color: (s as { urgent?: boolean }).urgent ? 'var(--md-error)' : 'var(--md-on-surface)',
                lineHeight: 1, marginBottom: 3,
              }}>
                {s.value}
              </div>
              <div style={{ font: '500 11px var(--font-body)', color: 'var(--md-on-surface-variant)' }}>{s.label}</div>
              {i < arr.length - 1 && (
                <div style={{
                  position: 'absolute', insetInlineEnd: 0, top: 0, bottom: 0,
                  width: 1, background: 'color-mix(in oklab, var(--md-outline-variant) 45%, transparent)',
                }} />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Space switcher: personal / shared lists */}
      <div className="hide-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 14 }}>
        <Chip selected={!activeListId} icon="user" onClick={() => onSelectList(null)}>אישי</Chip>
        {lists.map((l) => (
          <Chip key={l.id} selected={activeListId === l.id} icon="users" onClick={() => onSelectList(l.id)}>
            {l.name}
          </Chip>
        ))}
        <Chip icon="plus" onClick={onManageLists}>רשימות</Chip>
      </div>

      {/* Category filter */}
      <SectionTitle>
        {activeListId ? (lists.find((l) => l.id === activeListId)?.name ?? 'רשימה משותפת') : 'המשימות שלי'}
      </SectionTitle>
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
          <Icon name="check-circle" size={48} color="var(--md-on-surface-variant)" />
          <div style={{ font: '600 16px var(--font-body)', marginTop: 12 }}>אין תזכורות בקטגוריה זו</div>
        </div>
      )}
    </div>
  );
}
