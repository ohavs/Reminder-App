import { useEffect, useState } from 'react';
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
          <div style={{ font: `800 ${Math.round(size * 0.27)}px var(--font-display)`, color: 'var(--md-on-surface)' }}>
            {Math.round(value * 100)}<span style={{ fontSize: Math.round(size * 0.15) }}>%</span>
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

function ReminderRow({ r, onToggle, onOpen, index, countdown }: {
  r: Reminder; onToggle: (id: string) => void; onOpen: (r: Reminder) => void; index: number;
  countdown?: number | null;
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
        {countdown != null ? (
          <div style={{
            marginTop: 8, padding: '6px 10px', borderRadius: 'var(--r-xs)',
            background: 'var(--md-surface-container-highest)', color: 'var(--md-on-surface-variant)',
            font: '600 12px var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            <Icon name="clock" size={14} color="var(--md-on-surface-variant)" />
            {`נמחק בעוד ${countdown}ש׳`}
          </div>
        ) : r.done && r.doneAt && (
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

function GroupHeader({ icon, label, count, bg, fg }: {
  icon: string; label: string; count: number; bg: string; fg: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '22px 2px 12px' }}>
      <span style={{ width: 28, height: 28, borderRadius: 'var(--r-xs)', background: bg, display: 'grid', placeItems: 'center' }}>
        <Icon name={icon} size={16} color={fg} />
      </span>
      <span style={{ font: '700 16px var(--font-display)', color: 'var(--md-on-surface)' }}>{label}</span>
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

  // A one-time time-reminder whose moment has passed is "overdue"
  const isOverdue = (r: Reminder) => {
    if (r.done || r.kind !== 'time' || !r.time) return false;
    if (r.repeat && r.repeat !== 'חד פעמי') return false;
    const [hh, mm] = r.time.split(':').map(Number);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return false;
    const dt = new Date();
    if (r.dueDate) { const [y, mo, d] = r.dueDate.split('-').map(Number); dt.setFullYear(y, mo - 1, d); }
    dt.setHours(hh, mm, 0, 0);
    return dt.getTime() < Date.now();
  };

  const doneItems = reminders.filter((r) => r.done);
  const overdueItems = reminders.filter((r) => !r.done && isOverdue(r));
  const activeItems = reminders.filter((r) => !r.done && !isOverdue(r));

  // Tick once a second to drive the auto-delete countdown on completed items
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (doneItems.length === 0) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [doneItems.length]);
  const AUTO_DELETE_MS = 60_000;
  const countdownFor = (r: Reminder) =>
    r.doneAtMs ? Math.max(0, Math.ceil((AUTO_DELETE_MS - (now - r.doneAtMs)) / 1000)) : null;

  // Filters are derived from the active reminders in the current list — not a
  // fixed set. Only categories present are offered; the row hides when there's
  // nothing meaningful to filter (0–1 categories).
  const presentCats = CATEGORY_ORDER.filter((c) => activeItems.some((r) => r.cat === c));
  const showFilters = presentCats.length >= 2;

  useEffect(() => {
    if (filter !== 'all' && !presentCats.includes(filter)) setFilter('all');
  }, [filter, presentCats.join(',')]);

  const effectiveFilter = filter !== 'all' && presentCats.includes(filter) ? filter : 'all';
  const shownActive = effectiveFilter === 'all' ? activeItems : activeItems.filter((r) => r.cat === effectiveFilter);
  const groups = CATEGORY_ORDER
    .map((c) => ({ cat: c, items: shownActive.filter((r) => r.cat === c) }))
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
          <IconButton key="t" icon={mode === 'dark' ? 'sun' : 'moon'} tone="container"
            onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
            label="החלף מצב תצוגה" />,
        ]}
      />

      {/* Compact hero: next reminder + progress, with a slim stats line */}
      <Card tone="base" className="reveal" style={{
        padding: 14, marginBottom: 16, position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(150% 130% at 90% -10%, var(--md-primary-container), var(--md-surface-container) 75%)',
        boxShadow: 'var(--sh-2)',
      }}>
        {/* Next reminder row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <ClayTile
            icon={next ? next.icon : 'check-circle'}
            tone={next ? (CATEGORIES[next.cat]?.tone ?? 'primary') : 'primary'}
            size={46}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: '600 11px var(--font-body)', color: 'var(--md-on-primary-container)', opacity: 0.85, marginBottom: 2 }}>
              {next ? 'התזכורת הבאה' : 'סיימת הכל להיום!'}
            </div>
            <div style={{
              font: '800 17px var(--font-display)', color: 'var(--md-on-surface)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {next ? next.title : 'כל הכבוד 🎉'}
            </div>
            {next && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2, font: '500 12px var(--font-body)', color: 'var(--md-on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <Icon name={next.kind === 'place' ? 'location' : 'clock'} size={13} color="var(--md-on-surface-variant)" />
                {next.kind === 'place' ? next.place : `בשעה ${next.time}`}
              </div>
            )}
          </div>
          <ProgressRing value={progress} size={54} stroke={6} />
        </div>

        {/* Slim stats line */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginTop: 12, paddingTop: 10,
          borderTop: '1px solid color-mix(in oklab, var(--md-outline-variant) 45%, transparent)',
          font: '600 12px var(--font-body)', color: 'var(--md-on-surface-variant)',
          flexWrap: 'wrap',
        }}>
          <span><b style={{ color: 'var(--md-on-surface)', fontWeight: 800 }}>{doneCount}/{reminders.length}</b> בוצעו</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span><b style={{ color: 'var(--md-on-surface)', fontWeight: 800 }}>{pending.length}</b> ממתינות</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span style={{ color: urgentCount > 0 ? 'var(--md-error)' : undefined }}>
            <b style={{ fontWeight: 800, color: urgentCount > 0 ? 'var(--md-error)' : 'var(--md-on-surface)' }}>{urgentCount}</b> דחופות
          </span>
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
      {showFilters && (
        <div className="hide-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 4 }}>
          <Chip selected={effectiveFilter === 'all'} icon="apps" onClick={() => setFilter('all')}>הכל</Chip>
          {presentCats.map((c) => (
            <Chip key={c} selected={effectiveFilter === c} icon={CATEGORIES[c].icon} onClick={() => setFilter(c)}>
              {CATEGORIES[c].label}
            </Chip>
          ))}
        </div>
      )}

      {/* Active reminders, grouped by category */}
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

      {/* Overdue — moved down, kept until marked done */}
      {effectiveFilter === 'all' && overdueItems.length > 0 && (
        <div>
          <GroupHeader icon="alert" label="עבר זמנן" count={overdueItems.length}
            bg="var(--md-error-container)" fg="var(--md-on-error-container)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {overdueItems.map((r, i) => (
              <ReminderRow key={r.id} r={r} index={i} onToggle={onToggle} onOpen={onOpen} />
            ))}
          </div>
        </div>
      )}

      {/* Completed — auto-removed after a minute, with a countdown */}
      {effectiveFilter === 'all' && doneItems.length > 0 && (
        <div>
          <GroupHeader icon="check-circle" label="בוצעו" count={doneItems.length}
            bg="var(--md-primary-container)" fg="var(--md-on-primary-container)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {doneItems.map((r, i) => (
              <ReminderRow key={r.id} r={r} index={i} onToggle={onToggle} onOpen={onOpen} countdown={countdownFor(r)} />
            ))}
          </div>
        </div>
      )}

      {groups.length === 0 && overdueItems.length === 0 && doneItems.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--md-on-surface-variant)' }}>
          <Icon name="check-circle" size={48} color="var(--md-on-surface-variant)" />
          <div style={{ font: '600 16px var(--font-body)', marginTop: 12 }}>אין תזכורות עדיין</div>
        </div>
      )}
    </div>
  );
}
