import { WEEK_STATS } from '../data/sampleData';
import { Card } from '../components/ui/Card';
import { TopBar } from '../components/ui/TopBar';
import { SectionTitle } from '../components/ui/SectionTitle';
import { IconButton } from '../components/ui/IconButton';
import { ClayTile } from '../components/illustrations/ClayTile';
import type { ToneName } from '../types';

function StatBigCard({ icon, tone, value, label, suffix }: {
  icon: string; tone: ToneName; value: number; label: string; suffix: string;
}) {
  return (
    <Card tone="lowest" style={{ flex: 1, padding: 18 }}>
      <ClayTile icon={icon} tone={tone} size={46} />
      <div style={{
        font: '800 32px var(--font-display)', color: 'var(--md-on-surface)',
        marginTop: 12, lineHeight: 1,
      }}>
        {value}
        <span style={{ font: '700 16px var(--font-body)', color: 'var(--md-on-surface-variant)' }}>
          {suffix}
        </span>
      </div>
      <div style={{ font: '500 13px var(--font-body)', color: 'var(--md-on-surface-variant)', marginTop: 5 }}>
        {label}
      </div>
    </Card>
  );
}

export function StatsScreen() {
  const max = Math.max(...WEEK_STATS.map((d) => d.total));
  const totalDone = WEEK_STATS.reduce((s, d) => s + d.done, 0);
  const totalAll = WEEK_STATS.reduce((s, d) => s + d.total, 0);
  const rate = Math.round((totalDone / totalAll) * 100);

  const breakdown: { icon: string; tone: ToneName; label: string; val: number; count: number }[] = [
    { icon: 'schedule',      tone: 'primary',  label: 'תזכורות זמן',    val: 68, count: 42 },
    { icon: 'location_on',   tone: 'tertiary', label: 'תזכורות מיקום',  val: 22, count: 14 },
    { icon: 'priority_high', tone: 'error',    label: 'משימות דחופות',  val: 10, count: 6  },
  ];

  const barColor: Record<ToneName, string> = {
    primary:   'var(--md-primary)',
    secondary: 'var(--md-secondary)',
    tertiary:  'var(--md-tertiary)',
    error:     'var(--md-error)',
  };

  return (
    <div className="screen-pad">
      <TopBar
        title={<div style={{ font: '800 24px var(--font-display)', color: 'var(--md-on-surface)' }}>סטטיסטיקות</div>}
        actions={[<IconButton key="m" icon="calendar_month" tone="container" />]}
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 22 }}>
        <StatBigCard icon="local_fire_department" tone="error"    value={12}   label="רצף ימים"     suffix=" ימים" />
        <StatBigCard icon="trophy"                tone="tertiary" value={rate} label="אחוז השלמה"   suffix="%" />
      </div>

      {/* Weekly bar chart */}
      <Card tone="lowest" className="reveal" style={{ padding: 20, marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <div style={{ font: '700 17px var(--font-display)', color: 'var(--md-on-surface)' }}>השבוע שלך</div>
          <div style={{ font: '600 13px var(--font-body)', color: 'var(--md-primary)' }}>
            {`${totalDone} מתוך ${totalAll}`}
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          gap: 8, height: 170, paddingTop: 16,
        }}>
          {WEEK_STATS.map((d, i) => {
            const h = (d.total / max) * 100;
            const dh = (d.done / max) * 100;
            return (
              <div key={i} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 8, height: '100%',
              }}>
                <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <div style={{
                    width: '72%', height: h + '%', borderRadius: 'var(--r-sm)',
                    position: 'relative', background: 'var(--md-surface-container-highest)', overflow: 'hidden',
                  }}>
                    <div
                      className="bar-grow"
                      style={{
                        position: 'absolute', insetInline: 0, bottom: 0,
                        height: (dh / h * 100) + '%',
                        background: 'var(--md-primary)', borderRadius: 'var(--r-sm)',
                        animationDelay: `${i * 70}ms`,
                      }}
                    />
                  </div>
                </div>
                <span style={{ font: '700 11px var(--font-body)', color: 'var(--md-on-surface-variant)' }}>
                  {d.day.substring(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <SectionTitle>פילוח לפי סוג</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {breakdown.map((row) => (
          <Card key={row.label} tone="lowest" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
            <ClayTile icon={row.icon} tone={row.tone} size={46} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{ font: '700 15px var(--font-body)', color: 'var(--md-on-surface)' }}>{row.label}</span>
                <span style={{ font: '700 14px var(--font-body)', color: 'var(--md-on-surface-variant)' }}>{row.count}</span>
              </div>
              <div style={{
                height: 8, borderRadius: 'var(--r-pill)',
                background: 'var(--md-surface-container-highest)', overflow: 'hidden',
              }}>
                <div
                  className="bar-grow-x"
                  style={{
                    height: '100%', width: row.val + '%',
                    borderRadius: 'var(--r-pill)',
                    background: barColor[row.tone],
                  }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
