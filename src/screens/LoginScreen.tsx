import { useState } from 'react';
import { signInWithGoogle, signInAnon } from '../firebase/auth';
import { ClayBell } from '../components/illustrations/ClayBell';
import { ClayPin } from '../components/illustrations/ClayPin';
import { ClayCheck } from '../components/illustrations/ClayCheck';
import { Button } from '../components/ui/Button';

const FEATURES = [
  { illo: 'bell' as const, title: 'לעולם לא תשכח', body: 'תזכורות חכמות לפי שעה, חזרתיות ועדיפות.' },
  { illo: 'pin'  as const, title: 'לפי מיקום',     body: 'Geofence — קבל תזכורת בהגעה או יציאה ממקום.' },
  { illo: 'check' as const, title: 'פרטיות מלאה',  body: 'הנתונים שלך מוגנים בענן ומוצפנים.' },
];

const APP_VERSION = 'v1.1';

function LoginForm() {
  const [loading, setLoading] = useState<'google' | 'anon' | null>(null);
  const [error, setError]     = useState<string | null>(null);

  const handleGoogle = async () => {
    setError(null); setLoading('google');
    try { await signInWithGoogle(); }
    catch (e) {
      const msg = e instanceof Error ? e.message : '';
      setError(`ההתחברות נכשלה. נסה שוב.${msg ? ` (${msg})` : ''}`);
      setLoading(null);
    }
  };

  const handleAnon = async () => {
    setError(null); setLoading('anon');
    try { await signInAnon(); }
    catch { setError('אירעה שגיאה. נסה שוב.'); setLoading(null); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <button
        onClick={handleGoogle}
        disabled={loading !== null}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          width: '100%', height: 54, borderRadius: 'var(--r-xl)',
          background: 'var(--md-surface-container-high)',
          border: '1.5px solid var(--md-outline-variant)',
          cursor: loading !== null ? 'not-allowed' : 'pointer',
          font: '700 16px var(--font-body)', color: 'var(--md-on-surface)',
          opacity: loading !== null ? 0.6 : 1,
          boxShadow: 'var(--sh-1)',
          marginBottom: 12,
        }}
      >
        {loading === 'google'
          ? <span className="msym" style={{ fontSize: 22, color: 'var(--md-primary)', animation: 'fab-pulse 1s infinite' }}>refresh</span>
          : <GoogleIcon />}
        {loading === 'google' ? 'מתחבר...' : 'המשך עם Google'}
      </button>

      <Button variant="tonal" full icon="person_outline" onClick={handleAnon}
        disabled={loading !== null} style={{ opacity: loading !== null ? 0.6 : 1 }}>
        {loading === 'anon' ? 'מתחבר...' : 'כניסה כאורח'}
      </Button>

      {error && (
        <div style={{
          marginTop: 16, padding: '12px 16px', borderRadius: 'var(--r-lg)',
          background: 'var(--md-error-container)', color: 'var(--md-on-error-container)',
          font: '600 14px var(--font-body)', textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      <div style={{
        marginTop: 20, font: '500 12px var(--font-body)',
        color: 'var(--md-on-surface-variant)', textAlign: 'center', lineHeight: 1.6,
      }}>
        בהתחברות אתה מסכים לתנאי השימוש. הנתונים שמורים בענן ומוגנים.
        <span style={{ opacity: 0.55 }}> · {APP_VERSION}</span>
      </div>
    </div>
  );
}

/* ── Mobile layout ── */
function MobileLogin() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100%', padding: '40px 28px',
      background: 'radial-gradient(ellipse 90% 60% at 50% 20%, var(--md-primary-container), transparent)',
    }}>
      <div style={{ marginBottom: 8, animation: 'onb-illo 0.7s var(--ease-spring) both' }}>
        <ClayBell size={110} />
      </div>
      <div style={{ font: '900 32px var(--font-display)', color: 'var(--md-on-surface)', letterSpacing: '-0.5px', marginBottom: 6, animation: 'reveal 0.5s 0.2s both' }}>
        ULTRA
      </div>
      <div style={{ font: '600 17px var(--font-body)', color: 'var(--md-on-surface-variant)', marginBottom: 44, animation: 'reveal 0.5s 0.3s both' }}>
        תזכורות חכמות
      </div>
      <div style={{ width: '100%', animation: 'reveal 0.5s 0.4s both' }}>
        <LoginForm />
      </div>
    </div>
  );
}

/* ── Desktop layout ── */
function DesktopLogin() {
  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Left panel — branding */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 56px',
        background: 'radial-gradient(130% 120% at 60% 30%, var(--md-primary-container), var(--md-surface-container-low))',
        gap: 40,
      }}>
        <div style={{ textAlign: 'center', animation: 'onb-illo 0.7s var(--ease-spring) both' }}>
          <ClayBell size={140} />
          <div style={{ font: '900 44px var(--font-display)', color: 'var(--md-on-surface)', letterSpacing: '-1px', marginTop: 16, lineHeight: 1 }}>
            ULTRA
          </div>
          <div style={{ font: '600 18px var(--font-body)', color: 'var(--md-on-surface-variant)', marginTop: 6 }}>
            תזכורות חכמות
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', maxWidth: 360, animation: 'reveal 0.5s 0.3s both' }}>
          {FEATURES.map((f, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 'var(--r-md)', flexShrink: 0,
                background: 'var(--md-surface-container)',
                display: 'grid', placeItems: 'center',
                boxShadow: 'var(--sh-1)',
              }}>
                {f.illo === 'bell'  && <ClayBell size={36} />}
                {f.illo === 'pin'   && <ClayPin size={32} />}
                {f.illo === 'check' && <ClayCheck size={32} />}
              </div>
              <div>
                <div style={{ font: '700 15px var(--font-body)', color: 'var(--md-on-surface)' }}>{f.title}</div>
                <div style={{ font: '500 13px var(--font-body)', color: 'var(--md-on-surface-variant)', marginTop: 2 }}>{f.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — login form */}
      <div style={{
        width: 420, flexShrink: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 40px',
        background: 'var(--md-surface)',
        borderInlineStart: '1px solid var(--md-outline-variant)',
      }}>
        <div style={{ width: '100%', maxWidth: 340, animation: 'reveal 0.5s 0.2s both' }}>
          <div style={{ font: '800 26px var(--font-display)', color: 'var(--md-on-surface)', marginBottom: 6 }}>
            ברוך הבא
          </div>
          <div style={{ font: '500 15px var(--font-body)', color: 'var(--md-on-surface-variant)', marginBottom: 32 }}>
            התחבר כדי לסנכרן את התזכורות שלך בכל המכשירים
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export function LoginScreen() {
  return (
    <>
      {/* Mobile */}
      <div className="login-mobile"><MobileLogin /></div>
      {/* Desktop */}
      <div className="login-desktop"><DesktopLogin /></div>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}
