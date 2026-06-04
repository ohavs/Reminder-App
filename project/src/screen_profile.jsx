/* ULTRA · Profile / Settings + Dynamic Color sheet */

/* Bottom sheet for dynamic color */
function ColorSheet({ open, onClose, seed, setSeed }) {
  const { h } = open ? hexToOklch(seed) : { h: 0 };
  const [hue, setHue] = React.useState(Math.round(h));
  React.useEffect(() => { if (open) setHue(Math.round(hexToOklch(seed).h)); }, [open]);

  const applyHue = (val) => {
    setHue(val);
    // build a hex from hue via oklch->we just store an oklch-ish hex approximation:
    // easier: create a seed hex by sampling a known sat/light at this hue.
    const c = document.createElement('canvas'); // not needed; use oklch directly
    setSeed(oklchHueToHex(val));
  };

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
        padding: '14px 22px 28px', transform: open ? 'translateY(0)' : 'translateY(110%)',
        transition: 'transform .42s var(--ease-spring)', boxShadow: '0 -8px 40px -8px rgba(0,0,0,.3)',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--md-outline-variant)', margin: '0 auto 18px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span className="msym" style={{ fontSize: 24, color: 'var(--md-primary)' }}>palette</span>
          <h3 style={{ font: '800 20px var(--font-display)', color: 'var(--md-on-surface)', margin: 0 }}>צבע דינמי</h3>
        </div>
        <p style={{ font: '500 14px var(--font-body)', color: 'var(--md-on-surface-variant)', margin: '0 0 20px' }}>
          בחר צבע בסיס — כל הממשק יתאים את עצמו אוטומטית
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
          {SEED_COLORS.map((c) => {
            const sel = c.hex.toLowerCase() === seed.toLowerCase();
            return (
              <button key={c.hex} onClick={() => setSeed(c.hex)}
                style={{
                  aspectRatio: '1', borderRadius: 'var(--r-md)', cursor: 'pointer',
                  border: sel ? '3px solid var(--md-on-surface)' : '2px solid transparent',
                  background: c.hex, display: 'grid', placeItems: 'center',
                  WebkitTapHighlightColor: 'transparent', transition: 'transform .2s var(--ease-spring)',
                  transform: sel ? 'scale(1.06)' : 'scale(1)',
                }}>
                {sel && <span className="msym" style={{ fontSize: 26, color: '#fff' }}>check</span>}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span className="msym" style={{ fontSize: 19, color: 'var(--md-on-surface-variant)' }}>tune</span>
          <span style={{ font: '700 14px var(--font-body)', color: 'var(--md-on-surface-variant)' }}>גוון מותאם אישית</span>
        </div>
        <input type="range" min="0" max="360" value={hue} onChange={(e) => applyHue(+e.target.value)}
          className="hue-slider"
          style={{ width: '100%', height: 22, borderRadius: 'var(--r-pill)', appearance: 'none',
            background: 'linear-gradient(to left, oklch(.6 .15 0), oklch(.6 .15 60), oklch(.6 .15 120), oklch(.6 .15 180), oklch(.6 .15 240), oklch(.6 .15 300), oklch(.6 .15 360))',
            cursor: 'pointer' }} />

        <div style={{ marginTop: 22 }}>
          <Button full onClick={onClose}>סיום</Button>
        </div>
      </div>
    </>
  );
}

/* approximate hex from a hue at fixed L/C (for the slider) */
function oklchHueToHex(hue) {
  // oklch(0.6 0.15 hue) -> sRGB hex
  const L = 0.6, C = 0.15, h = (hue * Math.PI) / 180;
  const a = C * Math.cos(h), b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  let r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let bb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  const lin = (x) => {
    x = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
    return Math.max(0, Math.min(255, Math.round(x * 255)));
  };
  const hx = (n) => n.toString(16).padStart(2, '0');
  return '#' + hx(lin(r)) + hx(lin(g)) + hx(lin(bb));
}

function SettingRow({ icon, tone, title, sub, trailing, onClick }) {
  const ripple = useRipple();
  return (
    <div className={onClick ? 'ripple-host pressable' : ''} onClick={onClick ? (e) => { ripple(e); onClick(e); } : undefined}
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', cursor: onClick ? 'pointer' : 'default', position: 'relative', overflow: 'hidden' }}>
      <ClayTile icon={icon} tone={tone || 'secondary'} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '700 15px var(--font-body)', color: 'var(--md-on-surface)' }}>{title}</div>
        {sub && <div style={{ font: '500 13px var(--font-body)', color: 'var(--md-on-surface-variant)', marginTop: 2 }}>{sub}</div>}
      </div>
      {trailing}
    </div>
  );
}

