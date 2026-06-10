import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import type { Reminder } from '../types';

// On native Android/iOS — Capacitor LocalNotifications (works when app is closed).
// On web — Notification API + in-page timers (works while the tab is open).

const isNative = Capacitor.isNativePlatform();
const webTimers = new Map<string, ReturnType<typeof setTimeout>>();

// Stable positive 32-bit id from a Firestore doc id
function numericId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Next fire time for a reminder, or null if it can't be scheduled
function nextFireDate(r: Reminder): Date | null {
  if (r.kind !== 'time' || !r.time) return null;
  const [hh, mm] = r.time.split(':').map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;

  const at = new Date();
  if (r.dueDate) {
    const [y, mo, d] = r.dueDate.split('-').map(Number);
    at.setFullYear(y, mo - 1, d);
  }
  at.setHours(hh, mm, 0, 0);

  if (at.getTime() <= Date.now()) {
    if (r.dueDate && !r.repeat?.startsWith('כל')) return null; // explicit past date, one-shot
    at.setDate(at.getDate() + 1); // roll to next occurrence
  }
  return at;
}

function repeatEvery(repeat?: string): 'day' | 'week' | 'month' | null {
  switch (repeat) {
    case 'כל יום':
    case 'ימי חול': return 'day';
    case 'כל שבוע': return 'week';
    case 'כל חודש': return 'month';
    default: return null;
  }
}

export async function ensurePermission(): Promise<boolean> {
  if (isNative) {
    const { display } = await LocalNotifications.checkPermissions();
    if (display === 'granted') return true;
    const res = await LocalNotifications.requestPermissions();
    return res.display === 'granted';
  }
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  return (await Notification.requestPermission()) === 'granted';
}

export async function initNotifications(): Promise<void> {
  if (isNative && Capacitor.getPlatform() === 'android') {
    await LocalNotifications.createChannel({
      id: 'reminders',
      name: 'תזכורות',
      description: 'התראות על תזכורות שהגיע זמנן',
      importance: 5,
      vibration: true,
    });
  }
}

export async function scheduleReminder(r: Reminder): Promise<void> {
  const at = nextFireDate(r);
  if (!at) return;
  if (!(await ensurePermission())) return;

  const body = r.sub || (r.repeat && r.repeat !== 'חד פעמי' ? r.repeat : 'הגיע הזמן!');

  if (isNative) {
    const every = repeatEvery(r.repeat);
    await LocalNotifications.schedule({
      notifications: [{
        id: numericId(r.id),
        title: r.title,
        body,
        channelId: 'reminders',
        schedule: every ? { at, every, allowWhileIdle: true } : { at, allowWhileIdle: true },
      }],
    });
    return;
  }

  // Web fallback: fire while the tab is open
  cancelWebTimer(r.id);
  const delay = at.getTime() - Date.now();
  if (delay > 2 ** 31 - 1) return; // beyond setTimeout range (~24 days)
  webTimers.set(r.id, setTimeout(() => {
    new Notification(r.title, { body, icon: '/favicon.svg', dir: 'rtl', lang: 'he' });
    webTimers.delete(r.id);
  }, delay));
}

function cancelWebTimer(id: string) {
  const t = webTimers.get(id);
  if (t) { clearTimeout(t); webTimers.delete(id); }
}

// One-shot notification in N minutes, replacing any pending schedule
export async function snoozeReminder(r: Reminder, minutes = 10): Promise<void> {
  if (!(await ensurePermission())) return;
  const at = new Date(Date.now() + minutes * 60_000);
  const body = `נדחה ב-${minutes} דקות`;

  if (isNative) {
    await LocalNotifications.schedule({
      notifications: [{
        id: numericId(r.id),
        title: r.title,
        body,
        channelId: 'reminders',
        schedule: { at, allowWhileIdle: true },
      }],
    });
    return;
  }

  cancelWebTimer(r.id);
  webTimers.set(r.id, setTimeout(() => {
    new Notification(r.title, { body: r.sub ?? 'הגיע הזמן!', icon: '/favicon.svg', dir: 'rtl', lang: 'he' });
    webTimers.delete(r.id);
  }, minutes * 60_000));
}

export async function cancelReminder(id: string): Promise<void> {
  if (isNative) {
    await LocalNotifications.cancel({ notifications: [{ id: numericId(id) }] });
    return;
  }
  cancelWebTimer(id);
}
