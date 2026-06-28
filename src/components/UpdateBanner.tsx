import { useState } from 'react';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import type { UpdateInfo } from '../services/appUpdate';
import { installUpdate } from '../services/appUpdate';

interface UpdateBannerProps {
  info: UpdateInfo;
  onDismiss: () => void;
  showToast: (msg: string) => void;
}

export function UpdateBanner({ info, onDismiss, showToast }: UpdateBannerProps) {
  const [busy, setBusy] = useState(false);

  const update = async () => {
    if (busy) return;
    setBusy(true);
    showToast('מוריד עדכון… ⬇️');
    try {
      await installUpdate(info.url);
    } catch {
      showToast('העדכון נכשל — נסה שוב');
      setBusy(false);
    }
  };

  return (
    <div
      className="reveal"
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 'calc(86px + env(safe-area-inset-bottom, 0px))',
        zIndex: 60, display: 'flex', justifyContent: 'center', padding: '0 16px',
        pointerEvents: 'none',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 520, pointerEvents: 'auto',
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--md-surface-container-high)',
        border: '1.5px solid var(--md-outline-variant)',
        borderRadius: 'var(--r-lg)', padding: '12px 14px',
        boxShadow: 'var(--sh-2)',
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 'var(--r-md)', flexShrink: 0,
          display: 'grid', placeItems: 'center',
          background: 'var(--md-primary-container)', color: 'var(--md-on-primary-container)',
        }}>
          <Icon name="download" size={22} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: '800 15px var(--font-display)', color: 'var(--md-on-surface)' }}>
            גרסה חדשה זמינה
          </div>
          <div style={{
            font: '500 12px var(--font-body)', color: 'var(--md-on-surface-variant)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {info.notes || (info.versionName ? `גרסה ${info.versionName}` : 'לחץ לעדכון האפליקציה')}
          </div>
        </div>
        <Button icon="download" onClick={update} disabled={busy}
          style={{ height: 42, padding: '0 16px', flexShrink: 0 }}>
          {busy ? 'מעדכן…' : 'עדכן'}
        </Button>
        <button
          onClick={onDismiss}
          aria-label="סגור"
          style={{
            width: 30, height: 30, borderRadius: '50%', border: 'none', flexShrink: 0,
            background: 'transparent', color: 'var(--md-on-surface-variant)',
            display: 'grid', placeItems: 'center', cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <Icon name="x" size={16} />
        </button>
      </div>
    </div>
  );
}
