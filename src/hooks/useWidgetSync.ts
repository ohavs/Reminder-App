import { useEffect, useRef } from 'react';
import type { Reminder, SharedList } from '../types';
import { subscribeToReminders, toggleReminder } from '../firebase/reminders';
import type { Scope } from '../firebase/reminders';
import { cancelReminder, scheduleReminder } from '../services/notifications';
import {
  widgetAvailable, syncWidget, getPendingToggles,
  type WidgetReminder, type WidgetList,
} from '../services/widget';

const PERSONAL = 'personal';

function scopeFor(uid: string, listId: string): Scope {
  return listId === PERSONAL
    ? { kind: 'user', uid }
    : { kind: 'list', listId };
}

/**
 * Keeps the Android home-screen widget in sync with the user's reminders.
 * On native it subscribes to the personal list plus every shared list so the
 * widget's per-list picker has data to show, pushes a combined snapshot, and
 * drains widget checkbox taps back into Firestore whenever the app regains focus.
 * No-op on the web.
 */
export function useWidgetSync(
  user: { uid: string } | null,
  lists: SharedList[],
) {
  const byScope = useRef<Map<string, Reminder[]>>(new Map());
  const listIds = lists.map((l) => l.id).join(',');

  // Subscribe to all scopes and push a combined snapshot on every change
  useEffect(() => {
    if (!widgetAvailable || !user) return;

    const scopes: { key: string; name: string }[] = [
      { key: PERSONAL, name: 'התזכורות שלי' },
      ...lists.map((l) => ({ key: l.id, name: l.name })),
    ];

    // Drop cached data for scopes that no longer exist
    const live = new Set(scopes.map((s) => s.key));
    byScope.current.forEach((_, k) => { if (!live.has(k)) byScope.current.delete(k); });

    const push = () => {
      const reminders: WidgetReminder[] = [];
      byScope.current.forEach((arr, listId) => {
        arr.forEach((r) => reminders.push({
          id: r.id, listId,
          title: r.title, sub: r.sub, time: r.time, dueDate: r.dueDate,
          done: r.done, kind: r.kind, priority: r.priority, cat: r.cat,
        }));
      });
      const widgetLists: WidgetList[] = scopes.map((s) => ({ id: s.key, name: s.name }));
      syncWidget({ lists: widgetLists, reminders });
    };

    const unsubs = scopes.map((s) =>
      subscribeToReminders(scopeFor(user.uid, s.key), (rs) => {
        byScope.current.set(s.key, rs);
        push();
      }),
    );

    return () => unsubs.forEach((u) => u());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, listIds]);

  // Apply checkbox taps made inside the widget when the app comes to the front
  useEffect(() => {
    if (!widgetAvailable || !user) return;

    const apply = async () => {
      const toggles = await getPendingToggles();
      for (const t of toggles) {
        const scope = scopeFor(user.uid, t.listId);
        try {
          await toggleReminder(scope, t.id, t.done);
          if (t.done) {
            cancelReminder(t.id);
          } else {
            const r = byScope.current.get(t.listId)?.find((x) => x.id === t.id);
            if (r) scheduleReminder({ ...r, done: false });
          }
        } catch (e) {
          console.warn('apply widget toggle failed', e);
        }
      }
    };

    apply();
    const onVisible = () => { if (document.visibilityState === 'visible') apply(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', apply);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', apply);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);
}
