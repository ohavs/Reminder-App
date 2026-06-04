/* ULTRA · Onboarding */

const ONB_SLIDES = [
  {
    illo: 'bell',
    title: 'לעולם לא תשכח',
    body: 'תזכורות חכמות שמופיעות בדיוק בזמן הנכון — לפי שעה, חזרתיות ועדיפות.',
  },
  {
    illo: 'pin',
    title: 'תזכורות לפי מיקום',
    body: 'קבל תזכורת בדיוק כשמגיעים או יוצאים ממקום — Geofence חכם שעובד במלואו במכשיר.',
  },
  {
    illo: 'check',
    title: 'פרטיות מלאה',
    body: 'כל הנתונים נשארים אצלך. ללא ענן, ללא מעקב — רק אתה והתזכורות שלך.',
  },
];

function OnboardingScreen({ onDone }) {
  const [i, setI] = React.useState(0);
  const slide = ONB_SLIDES[i];
  const last = i === ONB_SLIDES.length - 1;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '22px 26px 30px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <button onClick={onDone} style={{ border: 'none', background: 'transparent', color: 'var(--md-on-surface-variant)', font: '600 15px var(--font-body)', cursor: 'pointer' }}>
          דלג
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <div key={i} className="onb-illo" style={{
          width: 250, height: 250, borderRadius: '50%', display: 'grid', placeItems: 'center', marginBottom: 40,
          background: 'radial-gradient(70% 70% at 50% 40%, var(--md-primary-container), transparent 72%)',
        }}>
          {slide.illo === 'bell' && <ClayBell size={210} />}
          {slide.illo === 'pin' && <ClayPin size={180} />}
          {slide.illo === 'check' && <ClayCheck size={180} />}
        </div>
        <h1 key={'t' + i} className="onb-text" style={{ font: '800 34px var(--font-display)', color: 'var(--md-on-surface)', margin: '0 0 14px', maxWidth: 320 }}>{slide.title}</h1>
        <p key={'b' + i} className="onb-text" style={{ font: '500 17px var(--font-body)', color: 'var(--md-on-surface-variant)', margin: 0, maxWidth: 320, lineHeight: 1.55 }}>{slide.body}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {ONB_SLIDES.map((_, n) => (
            <span key={n} style={{
              height: 8, borderRadius: 'var(--r-pill)', transition: 'all .35s var(--ease-spring)',
              width: n === i ? 28 : 8,
              background: n === i ? 'var(--md-primary)' : 'var(--md-outline-variant)',
            }} />
          ))}
        </div>
        <Button icon={last ? 'rocket_launch' : undefined}
          onClick={() => last ? onDone() : setI(i + 1)}>
          {last ? 'בוא נתחיל' : 'הבא'}
        </Button>
      </div>
    </div>
  );
}

Object.assign(window, { OnboardingScreen });