function ProfileScreen({ mode, setMode, onOpenColor, seed }) {
  const [geo, setGeo] = React.useState(true);
  const [analytics, setAnalytics] = React.useState(false);
  const [sound, setSound] = React.useState(true);
  const seedName = (SEED_COLORS.find((c) => c.hex.toLowerCase() === seed.toLowerCase()) || {}).name || 'מותאם אישית';

  return (
    <div className="screen-pad">
      <TopBar title={<div style={{ font: '800 24px var(--font-display)', color: 'var(--md-on-surface)' }}>פרופיל</div>}
        actions={[<IconButton key="e" icon="edit" tone="container" />]} />

      {/* profile header */}
      <Card tone="base" className="reveal" style={{
        padding: 22, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16,
        background: 'radial-gradient(120% 120% at 85% 0%, var(--md-primary-container), var(--md-surface-container))',
        
      }}>
        <div style={{
          width: 68, height: 68, borderRadius: '50%', flexShrink: 0,
          background: 'radial-gradient(120% 120% at 30% 25%, var(--md-tertiary-container), var(--md-tertiary))',
          display: 'grid', placeItems: 'center', font: '800 26px var(--font-display)',
          color: 'var(--md-on-tertiary-container)', boxShadow: 'inset 0 2px 5px rgba(255,255,255,.4)',
        }}>נ</div>
        <div style={{ flex: 1 }}>
          <div style={{ font: '800 20px var(--font-display)', color: 'var(--md-on-surface)' }}>נועם לוי</div>
          <div style={{ font: '500 14px var(--font-body)', color: 'var(--md-on-surface-variant)', marginTop: 2 }}>noam@ultra.app</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ font: '800 22px var(--font-display)', color: 'var(--md-primary)' }}>62</div>
          <div style={{ font: '600 11px var(--font-body)', color: 'var(--md-on-surface-variant)' }}>הושלמו</div>
        </div>
      </Card>

      <SectionTitle>מראה</SectionTitle>
      <Card tone="lowest" style={{ marginBottom: 22, overflow: 'hidden' }}>
        <SettingRow icon="palette" tone="primary" title="צבע דינמי" sub={seedName} onClick={onOpenColor}
          trailing={<div style={{ width: 26, height: 26, borderRadius: '50%', background: seed, border: '2px solid var(--md-outline-variant)' }} />} />
        <div style={{ height: 1, background: 'var(--md-outline-variant)', marginInline: 16 }} />
        <SettingRow icon={mode === 'dark' ? 'dark_mode' : 'light_mode'} tone="tertiary" title="מצב כהה" sub={mode === 'dark' ? 'פעיל' : 'כבוי'}
          trailing={<Switch checked={mode === 'dark'} onChange={(v) => setMode(v ? 'dark' : 'light')} />} />
        <div style={{ height: 1, background: 'var(--md-outline-variant)', marginInline: 16 }} />
        <SettingRow icon="volume_up" tone="secondary" title="צלילי התראה" sub="צליל בעת תזכורת"
          trailing={<Switch checked={sound} onChange={setSound} />} />
      </Card>

      <SectionTitle>פרטיות ונתונים</SectionTitle>
      <Card tone="lowest" style={{ marginBottom: 22, overflow: 'hidden' }}>
        <SettingRow icon="my_location" tone="tertiary" title="תזכורות מבוססות מיקום" sub="Geofence — הכל מעובד במכשיר"
          trailing={<Switch checked={geo} onChange={setGeo} />} />
        <div style={{ height: 1, background: 'var(--md-outline-variant)', marginInline: 16 }} />
        <SettingRow icon="lock" tone="primary" title="עיבוד מקומי בלבד" sub="הנתונים לא יוצאים מהמכשיר"
          trailing={<span className="msym" style={{ color: 'var(--md-primary)', fontSize: 22 }}>verified_user</span>} />
        <div style={{ height: 1, background: 'var(--md-outline-variant)', marginInline: 16 }} />
        <SettingRow icon="insights" tone="secondary" title="שיתוף אנליטיקה אנונימית" sub={analytics ? 'פעיל' : 'כבוי'}
          trailing={<Switch checked={analytics} onChange={setAnalytics} />} />
      </Card>

      <SectionTitle>גיבוי</SectionTitle>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Button variant="tonal" full icon="download" style={{ flex: 1 }}>ייצוא נתונים</Button>
        <Button variant="outline" full icon="upload" style={{ flex: 1 }}>ייבוא</Button>
      </div>
    </div>
  );
}

Object.assign(window, { ProfileScreen, ColorSheet, SettingRow, oklchHueToHex });
