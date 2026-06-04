/* ULTRA · app root */
const { useState, useEffect, useRef } = React;

const FONT_MAP = {
  rubik: { display: "'Rubik', sans-serif", body: "'Heebo', sans-serif" },
  assistant: { display: "'Assistant', sans-serif", body: "'Assistant', sans-serif" },
  heebo: { display: "'Heebo', sans-serif", body: "'Heebo', sans-serif" },
  rubikAll: { display: "'Rubik', sans-serif", body: "'Rubik', sans-serif" },
};
const FONT_OPTS = [
  { value: 'rubik', label: '\u05e8\u05d5\u05d1\u05d9\u05e7 + \u05d7\u05d9\u05d1\u05d5 (\u05d1\u05e8\u05d9\u05e8\u05ea \u05de\u05d7\u05d3\u05dc)' },
  { value: 'assistant', label: '\u05d0\u05e1\u05d9\u05e1\u05d8\u05e0\u05d8' },
  { value: 'heebo', label: '\u05d7\u05d9\u05d1\u05d5' },
  { value: 'rubikAll', label: '\u05e8\u05d5\u05d1\u05d9\u05e7' },
];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "fontPair": "rubik",
  "radius": 1
}/*EDITMODE-END*/;

const NAV = [
  { id: 'home', icon: 'home', label: 'בית' },
  { id: 'calendar', icon: 'calendar_month', label: 'לוח' },
  { id: 'stats', icon: 'bar_chart', label: 'סטטיסטיקה' },
  { id: 'profile', icon: 'person', label: 'פרופיל' },
];

/* reminder detail bottom sheet */
function DetailSheet({ r, onClose, onToggle, onDelete }) {
  const open = !!r;
  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'var(--md-scrim)',
        opacity: open ? 0.4 : 0, pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity .3s var(--ease)', zIndex: 40,
      }} />
      <div style={{
        position: 'absolute', insetInline: 0, bottom: 0, zIndex: 41,
        background: 'var(--md-surface-container-high)', borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
        padding: '14px 24px 28px', transform: open ? 'translateY(0)' : 'translateY(110%)',
        transition: 'transform .42s var(--ease-spring)', boxShadow: '0 -8px 40px -8px rgba(0,0,0,.3)',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--md-outline-variant)', margin: '0 auto 20px' }} />
        {r && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14, marginBottom: 22 }}>
              <ClayTile icon={r.icon} tone={r.priority === 'urgent' ? 'error' : r.kind === 'place' ? 'tertiary' : 'primary'} size={84} />
              <div>
                <h3 style={{ font: '800 24px var(--font-display)', color: 'var(--md-on-surface)', margin: 0 }}>{r.title}</h3>
                {r.sub && <p style={{ font: '500 15px var(--font-body)', color: 'var(--md-on-surface-variant)', margin: '6px 0 0' }}>{r.sub}</p>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 22 }}>
              <Card tone="lowest" style={{ flex: 1, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, font: '600 13px var(--font-body)', color: 'var(--md-on-surface-variant)', marginBottom: 6 }}>
                  <span className="msym" style={{ fontSize: 18, color: 'var(--md-primary)' }}>{r.kind === 'place' ? 'location_on' : 'schedule'}</span>
                  {r.kind === 'place' ? 'מיקום' : 'שעה'}
                </div>
                <div style={{ font: '800 17px var(--font-body)', color: 'var(--md-on-surface)' }}>
                  {r.kind === 'place' ? r.place : r.time}
                </div>
              </Card>
              <Card tone="lowest" style={{ flex: 1, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, font: '600 13px var(--font-body)', color: 'var(--md-on-surface-variant)', marginBottom: 6 }}>
                  <span className="msym" style={{ fontSize: 18, color: 'var(--md-primary)' }}>{r.kind === 'place' ? 'tour' : 'repeat'}</span>
                  {r.kind === 'place' ? 'טריגר' : 'חזרתיות'}
                </div>
                <div style={{ font: '800 17px var(--font-body)', color: 'var(--md-on-surface)' }}>
                  {r.kind === 'place' ? (r.trigger === 'arrive' ? 'בהגעה' : 'ביציאה') : (r.repeat || 'חד פעמי')}
                </div>
              </Card>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button variant="outline" icon="delete" onClick={() => { onDelete(r.id); onClose(); }} style={{ flex: '0 0 auto' }} />
              <Button full icon={r.done ? 'replay' : 'check'} onClick={() => { onToggle(r.id); onClose(); }}>
                {r.done ? 'בטל ביצוע' : 'סמן כבוצע'}
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function BottomBar({ active, onNav, onAdd }) {
  const barRef = useRef(null);
  const iconRefs = useRef({});
  const [pill, setPill] = useState(null);

  React.useLayoutEffect(() => {
    const el = iconRefs.current[active];
    const bar = barRef.current;
    if (!el || !bar) return;
    const r = el.getBoundingClientRect();
    const br = bar.getBoundingClientRect();
    setPill({ left: r.left - br.left, top: r.top - br.top, width: r.width, height: r.height });
  }, [active]);

  return (
    <div style={{
      position: 'absolute', insetInline: 0, bottom: 0, zIndex: 30,
      padding: '0 16px 18px', pointerEvents: 'none',
    }}>
      <div ref={barRef} style={{
        position: 'relative', pointerEvents: 'auto',
        display: 'flex', alignItems: 'center', height: 70, padding: '0 6px',
        background: 'color-mix(in oklab, var(--md-surface-container) 86%, transparent)',
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        borderRadius: 'var(--r-xl)', border: '1px solid color-mix(in oklab, var(--md-outline-variant) 55%, transparent)',
        boxShadow: 'var(--sh-2)',
      }}>
        {/* sliding active pill */}
        {pill && (
          <div style={{
            position: 'absolute', left: pill.left, top: pill.top,
            width: pill.width, height: pill.height, borderRadius: 'var(--r-pill)',
            background: 'var(--md-secondary-container)',
            transition: 'left .45s var(--ease-spring), width .45s var(--ease-spring)',
            zIndex: 0,
          }} />
        )}
        {NAV.slice(0, 2).map((n) => <NavBtn key={n.id} n={n} active={active} onNav={onNav} iconRefs={iconRefs} />)}
        <div style={{ flex: '0 0 auto', width: 70 }} />
        {NAV.slice(2).map((n) => <NavBtn key={n.id} n={n} active={active} onNav={onNav} iconRefs={iconRefs} />)}
      </div>
      {/* raised FAB */}
      <div style={{ position: 'absolute', left: '50%', bottom: 32, transform: 'translateX(-50%)', pointerEvents: 'auto' }}>
        <Fab onAdd={onAdd} />
      </div>
    </div>
  );
}

