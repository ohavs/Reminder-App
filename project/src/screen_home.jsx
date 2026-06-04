/* ULTRA · Home (Today) screen */

function PriorityDot({ priority }) {
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
      }} />
      {urgent ? 'דחוף' : 'רגיל'}
    </span>
  );
}

function ProgressRing({ value, size = 100, stroke = 11 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - value);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="color-mix(in oklab, var(--md-primary) 16%, transparent)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--md-primary)" strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          className="ring-grow" style={{ '--ring-c': c, '--ring-off': off }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', lineHeight: 1 }}>
          <div style={{ font: '800 26px var(--font-display)', color: 'var(--md-on-surface)' }}>{Math.round(value * 100)}<span style={{ fontSize: 14 }}>%</span></div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, tone, value, label }) {
  const col = tone === 'error' ? 'var(--md-error)' : 'var(--md-tertiary)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 38, height: 38, borderRadius: 'var(--r-sm)', display: 'grid', placeItems: 'center', flexShrink: 0,
        background: tone === 'error' ? 'var(--md-error-container)' : 'var(--md-tertiary-container)',
        color: tone === 'error' ? 'var(--md-on-error-container)' : 'var(--md-on-tertiary-container)',
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

function ReminderRow({ r, onToggle, onOpen, index }) {
  const cat = CATEGORIES[r.cat] || {};
  const tone = cat.tone || (r.priority === 'urgent' ? 'error' : 'primary');
  return (
    <Card tone="lowest" onClick={() => onOpen(r)}
      className="reveal"
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: 14,
        animationDelay: (index * 50) + 'ms',
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
          transition: 'all .25s var(--ease-spring)', WebkitTapHighlightColor: 'transparent',
        }}>
        {r.done && <span className="msym" style={{ fontSize: 20 }}>check</span>}
      </button>
    </Card>
  );
}

function CatHeader({ cat, count }) {
  const c = CATEGORIES[cat];
  if (!c) return null;
  const bg = { error: 'var(--md-error-container)', primary: 'var(--md-primary-container)', tertiary: 'var(--md-tertiary-container)', secondary: 'var(--md-secondary-container)' }[c.tone];
  const fg = { error: 'var(--md-on-error-container)', primary: 'var(--md-on-primary-container)', tertiary: 'var(--md-on-tertiary-container)', secondary: 'var(--md-on-secondary-container)' }[c.tone];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '20px 2px 12px' }}>
      <span style={{ width: 28, height: 28, borderRadius: 'var(--r-xs)', background: bg, color: fg, display: 'grid', placeItems: 'center' }}>
        <span className="msym" style={{ fontSize: 17 }}>{c.icon}</span>
      </span>
      <span style={{ font: '700 16px var(--font-display)', color: 'var(--md-on-surface)' }}>{c.label}</span>
      <span style={{ font: '600 13px var(--font-body)', color: 'var(--md-on-surface-variant)' }}>{count}</span>
    </div>
  );
}

function HomeScreen({ reminders, onToggle, onOpen, onAdd, name, onOpenColor, mode, setMode }) {
  const [filter, setFilter] = React.useState('all');
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
    .filter((g) => g.items.length);

  return (
    <div className="screen-pad">
      <TopBar
        title={
          <div>
            <div style={{ font: '500 14px var(--font-body)', color: 'var(--md-on-surface-variant)' }}>{greet} ☀️</div>
            <div style={{ font: '800 24px var(--font-display)', color: 'var(--md-on-surface)' }}>{name}</div>
          </div>
        }
        actions={[
          <IconButton key="c" icon="palette" tone="container" onClick={onOpenColor} />,
          <IconButton key="t" icon={mode === 'dark' ? 'light_mode' : 'dark_mode'} tone="container"
            onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} />,
        ]}
      />

      {/* Hero: next reminder */}
      <Card tone="base" className="reveal" style={{
        padding: 20, marginBottom: 16, position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(150% 130% at 90% -10%, var(--md-primary-container), var(--md-surface-container) 75%)',
        boxShadow: 'var(--sh-2)',
      }}>
        {/* decorative floating blobs */}
        <div style={{ position: 'absolute', insetInlineStart: -30, bottom: -40, width: 120, height: 120, borderRadius: '50%', background: 'color-mix(in oklab, var(--md-tertiary) 22%, transparent)', filter: 'blur(4px)' }} />
        <div style={{ position: 'absolute', insetInlineStart: 40, top: -20, width: 50, height: 50, borderRadius: '50%', background: 'color-mix(in oklab, var(--md-primary) 24%, transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
          <ClayTile icon={next ? next.icon : 'celebration'} tone={next ? (CATEGORIES[next.cat] || {}).tone : 'primary'} size={66} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: '600 13px var(--font-body)', color: 'var(--md-on-primary-container)', opacity: .9, marginBottom: 4 }}>
              {next ? 'התזכורת הבאה' : 'סיימת הכל להיום!'}
            </div>
            <div style={{ font: '800 21px var(--font-display)', color: 'var(--md-on-surface)' }}>
              {next ? next.title : 'כל הכבוד 🎉'}
            </div>
            {next && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, font: '600 14px var(--font-body)', color: 'var(--md-on-surface-variant)' }}>
                <span className="msym" style={{ fontSize: 17 }}>{next.kind === 'place' ? 'location_on' : 'schedule'}</span>
                {next.kind === 'place' ? next.place : `היום בשעה ${next.time}`}
              </div>
            )}
          </div>
          {next && (
            <IconButton icon="snooze" tone="container" onClick={() => {}} style={{ background: 'var(--md-surface-container-lowest)' }} />
          )}
        </div>
      </Card>

      {/* Progress summary bento */}
      <Card tone="lowest" className="reveal" style={{ padding: 18, marginBottom: 26, display: 'flex', alignItems: 'center', gap: 18 }}>
        <ProgressRing value={progress} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ font: '700 16px var(--font-display)', color: 'var(--md-on-surface)' }}>התקדמות היום</div>
            <div style={{ font: '500 13px var(--font-body)', color: 'var(--md-on-surface-variant)', marginTop: 2 }}>{`${doneCount} מתוך ${reminders.length} הושלמו`}</div>
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            <MiniStat icon="pending_actions" tone="tertiary" value={pending.length} label="ממתינות" />
            <MiniStat icon="priority_high" tone="error" value={urgentCount} label="דחופות" />
          </div>
        </div>
      </Card>

      {/* Category filter */}
      <SectionTitle>המשימות שלי</SectionTitle>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 4 }} className="hide-scroll">
        <Chip selected={filter === 'all'} onClick={() => setFilter('all')} icon="apps">הכל</Chip>
        {CATEGORY_ORDER.map((c) => (
          <Chip key={c} selected={filter === c} icon={CATEGORIES[c].icon} onClick={() => setFilter(c)}>{CATEGORIES[c].label}</Chip>
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
    </div>
  );
}

Object.assign(window, { HomeScreen, ReminderRow, PriorityDot, ProgressRing });
