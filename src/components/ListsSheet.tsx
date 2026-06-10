import { useState } from 'react';
import type { SharedList } from '../types';
import { createList, joinListByCode, leaveList } from '../firebase/lists';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';

interface ListsSheetProps {
  open: boolean;
  onClose: () => void;
  uid: string;
  lists: SharedList[];
  activeListId: string | null;
  onSelect: (listId: string | null) => void;
  showToast: (msg: string) => void;
}

const fieldStyle: React.CSSProperties = {
  flex: 1, height: 48, padding: '0 16px', borderRadius: 'var(--r-md)',
  border: '1.5px solid var(--md-outline-variant)',
  background: 'var(--md-surface-container-lowest)',
  color: 'var(--md-on-surface)', font: '600 15px var(--font-body)', outline: 'none',
  minWidth: 0,
};

export function ListsSheet({ open, onClose, uid, lists, activeListId, onSelect, showToast }: ListsSheetProps) {
  const [newName, setNewName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [busy, setBusy] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim() || busy) return;
    setBusy(true);
    try {
      const id = await createList(uid, newName);
      setNewName('');
      onSelect(id);
      showToast('הרשימה נוצרה ✨');
      onClose();
    } catch {
      showToast('יצירת הרשימה נכשלה');
    }
    setBusy(false);
  };

  const handleJoin = async () => {
    if (!joinCode.trim() || busy) return;
    setBusy(true);
    try {
      const id = await joinListByCode(uid, joinCode);
      setJoinCode('');
      onSelect(id);
      showToast('הצטרפת לרשימה 🎉');
      onClose();
    } catch {
      showToast('קוד הזמנה לא תקין');
    }
    setBusy(false);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    showToast(`קוד ההזמנה הועתק: ${code}`);
  };

  const handleLeave = async (list: SharedList) => {
    if (busy) return;
    setBusy(true);
    try {
      if (activeListId === list.id) onSelect(null);
      await leaveList(uid, list);
      showToast(list.ownerId === uid ? 'הרשימה נמחקה' : 'עזבת את הרשימה');
    } catch {
      showToast('הפעולה נכשלה');
    }
    setBusy(false);
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0, background: 'var(--md-scrim)',
          opacity: open ? 0.4 : 0, pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s var(--ease)', zIndex: 40,
        }}
      />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 41,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        pointerEvents: open ? 'auto' : 'none',
      }}>
        <div style={{
          width: '100%', maxWidth: 520,
          maxHeight: '85%', overflowY: 'auto',
          background: 'var(--md-surface-container-high)',
          borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
          padding: '14px 22px 32px',
          transform: open ? 'translateY(0)' : 'translateY(110%)',
          transition: 'transform 0.42s var(--ease-spring)',
          boxShadow: '0 -8px 40px -8px rgba(0,0,0,.3)',
          pointerEvents: 'auto',
        }}>
          <div style={{
            width: 36, height: 4, borderRadius: 2,
            background: 'var(--md-outline-variant)', margin: '0 auto 18px',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Icon name="users" size={24} color="var(--md-primary)" />
            <h3 style={{ font: '800 20px var(--font-display)', color: 'var(--md-on-surface)', margin: 0 }}>
              רשימות משותפות
            </h3>
          </div>
          <p style={{ font: '500 14px var(--font-body)', color: 'var(--md-on-surface-variant)', margin: '0 0 20px' }}>
            צור רשימה ושתף את הקוד — כל החברים רואים ומעדכנים יחד בזמן אמת
          </p>

          {/* My lists */}
          {lists.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
              {lists.map((l) => {
                const active = l.id === activeListId;
                const isOwner = l.ownerId === uid;
                return (
                  <div key={l.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                    borderRadius: 'var(--r-md)',
                    background: active ? 'var(--md-secondary-container)' : 'var(--md-surface-container-low)',
                    border: '1.5px solid ' + (active ? 'var(--md-secondary)' : 'var(--md-outline-variant)'),
                  }}>
                    <button
                      onClick={() => { onSelect(active ? null : l.id); onClose(); }}
                      style={{
                        flex: 1, minWidth: 0, border: 'none', background: 'transparent',
                        cursor: 'pointer', textAlign: 'start', padding: 0,
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <div style={{
                        font: '700 15px var(--font-body)',
                        color: active ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {l.name}
                      </div>
                      <div style={{ font: '500 12px var(--font-body)', color: 'var(--md-on-surface-variant)', marginTop: 2 }}>
                        {l.members.length} חברים{isOwner ? ' · שלך' : ''}
                      </div>
                    </button>
                    <button
                      onClick={() => handleCopy(l.inviteCode)}
                      aria-label="העתק קוד הזמנה"
                      title={`קוד: ${l.inviteCode}`}
                      style={{
                        height: 36, padding: '0 12px', borderRadius: 'var(--r-pill)', border: 'none',
                        cursor: 'pointer', background: 'var(--md-primary-container)',
                        color: 'var(--md-on-primary-container)', font: '700 12px var(--font-body)',
                        display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <Icon name="upload" size={14} />
                      {l.inviteCode}
                    </button>
                    <button
                      onClick={() => handleLeave(l)}
                      aria-label={isOwner ? 'מחק רשימה' : 'עזוב רשימה'}
                      style={{
                        width: 36, height: 36, borderRadius: '50%', border: 'none',
                        cursor: 'pointer', background: 'transparent',
                        color: 'var(--md-error)', display: 'grid', placeItems: 'center', flexShrink: 0,
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <Icon name={isOwner ? 'trash' : 'log-out'} size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
              placeholder="שם לרשימה חדשה"
              style={fieldStyle}
            />
            <Button icon="plus" onClick={handleCreate} disabled={busy || !newName.trim()}
              style={{ height: 48, padding: '0 18px' }}>
              צור
            </Button>
          </div>

          {/* Join */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === 'Enter') handleJoin(); }}
              placeholder="קוד הזמנה (למשל X7K2MD)"
              style={{ ...fieldStyle, letterSpacing: '0.1em' }}
            />
            <Button variant="tonal" icon="check" onClick={handleJoin} disabled={busy || !joinCode.trim()}
              style={{ height: 48, padding: '0 18px' }}>
              הצטרף
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