function NavBtn({ n, active, onNav, iconRefs }) {
  const on = active === n.id;
  return (
    <button onClick={() => onNav(n.id)} style={{
      flex: 1, border: 'none', background: 'transparent', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
      WebkitTapHighlightColor: 'transparent', padding: '8px 0', position: 'relative', zIndex: 1,
    }}>
      <div ref={(el) => { if (el) iconRefs.current[n.id] = el; }} style={{
        width: 54, height: 32, borderRadius: 'var(--r-pill)', display: 'grid', placeItems: 'center',
      }}>
        <span className="msym" style={{
          fontSize: 25, color: on ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
          fontVariationSettings: on ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400",
          transition: 'color .3s var(--ease), font-variation-settings .3s var(--ease)',
          transform: on ? 'translateY(-1px)' : 'none',
        }}>{n.icon}</span>
      </div>
      <span style={{ font: `${on ? 700 : 500} 11px var(--font-body)`, color: on ? 'var(--md-on-surface)' : 'var(--md-on-surface-variant)', transition: 'color .3s' }}>{n.label}</span>
    </button>
  );
}

function Fab({ onAdd }) {
  const ripple = useRipple();
  return (
    <button className="ripple-host fab-pulse pressable" onClick={(e) => { ripple(e); onAdd(); }}
      style={{
        width: 66, height: 66, borderRadius: 'var(--r-lg)', border: 'none', cursor: 'pointer',
        background: 'radial-gradient(130% 130% at 32% 25%, color-mix(in oklab, var(--md-primary) 78%, #fff 22%), var(--md-primary))',
        color: 'var(--md-on-primary)', position: 'relative',
        overflow: 'hidden', display: 'grid', placeItems: 'center',
        boxShadow: '0 10px 26px -6px var(--md-primary), var(--clay-hi)', WebkitTapHighlightColor: 'transparent',
      }}>
      <span className="msym" style={{ fontSize: 32, fontVariationSettings: "'wght' 500" }}>add</span>
    </button>
  );
}

function Toast({ msg }) {
  return (
    <div style={{
      position: 'absolute', bottom: 96, insetInline: 0, display: 'grid', placeItems: 'center',
      zIndex: 50, pointerEvents: 'none',
    }}>
      <div className="toast-in" style={{
        background: 'var(--md-inverse-surface)', color: 'var(--md-inverse-on-surface)',
        padding: '12px 20px', borderRadius: 'var(--r-pill)', font: '600 14px var(--font-body)',
        display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 6px 20px -4px rgba(0,0,0,.4)',
      }}>
        <span className="msym" style={{ fontSize: 18, color: 'var(--md-primary)' }}>check_circle</span>
        {msg}
      </div>
    </div>
  );
}

