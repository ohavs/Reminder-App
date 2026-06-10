import { useState, useEffect } from 'react';
import type { Reminder, NavTab, ThemeMode } from './types';
import { useDynamicColor } from './hooks/useDynamicColor';
import { useAuth } from './hooks/useAuth';
import { LoginScreen } from './screens/LoginScreen';
import {
  subscribeToReminders,
  addReminder as fbAddReminder,
  toggleReminder as fbToggle,
  deleteReminder as fbDelete,
  updateReminder as fbUpdate,
} from './firebase/reminders';
import { initNotifications, scheduleReminder, cancelReminder } from './services/notifications';
import { BottomBar } from './components/BottomBar';
import { SideBar } from './components/SideBar';
import { DetailSheet } from './components/DetailSheet';
import { ColorSheet } from './components/ColorSheet';
import { Toast } from './components/Toast';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { HomeScreen } from './screens/HomeScreen';
import { AddScreen } from './screens/AddScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { StatsScreen } from './screens/StatsScreen';
import { ProfileScreen } from './screens/ProfileScreen';

export function App() {
  const { seed, setSeed, mode, setMode } = useDynamicColor();
  const { user, authState } = useAuth();
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem('ultra-onb') === '1');
  const [tab, setTab] = useState<NavTab>('home');
  const [adding, setAdding] = useState(false);
  const [detail, setDetail] = useState<Reminder | null>(null);
  const [colorOpen, setColorOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [navKey, setNavKey] = useState(0);
  const [addDate, setAddDate] = useState<string | undefined>(undefined);
  const [editing, setEditing] = useState<Reminder | null>(null);

  useEffect(() => { setNavKey((k) => k + 1); }, [tab]);

  useEffect(() => { initNotifications(); }, []);

  useEffect(() => {
    if (!user) return;
    return subscribeToReminders(user.uid, setReminders);
  }, [user?.uid]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const toggle = async (id: string) => {
    if (!user) return;
    const r = reminders.find((r) => r.id === id);
    if (!r) return;
    const done = !r.done;
    if (done) showToast('המשימה הושלמה! 🎉');
    await fbToggle(user.uid, id, done);
    if (done) cancelReminder(id);
    else scheduleReminder({ ...r, done: false });
  };

  const del = async (id: string) => {
    if (!user) return;
    setDetail(null);
    await fbDelete(user.uid, id);
    cancelReminder(id);
  };

  const saveReminder = async (data: Omit<Reminder, 'id' | 'done' | 'doneAt'>) => {
    if (!user) return;
    setAdding(false);
    setAddDate(undefined);
    if (editing) {
      const id = editing.id;
      setEditing(null);
      await fbUpdate(user.uid, id, data);
      await cancelReminder(id);
      scheduleReminder({ ...data, id, done: false });
      showToast('התזכורת עודכנה ✨');
    } else {
      const id = await fbAddReminder(user.uid, data);
      scheduleReminder({ ...data, id, done: false });
      showToast('התזכורת נוספה ✨');
    }
  };

  if (authState === 'loading') {
    return (
      <div className="app-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <span className="msym" style={{ fontSize: 52, color: 'var(--md-primary)', animation: 'fab-pulse 1.5s ease-in-out infinite' }}>
          notifications
        </span>
      </div>
    );
  }

  if (authState === 'signed-out') {
    return (
      <div className="app-shell" style={{ overflow: 'auto' }}>
        <div style={{ width: '100%', height: '100%' }}>
          <LoginScreen />
        </div>
      </div>
    );
  }

  if (!onboarded) {
    return (
      <div className="app-shell" style={{ overflow: 'auto' }}>
        <div style={{ width: '100%', height: '100%' }}>
          <OnboardingScreen onDone={() => { localStorage.setItem('ultra-onb', '1'); setOnboarded(true); }} />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* Sidebar — desktop only (CSS hides on mobile) */}
      <SideBar active={tab} onNav={setTab} onAdd={() => setAdding(true)} />

      {/* Main content */}
      <div className="app-content">
        <div
          className="scroll-area"
          style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden' }}
        >
          <div key={navKey} className="screen-enter">
            {tab === 'home' && (
              <HomeScreen
                reminders={reminders}
                onToggle={toggle}
                onOpen={setDetail}
                name={user?.displayName || 'שלום'}
                onOpenColor={() => setColorOpen(true)}
                mode={mode}
                setMode={setMode}
              />
            )}
            {tab === 'calendar' && (
              <CalendarScreen
                reminders={reminders}
                onToggle={toggle}
                onOpen={setDetail}
                onAdd={(date) => { setAddDate(date); setAdding(true); }}
              />
            )}
            {tab === 'stats' && <StatsScreen reminders={reminders} />}
            {tab === 'profile' && (
              <ProfileScreen
                mode={mode}
                setMode={setMode}
                onOpenColor={() => setColorOpen(true)}
                seed={seed}
                user={user}
                completedCount={reminders.filter((r) => r.done).length}
              />
            )}
          </div>
        </div>

        {/* Bottom bar — mobile only (CSS hides on desktop) */}
        <div className="app-bottom-bar">
          <BottomBar active={tab} onNav={setTab} onAdd={() => setAdding(true)} />
        </div>

        {/* Add reminder overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 45,
          background: 'var(--md-surface)',
          transform: adding ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.45s var(--ease-spring)',
          overflowY: 'auto',
        }}>
          {adding && (
            <AddScreen
              onClose={() => { setAdding(false); setAddDate(undefined); setEditing(null); }}
              onSave={saveReminder}
              defaultDate={addDate}
              editing={editing}
            />
          )}
        </div>

        <DetailSheet
          reminder={detail}
          onClose={() => setDetail(null)}
          onToggle={toggle}
          onDelete={del}
          onEdit={(r) => { setEditing(r); setAdding(true); }}
        />
        <ColorSheet open={colorOpen} onClose={() => setColorOpen(false)} seed={seed} setSeed={setSeed} />
        {toast && <Toast message={toast} />}
      </div>
    </div>
  );
}

export type { ThemeMode };
