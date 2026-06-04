import { useState, useEffect } from 'react';
import type { Reminder, NavTab, ThemeMode } from './types';
import { INITIAL_REMINDERS } from './data/sampleData';
import { useDynamicColor } from './hooks/useDynamicColor';
import { BottomBar } from './components/BottomBar';
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
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem('ultra-onb') === '1');
  const [tab, setTab] = useState<NavTab>('home');
  const [adding, setAdding] = useState(false);
  const [detail, setDetail] = useState<Reminder | null>(null);
  const [colorOpen, setColorOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>(INITIAL_REMINDERS);
  const [navKey, setNavKey] = useState(0);

  useEffect(() => { setNavKey((k) => k + 1); }, [tab]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const toggle = (id: string) => {
    setReminders((rs) =>
      rs.map((r) => {
        if (r.id !== id) return r;
        const done = !r.done;
        if (done) showToast('המשימה הושלמה! 🎉');
        return {
          ...r, done,
          doneAt: done
            ? new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
            : undefined,
        };
      })
    );
  };

  const del = (id: string) => setReminders((rs) => rs.filter((r) => r.id !== id));

  const addReminder = (data: Omit<Reminder, 'id' | 'done' | 'doneAt'>) => {
    setReminders((rs) => [{ id: 'n' + Date.now(), done: false, ...data }, ...rs]);
    setAdding(false);
    setTab('home');
    showToast('התזכורת נוספה ✨');
  };

  if (!onboarded) {
    return (
      <div id="stage">
        <div className="ultra-shell">
          <OnboardingScreen onDone={() => { localStorage.setItem('ultra-onb', '1'); setOnboarded(true); }} />
        </div>
      </div>
    );
  }

  return (
    <div id="stage">
      <div className="ultra-shell">
        {/* Main scrollable content */}
        <div
          className="scroll-area"
          style={{ position: 'absolute', inset: 0, bottom: 0, paddingBottom: 104, overflowY: 'auto', overflowX: 'hidden' }}
        >
          <div key={navKey} className="screen-enter">
            {tab === 'home' && (
              <HomeScreen
                reminders={reminders}
                onToggle={toggle}
                onOpen={setDetail}
                name="נועם"
                onOpenColor={() => setColorOpen(true)}
                mode={mode}
                setMode={setMode}
              />
            )}
            {tab === 'calendar' && (
              <CalendarScreen reminders={reminders} onToggle={toggle} onOpen={setDetail} />
            )}
            {tab === 'stats' && <StatsScreen />}
            {tab === 'profile' && (
              <ProfileScreen
                mode={mode}
                setMode={setMode}
                onOpenColor={() => setColorOpen(true)}
                seed={seed}
              />
            )}
          </div>
        </div>

        <BottomBar active={tab} onNav={setTab} onAdd={() => setAdding(true)} />

        {/* Add reminder overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 45,
          background: 'var(--md-surface)',
          transform: adding ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.45s var(--ease-spring)',
          overflowY: 'auto',
        }}>
          {adding && <AddScreen onClose={() => setAdding(false)} onSave={addReminder} />}
        </div>

        <DetailSheet
          reminder={detail}
          onClose={() => setDetail(null)}
          onToggle={toggle}
          onDelete={del}
        />

        <ColorSheet
          open={colorOpen}
          onClose={() => setColorOpen(false)}
          seed={seed}
          setSeed={setSeed}
        />

        {toast && <Toast message={toast} />}
      </div>
    </div>
  );
}

// Helper to cast mode type safely
export type { ThemeMode };