function App() {
  const rootRef = useRef(null);
  const { seed, setSeed, mode, setMode } = useDynamicColor();
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    const f = FONT_MAP[t.fontPair] || FONT_MAP.rubik;
    const de = document.documentElement;
    de.style.setProperty('--font-display', f.display);
    de.style.setProperty('--font-body', f.body);
    de.style.setProperty('--rs', String(t.radius));
  }, [t.fontPair, t.radius]);
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem('ultra-onb') === '1');
  const [tab, setTab] = useState('home');
  const [adding, setAdding] = useState(false);
  const [detail, setDetail] = useState(null);
  const [colorOpen, setColorOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [reminders, setReminders] = useState(TODAY_REMINDERS);
  const [navKey, setNavKey] = useState(0);

  useEffect(() => { setNavKey((k) => k + 1); }, [tab]);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 2200); };

  const toggle = (id) => setReminders((rs) => rs.map((r) => {
    if (r.id !== id) return r;
    const done = !r.done;
    if (done) showToast('המשימה הושלמה! 🎉');
    return { ...r, done, doneAt: done ? new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : undefined };
  }));

  const del = (id) => setReminders((rs) => rs.filter((r) => r.id !== id));

  const addReminder = (data) => {
    setReminders((rs) => [{ id: 'n' + Date.now(), done: false, sub: data.kind === 'place' ? (data.trigger === 'arrive' ? 'בהגעה למקום' : 'ביציאה מהמקום') : data.repeat, ...data }, ...rs]);
    setAdding(false);
    setTab('home');
    showToast('התזכורת נוספה ✨');
  };

  if (!onboarded) {
    return (
      <div ref={rootRef} className="ultra-root">
        <OnboardingScreen onDone={() => { localStorage.setItem('ultra-onb', '1'); setOnboarded(true); }} />
      </div>
    );
  }

  return (
    <div ref={rootRef} className="ultra-root">
      <div className="scroll-area" style={{ position: 'absolute', inset: 0, bottom: 0, paddingBottom: 104, overflowY: 'auto', overflowX: 'hidden' }}>
        <div key={navKey} className="screen-enter">
          {tab === 'home' && <HomeScreen reminders={reminders} onToggle={toggle} onOpen={setDetail} name="נועם" onOpenColor={() => setColorOpen(true)} mode={mode} setMode={setMode} />}
          {tab === 'calendar' && <CalendarScreen reminders={reminders} onToggle={toggle} onOpen={setDetail} />}
          {tab === 'stats' && <StatsScreen />}
          {tab === 'profile' && <ProfileScreen mode={mode} setMode={setMode} onOpenColor={() => setColorOpen(true)} seed={seed} />}
        </div>
      </div>

      <BottomBar active={tab} onNav={setTab} onAdd={() => setAdding(true)} />

      {/* Add reminder full overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 45, background: 'var(--md-surface)',
        transform: adding ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform .45s var(--ease-spring)', overflowY: 'auto',
      }}>
        {adding && <AddScreen onClose={() => setAdding(false)} onSave={addReminder} />}
      </div>

      <DetailSheet r={detail} onClose={() => setDetail(null)} onToggle={toggle} onDelete={del} />
      <ColorSheet open={colorOpen} onClose={() => setColorOpen(false)} seed={seed} setSeed={setSeed} />
      {toast && <Toast msg={toast} />}

      <TweaksPanel title="Tweaks">
        <TweakSection label="\u05d8\u05d9\u05e4\u05d5\u05d2\u05e8\u05e4\u05d9\u05d4" />
        <TweakSelect label="\u05d2\u05d5\u05e4\u05e0\u05d9\u05dd" value={t.fontPair} options={FONT_OPTS}
          onChange={(v) => setTweak('fontPair', v)} />
        <TweakSection label="\u05e6\u05d5\u05e8\u05d4" />
        <TweakSlider label="\u05e2\u05d2\u05d5\u05dc\u05d5\u05ea \u05e4\u05d9\u05e0\u05d5\u05ea" value={t.radius} min={0.3} max={1.8} step={0.1}
          onChange={(v) => setTweak('radius', v)} />
        <TweakSection label="\u05e6\u05d1\u05e2 \u05d3\u05d9\u05e0\u05de\u05d9" />
        <TweakColor label="\u05e6\u05d1\u05e2 \u05d1\u05e1\u05d9\u05e1" value={seed}
          options={SEED_COLORS.map((c) => c.hex)} onChange={(v) => setSeed(v)} />
        <TweakToggle label="\u05de\u05e6\u05d1 \u05db\u05d4\u05d4" value={mode === 'dark'}
          onChange={(v) => setMode(v ? 'dark' : 'light')} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
