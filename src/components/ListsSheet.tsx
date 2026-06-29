import { useState } from 'react';
import { createList } from '../firebase/lists';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { BottomSheet } from './ui/BottomSheet';

interface ListsSheetProps {
  open: boolean;
  onClose: () => void;
  uid: string;
  onSelect: (listId: string | null) => void;
  showToast: (msg: string) => void;
}

const fieldStyle: React.CSSProperties = {
  flex: 1, height: 48, padding: '0 16px', borderRadius: 'var(--r-md)',
  border: '1.5px solid var(--md-outline-variant)',
  background: 'var(--md-surface-container-lowest)',
  color: 'var(--md-on-surface)', font: '600 15px var(--font-body)', outline: 'none', minWidth: 0,
};

export function ListsSheet({ open, onClose, uid, onSelect, showToast }: ListsSheetProps) {
  const [newName, setNewName] = useState('');
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

  return (
    <BottomSheet open={open} onClose={onClose} maxWidth={520} padding="14px 22px 32px">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <Icon name="users" size={24} color="var(--md-primary)" />
        <h3 style={{ font: '800 20px var(--font-display)', color: 'var(--md-on-surface)', margin: 0 }}>
          רשימה חדשה
        </h3>
      </div>
      <p style={{ font: '500 14px var(--font-body)', color: 'var(--md-on-surface-variant)', margin: '0 0 20px' }}>
        צור רשימה — לאחר מכן אפשר לשתף אותה (לחיצה ארוכה על הרשימה) ולהזמין חברים במייל
      </p>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
          placeholder="שם לרשימה חדשה"
          autoFocus
          style={fieldStyle}
        />
        <Button icon="plus" onClick={handleCreate} disabled={busy || !newName.trim()}
          style={{ height: 48, padding: '0 18px' }}>
          צור
        </Button>
      </div>
    </BottomSheet>
  );
}
