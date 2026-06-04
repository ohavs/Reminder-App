/* ULTRA · Calendar screen */

function CalendarScreen({ reminders, onOpen, onToggle }) {
  const [sel, setSel] = React.useState(18);
  const today = 18;
  // build a month grid (assume month starts on a given weekday)
  const daysInMonth = 30;
  const startOffset = 2; // first day falls on Tuesday-ish for demo
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="screen-pad">
      <TopBar
        title={<div style={{ font: '800 24px var(--font-display)', color: 'var(--md-on-surface)' }}>לוח שנה</div>}
        actions={[<IconButton key="t" icon="today" tone="container" onClick={() => setSel(today)} />]}
      />

      <Card tone="lowest" className="reveal" style={{ padding: 18, marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <IconButton icon="chevron_right" size={38} fontSize={22} tone="container" />
          <div style={{ font: '800 18px var(--font-display)', color: 'var(--md-on-surface)' }}>{`${HEB_MONTHS[5]} 2026`}</div>
          <IconButton icon="chevron_left" size={38} fontSize={22} tone="container" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 10 }}>
          {HEB_DAYS_SHORT.map((d) => (
            <div key={d} style={{ textAlign: 'center', font: '700 12px var(--font-body)', color: 'var(--md-on-surface-variant)' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={'e' + i} />;
            const isSel = d === sel;
            const isToday = d === today;
            const count = CAL_REMINDERS[d] || 0;
            return (
              <button key={d} onClick={() => setSel(d)}
                style={{
                  aspectRatio: '1', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer',
                  background: isSel ? 'var(--md-primary)' : 'transparent',
                  color: isSel ? 'var(--md-on-primary)' : isToday ? 'var(--md-primary)' : 'var(--md-on-surface)',
                  position: 'relative', transition: 'all .25s var(--ease-spring)', WebkitTapHighlightColor: 'transparent',
                  display: 'grid', placeItems: 'center',
                  boxShadow: isSel ? 'var(--sh-1)' : 'none',
                }}>
                <span style={{ font: `${isToday || isSel ? 800 : 600} 15px var(--font-body)`, fontVariantNumeric: 'tabular-nums' }}>{d}</span>
                {count > 0 && (
                  <span style={{
                    position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)',
                    width: 5, height: 5, borderRadius: '50%',
                    background: isSel ? 'var(--md-on-primary)' : 'var(--md-tertiary)',
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <SectionTitle action={
        <span style={{ font: '600 13px var(--font-body)', color: 'var(--md-on-surface-variant)' }}>
          {sel === today ? 'היום' : `${sel} ב${HEB_MONTHS[5]}`}
        </span>
      }>לוח הזמנים</SectionTitle>

      {/* timeline */}
      <div style={{ position: 'relative' }}>
        {reminders.filter(r => r.kind === 'time').map((r, i) => (
          <div key={r.id} style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
            <div style={{
              width: 54, flexShrink: 0, textAlign: 'center', font: '800 14px var(--font-body)',
              color: 'var(--md-on-surface-variant)', paddingTop: 18,
            }}>{r.time}</div>
            <div style={{ flex: 1 }}>
              <ReminderRow r={r} index={i} onToggle={onToggle} onOpen={onOpen} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { CalendarScreen });
