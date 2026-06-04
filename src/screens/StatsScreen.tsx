import type { Reminder, ToneName } from '../types';
import { CATEGORIES, CATEGORY_ORDER } from '../data/sampleData';
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
        <StatBigCard icon="check-circle" tone="primary"  value={done}  label="הושלמו" suffix={total ? `/${total}` : ''} />
        <StatBigCard icon="trophy"       tone="tertiary" value={rate}  label="אחוז השלמה" suffix="%" />
      </div>

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
