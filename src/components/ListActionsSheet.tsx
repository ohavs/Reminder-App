import { useEffect, useState } from 'react';
import type { SharedList, Invite } from '../types';
import { BottomSheet } from './ui/BottomSheet';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';

interface ListActionsSheetProps {
  list: SharedList | null;
  uid: string;
  onClose: () => void;
  onRename: (id: string, name: string) => void;
  onDelete: (list: SharedList) => void;
  onShare: (list: SharedList, email: string) => Promise<void>;
  sentInvites: Invite[];
  showToast: (msg: string) => void;
}

const fieldStyle: React.CSSProperties = {
  flex: 1, height: 48, padding: '0 16px', borderRadius: 'var(--r-md)',
  border: '1.5px solid var(--md-outline-variant)',
  background: 'var(--md-surface-container-lowest)',
  color: 'var(--md-on-surface)', font: '600 15px var(--font-body)', outline: 'none', minWidth: 0,
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'ממתין לאישור', accepted: 'הצטרף ✓', declined: 'דחה',
};

export function ListActionsSheet({ list, uid, onClose, onRename, onDelete, onShare, sentInvites, showToast }: ListActionsSheetProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (list) { setName(list.name); setEmail(''); } }, [list?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const isOwner = !!list && list.ownerId === uid;
  const listInvites = list ? sentInvites.filter((i) => i.listId === list.id) : [];

  const saveName = () => {
    if (!list || !name.trim() || name.trim() === list.name) return;
    onRename(list.id, name.trim());
    showToast('שם הרשימה עודכן ✨');
  };

  const share = async () => {
    if (!list || !email.trim() || busy) return;
    setBusy(true);
    try {
      await onShare(list, email.trim());
      setEmail('');
      showToast('ההזמנה נשלחה 📩');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'שליחת ההזמנה נכשלה');
    }
    setBusy(false);
  };

  const remove = () => {
    if (!list) return;
    const msg = isOwner ? 'למחוק את הרשימה לכל החברים?' : 'לעזוב את הרשימה?';
    if (window.confirm(msg)) { onDelete(list); onClose(); }
  };

  return (
    <BottomSheet open={!!list} onClose={onClose} maxWidth={520} maxHeight="88%" padding="14px 22px 30px">
      {list && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Icon name="users" size={24} color="var(--md-primary)" />
            <h3 style={{ font: '800 20px var(--font-display)', color: 'var(--md-on-surface)', margin: 0 }}>{list.name}</h3>
          </div>
          <p style={{ font: '500 13px var(--font-body)', color: 'var(--md-on-surface-variant)', margin: '0 0 20px' }}>
            {list.members.length} חברים{isOwner ? ' · אתה הבעלים' : ''}
          </p>

          {/* Rename */}
          <div style={{ font: '700 13px var(--font-body)', color: 'var(--md-on-surface-variant)', marginBottom: 8 }}>שם הרשימה</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <input value={name} onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveName(); }} style={fieldStyle} />
            <Button icon="check" onClick={saveName} disabled={!name.trim() || name.trim() === list.name}
              style={{ height: 48, padding: '0 18px' }}>שמור</Button>
          </div>

          {/* Share by email */}
          <div style={{ font: '700 13px var(--font-body)', color: 'var(--md-on-surface-variant)', marginBottom: 8 }}>שיתוף במייל</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" inputMode="email"
              onKeyDown={(e) => { if (e.key === 'Enter') share(); }}
              placeholder="כתובת המייל של החבר" style={{ ...fieldStyle, direction: 'ltr', textAlign: 'right' }} />
            <Button variant="tonal" icon="upload" onClick={share} disabled={busy || !email.trim()}
              style={{ height: 48, padding: '0 18px' }}>הזמן</Button>
          </div>

          {/* Sent invites status */}
          {listInvites.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {listInvites.map((i) => (
                <div key={i.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                  borderRadius: 'var(--r-md)', background: 'var(--md-surface-container-low)',
                }}>
                  <Icon name="user" size={16} color="var(--md-on-surface-variant)" />
                  <span style={{ flex: 1, minWidth: 0, font: '600 13px var(--font-body)', color: 'var(--md-on-surface)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr', textAlign: 'right' }}>
                    {i.email}
                  </span>
                  <span style={{
                    font: '700 11px var(--font-body)', padding: '3px 10px', borderRadius: 'var(--r-pill)',
                    background: i.status === 'accepted' ? 'var(--md-primary-container)' : 'var(--md-surface-container-highest)',
                    color: i.status === 'accepted' ? 'var(--md-on-primary-container)' : 'var(--md-on-surface-variant)',
                  }}>
                    {STATUS_LABEL[i.status]}
                  </span>
                </div>
              ))}
            </div>
          )}

          <Button variant="outline" full icon={isOwner ? 'trash' : 'log-out'} onClick={remove}
            style={{ color: 'var(--md-error)', borderColor: 'var(--md-error)' }}>
            {isOwner ? 'מחיקת הרשימה' : 'עזיבת הרשימה'}
          </Button>
        </>
      )}
    </BottomSheet>
  );
}
