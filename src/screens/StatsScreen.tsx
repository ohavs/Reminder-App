import type { Reminder, ToneName } from '../types';
import { CATEGORIES, CATEGORY_ORDER, HEB_DAYS_SHORT } from '../data/sampleData';
import { Card } from '../components/ui/Card';
import { TopBar } from '../components/ui/TopBar';
import { SectionTitle } from '../components/ui/SectionTitle';
import { ClayTile } from '../components/illustrations/ClayTile';

function StatBigCard({ icon, tone, value, label, suffix }: {
  icon: string; tone: ToneName; value: number | string; label: string; suffix?: string;
}) {
  return (
    <Card tone="lowest" style={{ flex: 1, padding: 18 }}>
      <ClayTile icon={icon} tone={tone} size={46} />
      <div style={{
        font: '800 32px var(--font-display)', color: 'var(--md-on-surface)',
        marginTop: 12, lineHeight: 1,
      }}>
        {value}
        {suffix && <span style={{ font: '700 16px var(--font-body)', color: 'var(--md-on-surface-variant)' }}>{suffix}</span>}
      </div>
      <div style={{ font: '500 13px var(--font-body)', color: 'var(--md-on-surface-variant)', marginTop: 5 }}>
        {label}
      </div>
    </Card>
  );
}

interface StatsScreenProps {
  reminders: Reminder[];
}

