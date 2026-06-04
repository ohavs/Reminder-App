import { useState } from 'react';
import type { ReactNode } from 'react';
import type { ThemeMode } from '../types';
import { SEED_COLORS } from '../data/sampleData';
import { signOut } from '../firebase/auth';
import { Card } from '../components/ui/Card';
import { TopBar } from '../components/ui/TopBar';
import { SectionTitle } from '../components/ui/SectionTitle';
import { Button } from '../components/ui/Button';
import { Switch } from '../components/ui/Switch';
import { ClayTile } from '../components/illustrations/ClayTile';
import { useRipple } from '../hooks/useRipple';

function SettingRow({ icon, tone, title, sub, trailing, onClick }: {
  icon: string;
  tone?: string;
  title: string;
  sub?: string;
  trailing?: ReactNode;
  onClick?: () => void;
}) {
  const ripple = useRipple();
  return (
    <div
      className={onClick ? 'ripple-host pressable' : ''}
      onClick={onClick ? (e) => { ripple(e); onClick(); } : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <ClayTile icon={icon} tone={(tone as 'primary' | 'secondary' | 'tertiary' | 'error') || 'secondary'} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '700 15px var(--font-body)', color: 'var(--md-on-surface)' }}>{title}</div>
        {sub && (
          <div style={{ font: '500 13px var(--font-body)', color: 'var(--md-on-surface-variant)', marginTop: 2 }}>
            {sub}
          </div>
        )}
      </div>
      {trailing}
    </div>
  );
}

interface ProfileScreenProps {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  onOpenColor: () => void;
  seed: string;
  user: { displayName: string | null; email: string | null; photoURL: string | null } | null;
  completedCount: number;
}

export function ProfileScreen({ mode, setMode, onOpenColor, seed, user, completedCount }: ProfileScreenProps) {
  const [geo, setGeo] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [sound, setSound] = useState(true);
  const [radius, setRadius] = useState(1);
  const seedName = (SEED_COLORS.find((c) => c.hex.toLowerCase() === seed.toLowerCase()) || {}).name || 'מותאם אישית';

  const handleRadiusChange = (val: number) => {
    setRadius(val);
    document.documentElement.style.setProperty('--rs', String(val));
  };

  return (
    <div className="screen-pad">
      <TopBar
        title={<div style={{ font: '800 24px var(--font-display)', color: 'var(--md-on-surface)' }}>פרופיל</div>}
      />

      {/* Profile header */}
      <Card tone="base" className="reveal" style={{
        padding: 22, marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 16,
        background: 'radial-gradient(120% 120% at 85% 0%, var(--md-primary-container), var(--md-surface-container))',
      }}>
        {user?.photoURL ? (
          <img
            src={user.photoURL} alt="avatar"
            style={{ width: 68, height: 68, borderRadius: '50%', flexShrink: 0, objectFit: 'cover', boxShadow: 'var(--sh-2)' }}
          />
        ) : (
          <div style={{
            width: 68, height: 68, borderRadius: '50%', flexShrink: 0,
            background: 'radial-gradient(120% 120% at 30% 25%, var(--md-tertiary-container), var(--md-tertiary))',
            display: 'grid', placeItems: 'center',
            font: '800 26px var(--font-display)', color: 'var(--md-on-tertiary-container)',
            boxShadow: 'inset 0 2px 5px rgba(255,255,255,.4)',
          }}>
            {(user?.displayName ?? 'א')[0]}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: '800 20px var(--font-display)', color: 'var(--md-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.displayName || 'אורח'}
          </div>
          <div style={{ font: '500 14px var(--font-body)', color: 'var(--md-on-surface-variant)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email || 'כניסה אנונימית'}
          </div>
        </div>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ font: '800 22px var(--font-display)', color: 'var(--md-primary)' }}>{completedCount}</div>
          <div style={{ font: '600 11px var(--font-body)', color: 'var(--md-on-surface-variant)' }}>הושלמו</div>
        </div>
      </Card>

      {/* Appearance */}
      <SectionTitle>מראה</SectionTitle>
      <Card tone="lowest" style={{ marginBottom: 22, overflow: 'hidden' }}>
        <SettingRow
          icon="palette" tone="primary" title="צבע דינמי" sub={seedName}
          onClick={onOpenColor}
          trailing={
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: seed, border: '2px solid var(--md-outline-variant)', flexShrink: 0 }} />
          }
        />
        <div style={{ height: 1, background: 'var(--md-outline-variant)', marginInline: 16 }} />
        <SettingRow
          icon={mode === 'dark' ? 'dark_mode' : 'light_mode'} tone="tertiary"
          title="מצב כהה" sub={mode === 'dark' ? 'פעיל' : 'כבוי'}
          trailing={<Switch checked={mode === 'dark'} onChange={(v) => setMode(v ? 'dark' : 'light')} />}
        />
        <div style={{ height: 1, background: 'var(--md-outline-variant)', marginInline: 16 }} />
        <SettingRow
          icon="volume_up" tone="secondary" title="צלילי התראה" sub="צליל בעת תזכורת"
          trailing={<Switch checked={sound} onChange={setSound} />}
        />
        <div style={{ height: 1, background: 'var(--md-outline-variant)', marginInline: 16 }} />
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12, font: '700 14px var(--font-body)', color: 'var(--md-on-surface-variant)' }}>
            <span className="msym" style={{ fontSize: 19, color: 'var(--md-primary)' }}>rounded_corner</span>
            עיגול פינות: {Math.round(radius * 100)}%
          </div>
          <input
            type="range" min="0.3" max="1.8" step="0.1" value={radius}
            onChange={(e) => handleRadiusChange(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--md-primary)' }}
          />
        </div>
      </Card>

      {/* Privacy */}
      <SectionTitle>פרטיות ונתונים</SectionTitle>
      <Card tone="lowest" style={{ marginBottom: 22, overflow: 'hidden' }}>
        <SettingRow
          icon="my_location" tone="tertiary" title="תזכורות מבוססות מיקום"
          sub="Geofence — הכל מעובד במכשיר"
          trailing={<Switch checked={geo} onChange={setGeo} />}
        />
        <div style={{ height: 1, background: 'var(--md-outline-variant)', marginInline: 16 }} />
        <SettingRow
          icon="lock" tone="primary" title="עיבוד מקומי בלבד"
          sub="הנתונים לא יוצאים מהמכשיר"
          trailing={<span className="msym" style={{ color: 'var(--md-primary)', fontSize: 22 }}>verified_user</span>}
        />
        <div style={{ height: 1, background: 'var(--md-outline-variant)', marginInline: 16 }} />
        <SettingRow
          icon="insights" tone="secondary" title="שיתוף אנליטיקה אנונימית"
          sub={analytics ? 'פעיל' : 'כבוי'}
          trailing={<Switch checked={analytics} onChange={setAnalytics} />}
        />
      </Card>

      {/* Backup */}
      <SectionTitle>גיבוי</SectionTitle>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <Button variant="tonal" full icon="download" style={{ flex: 1 }}>ייצוא נתונים</Button>
        <Button variant="outline" full icon="upload" style={{ flex: 1 }}>ייבוא</Button>
      </div>

      {/* Sign out */}
      <Button
        variant="outline"
        full
        icon="logout"
        onClick={() => signOut()}
        style={{ color: 'var(--md-error)', borderColor: 'var(--md-error)', marginBottom: 16 }}
      >
        יציאה מהחשבון
      </Button>
    </div>
  );
}
