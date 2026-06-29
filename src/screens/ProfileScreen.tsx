import { useState } from 'react';
import type { ReactNode } from 'react';
import type { ThemeMode, Reminder } from '../types';
import { SEED_COLORS } from '../data/sampleData';
import { signOut } from '../firebase/auth';
import { Card } from '../components/ui/Card';
import { TopBar } from '../components/ui/TopBar';
import { SectionTitle } from '../components/ui/SectionTitle';
import { Button } from '../components/ui/Button';
import { Switch } from '../components/ui/Switch';
import { Icon } from '../components/ui/Icon';
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
  reminders: Reminder[];
  onImport: (items: unknown[]) => void;
}

function initialRadius(): number {
  const saved = parseFloat(localStorage.getItem('ultra-rs') || '');
  if (Number.isFinite(saved) && saved > 0) return saved;
  const css = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--rs'));
  return Number.isFinite(css) && css > 0 ? css : 1;
}

export function ProfileScreen({ mode, setMode, onOpenColor, seed, user, reminders, onImport }: ProfileScreenProps) {
  const [sound, setSound] = useState(true);
  const [radius, setRadius] = useState(initialRadius);
  const seedName = (SEED_COLORS.find((c) => c.hex.toLowerCase() === seed.toLowerCase()) || {}).name || 'מותאם אישית';

  const exportData = () => {
    const blob = new Blob([JSON.stringify(reminders, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ultra-reminders-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const items = JSON.parse(await file.text());
        if (Array.isArray(items)) onImport(items);
      } catch { /* invalid file — ignore */ }
    };
    input.click();
  };

  const handleRadiusChange = (val: number) => {
    setRadius(val);
    document.documentElement.style.setProperty('--rs', String(val));
    localStorage.setItem('ultra-rs', String(val));
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
          icon={mode === 'dark' ? 'moon' : 'sun'} tone="tertiary"
          title="מצב כהה" sub={mode === 'dark' ? 'פעיל' : 'כבוי'}
          trailing={<Switch checked={mode === 'dark'} onChange={(v) => setMode(v ? 'dark' : 'light')} />}
        />
        <div style={{ height: 1, background: 'var(--md-outline-variant)', marginInline: 16 }} />
        <SettingRow
          icon="volume" tone="secondary" title="צלילי התראה" sub="צליל בעת תזכורת"
          trailing={<Switch checked={sound} onChange={setSound} />}
        />
        <div style={{ height: 1, background: 'var(--md-outline-variant)', marginInline: 16 }} />
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12, font: '700 14px var(--font-body)', color: 'var(--md-on-surface-variant)' }}>
            <Icon name="sliders" size={18} color="var(--md-primary)" />
            עיגול פינות: {Math.round(radius * 100)}%
          </div>
          <input
            type="range" min="0.3" max="1.8" step="0.1" value={radius}
            onChange={(e) => handleRadiusChange(parseFloat(e.target.value))}
            className="ultra-range"
          />
        </div>
      </Card>

      {/* Backup */}
      <SectionTitle>גיבוי</SectionTitle>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <Button variant="tonal" full icon="download" style={{ flex: 1 }} onClick={exportData}>ייצוא נתונים</Button>
        <Button variant="outline" full icon="upload" style={{ flex: 1 }} onClick={importData}>ייבוא</Button>
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