export function StatsScreen({ reminders }: StatsScreenProps) {
  const total = reminders.length;
  const done = reminders.filter((r) => r.done).length;
  const rate = total ? Math.round((done / total) * 100) : 0;
  const urgent = reminders.filter((r) => r.priority === 'urgent').length;

  // Last 7 days of completions (from doneAt timestamps)
  const DAY = 86_400_000;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const week = Array.from({ length: 7 }, (_, i) => {
    const start = todayStart.getTime() - (6 - i) * DAY;
    const count = reminders.filter((r) => r.doneAtMs && r.doneAtMs >= start && r.doneAtMs < start + DAY).length;
    return { label: HEB_DAYS_SHORT[new Date(start).getDay()], count };
  });
  const weekMax = Math.max(...week.map((d) => d.count), 1);
  const weekTotal = week.reduce((s, d) => s + d.count, 0);

  // Consecutive days with at least one completion (today may still be empty)
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const start = todayStart.getTime() - i * DAY;
    const has = reminders.some((r) => r.doneAtMs && r.doneAtMs >= start && r.doneAtMs < start + DAY);
    if (has) streak++;
    else if (i > 0) break;
  }

  const catStats = CATEGORY_ORDER
    .map((cat) => {
      const items = reminders.filter((r) => r.cat === cat);
      const catDone = items.filter((r) => r.done).length;
      return { cat, total: items.length, done: catDone };
    })
    .filter((s) => s.total > 0);

  const maxCat = Math.max(...catStats.map((s) => s.total), 1);

  const barColor: Record<ToneName, string> = {
    primary:   'var(--md-primary)',
    secondary: 'var(--md-secondary)',
    tertiary:  'var(--md-tertiary)',
    error:     'var(--md-error)',
  };

  const typeStats = [
    { icon: 'clock',    tone: 'primary'  as ToneName, label: 'תזכורות זמן',   count: reminders.filter((r) => r.kind === 'time').length },
    { icon: 'location', tone: 'tertiary' as ToneName, label: 'תזכורות מיקום', count: reminders.filter((r) => r.kind === 'place').length },
    { icon: 'alert',    tone: 'error'    as ToneName, label: 'משימות דחופות', count: urgent },
  ];
  const maxType = Math.max(...typeStats.map((s) => s.count), 1);

  return (
    <div className="screen-pad">
      <TopBar
        title={<div style={{ font: '800 24px var(--font-display)', color: 'var(--md-on-surface)' }}>סטטיסטיקות</div>}
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 22 }}>
        <StatBigCard icon="flame"  tone="error"    value={streak} label="רצף ימים" suffix={streak === 1 ? ' יום' : ' ימים'} />
        <StatBigCard icon="trophy" tone="tertiary" value={rate}   label="אחוז השלמה" suffix="%" />
      </div>

      {/* Last 7 days */}
      <Card tone="lowest" className="reveal" style={{ padding: 20, marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <div style={{ font: '700 17px var(--font-display)', color: 'var(--md-on-surface)' }}>השבוע האחרון</div>
          <div style={{ font: '600 13px var(--font-body)', color: 'var(--md-primary)' }}>
            {`${weekTotal} הושלמו · ${done}/${total} סה״כ`}
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          gap: 8, height: 150, paddingTop: 16,
        }}>
          {week.map((d, i) => (
            <div key={i} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 8, height: '100%',
            }}>
              <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div
                  className="bar-grow"
                  style={{
                    width: '72%',
                    height: `${Math.max((d.count / weekMax) * 100, d.count > 0 ? 8 : 3)}%`,
                    borderRadius: 'var(--r-sm)',
                    background: d.count > 0 ? 'var(--md-primary)' : 'var(--md-surface-container-highest)',
                    animationDelay: `${i * 70}ms`,
                  }}
                />
              </div>
              <span style={{
                font: `${i === 6 ? 800 : 700} 11px var(--font-body)`,
                color: i === 6 ? 'var(--md-primary)' : 'var(--md-on-surface-variant)',
              }}>
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Category breakdown */}
      {catStats.length > 0 && (
        <>
          <SectionTitle>פילוח לפי קטגוריה</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 22 }}>
            {catStats.map((row) => {
              const cat = CATEGORIES[row.cat];
              return (
                <Card key={row.cat} tone="lowest" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <ClayTile icon={cat.icon} tone={cat.tone} size={46} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                      <span style={{ font: '700 15px var(--font-body)', color: 'var(--md-on-surface)' }}>{cat.label}</span>
                      <span style={{ font: '700 14px var(--font-body)', color: 'var(--md-on-surface-variant)' }}>
                        {row.done}/{row.total}
                      </span>
                    </div>
                    <div style={{ height: 8, borderRadius: 'var(--r-pill)', background: 'var(--md-surface-container-highest)', overflow: 'hidden' }}>
                      <div
                        className="bar-grow-x"
                        style={{
                          height: '100%', width: `${(row.total / maxCat) * 100}%`,
                          borderRadius: 'var(--r-pill)',
                          background: barColor[cat.tone], position: 'relative',
                        }}
                      >
                        <div style={{
                          position: 'absolute', insetInlineEnd: 0, top: 0, bottom: 0,
                          width: `${row.total ? ((row.total - row.done) / row.total) * 100 : 0}%`,
                          background: 'color-mix(in oklab, var(--md-surface-container-highest) 60%, transparent)',
                        }} />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Type breakdown */}
      <SectionTitle>פילוח לפי סוג</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {typeStats.map((row) => (
          <Card key={row.label} tone="lowest" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
            <ClayTile icon={row.icon} tone={row.tone} size={46} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{ font: '700 15px var(--font-body)', color: 'var(--md-on-surface)' }}>{row.label}</span>
                <span style={{ font: '700 14px var(--font-body)', color: 'var(--md-on-surface-variant)' }}>{row.count}</span>
              </div>
              <div style={{ height: 8, borderRadius: 'var(--r-pill)', background: 'var(--md-surface-container-highest)', overflow: 'hidden' }}>
                <div
                  className="bar-grow-x"
                  style={{
                    height: '100%', width: `${(row.count / maxType) * 100}%`,
                    borderRadius: 'var(--r-pill)',
                    background: barColor[row.tone],
                  }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {total === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--md-on-surface-variant)' }}>
          <div style={{ font: '600 16px var(--font-body)', marginTop: 12 }}>אין עדיין נתונים להצגה</div>
          <div style={{ font: '500 14px var(--font-body)', marginTop: 6 }}>הוסף תזכורות כדי לראות סטטיסטיקות</div>
        </div>
      )}
    </div>
  );
}
