import { useState, useEffect } from 'react';
import type { Reminder, NavTab, ThemeMode, SharedList } from './types';
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
import type { Scope } from './firebase/reminders';
import { subscribeToMyLists } from './firebase/lists';
import { initNotifications, scheduleReminder, cancelReminder, snoozeReminder } from './services/notifications';
import { registerGeofence, removeGeofence } from './services/geofence';
import { ListsSheet } from './components/ListsSheet';
import { Icon } from './components/ui/Icon';
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
  const [lists, setLists] = useState<SharedList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [listsOpen, setListsOpen] = useState(false);

  const scope: Scope = activeListId && user
    ? { kind: 'list', listId: activeListId }
    : { kind: 'user', uid: user?.uid ?? '' };

  useEffect(() => { setNavKey((k) => k + 1); }, [tab]);

  useEffect(() => { initNotifications(); }, []);

  useEffect(() => {
    if (!user) return;
    return subscribeToReminders(
      activeListId ? { kind: 'list', listId: activeListId } : { kind: 'user', uid: user.uid },
      setReminders,
    );
  }, [user?.uid, activeListId]);

  useEffect(() => {
    if (!user) return;
    return subscribeToMyLists(user.uid, setLists);
  }, [user?.uid]);

  // Active list was deleted or we were removed — fall back to personal
  useEffect(() => {
    if (activeListId && lists.length > 0 && !lists.some((l) => l.id === activeListId)) {
      setActiveListId(null);
    }
  }, [lists, activeListId]);

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
    await fbToggle(scope, id, done);
    if (done) cancelReminder(id);
    else scheduleReminder({ ...r, done: false });
  };

  const del = async (id: string) => {
    if (!user) return;
    setDetail(null);
    await fbDelete(scope, id);
    cancelReminder(id);
    removeGeofence(id);
  };

  const saveReminder = async (data: Omit<Reminder, 'id' | 'done' | 'doneAt'>) => {
    if (!user) return;
    setAdding(false);
    setAddDate(undefined);
    if (editing) {
      const id = editing.id;
      setEditing(null);
      await fbUpdate(scope, id, data);
      await cancelReminder(id);
      afterSave({ ...data, id, done: false });
      showToast('התזכורת עודכנה ✨');
    } else {
      const id = await fbAddReminder(scope, user.uid, data);
      afterSave({ ...data, id, done: false });
      showToast('התזכורת נוספה ✨');
    }
  };

  const snooze = (r: Reminder) => {
    snoozeReminder(r, 10);
    showToast('נדחה ב-10 דקות ⏰');
  };

  // Repeating reminders completed on a previous day come back automatically
  useEffect(() => {
    if (!user) return;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const dow = new Date().getDay();
    reminders.forEach((r) => {
      if (!r.done || !r.repeat || r.repeat === 'חד פעמי') return;
      if (!r.doneAtMs || r.doneAtMs >= startOfToday.getTime()) return;
      if (r.repeat === 'ימי חול' && (dow === 5 || dow === 6)) return;
      fbToggle(activeListId ? { kind: 'list', listId: activeListId } : { kind: 'user', uid: user.uid }, r.id, false);
      scheduleReminder({ ...r, done: false });
    });
  }, [reminders, user?.uid, activeListId]);

  const importReminders = async (items: unknown[]) => {
    if (!user) return;
    const valid = items
      .filter((it): it is Record<string, unknown> =>
        !!it && typeof it === 'object'
        && typeof (it as Record<string, unknown>).title === 'string'
        && ((it as Record<string, unknown>).kind === 'time' || (it as Record<string, unknown>).kind === 'place'))
      .slice(0, 200);
    if (valid.length === 0) {
      showToast('הקובץ לא מכיל תזכורות תקינות');
      return;
    }
    for (const it of valid) {
      await fbAddReminder(scope, user.uid, {
        title:    it.title as string,
        sub:      typeof it.sub === 'string' ? it.sub : undefined,
        icon:     typeof it.icon === 'string' ? it.icon : 'bell',
        kind:     it.kind as 'time' | 'place',
        priority: it.priority === 'urgent' ? 'urgent' : 'normal',
        cat:      ['health', 'work', 'personal', 'shopping'].includes(it.cat as string)
                    ? (it.cat as Reminder['cat']) : 'personal',
        time:     typeof it.time === 'string' ? it.time : undefined,
        repeat:   typeof it.repeat === 'string' ? it.repeat : undefined,
        place:    typeof it.place === 'string' ? it.place : undefined,
        trigger:  it.trigger === 'leave' ? 'leave' : it.trigger === 'arrive' ? 'arrive' : undefined,
        dueDate:  typeof it.dueDate === 'string' ? it.dueDate : undefined,
        lat:      typeof it.lat === 'number' ? it.lat : undefined,
        lng:      typeof it.lng === 'number' ? it.lng : undefined,
        radius:   typeof it.radius === 'number' ? it.radius : undefined,
      });
    }
    showToast(`יובאו ${valid.length} תזכורות ✨`);
  };

  const afterSave = (r: Reminder) => {
    if (r.kind === 'time') scheduleReminder(r);
    else if (r.lat != null && r.lng != null) {
      registerGeofence(r, { lat: r.lat, lng: r.lng, radiusMeters: r.radius ?? 200 });
    }
  };

  if (authState === 'loading') {
    return (
      <div className="app-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ animation: 'fab-pulse 1.5s ease-in-out infinite', display: 'grid', placeItems: 'center' }}>
          <Icon name="bell" size={52} color="var(--md-primary)" />
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
                lists={lists}
                activeListId={activeListId}
                onSelectList={setActiveListId}
                onManageLists={() => setListsOpen(true)}
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
                reminders={reminders}
                onImport={importReminders}
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
          onSnooze={snooze}
        />
        <ColorSheet open={colorOpen} onClose={() => setColorOpen(false)} seed={seed} setSeed={setSeed} />
        {user && (
          <ListsSheet
            open={listsOpen}
            onClose={() => setListsOpen(false)}
            uid={user.uid}
            lists={lists}
            activeListId={activeListId}
            onSelect={setActiveListId}
            showToast={showToast}
          />
        )}
        {toast && <Toast message={toast} />}
      </div>
    </div>
  );
}

export type { ThemeMode };
