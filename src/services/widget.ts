import { Capacitor, registerPlugin } from '@capacitor/core';

// Bridge to the native home-screen widget (ReminderWidgetProvider).
// The web app pushes a snapshot of reminders + lists into Android
// SharedPreferences; the widget renders from it. When a reminder is
// checked off inside the widget, the native side records a "pending
// toggle" that the web app drains on next focus and writes to Firestore.

export interface WidgetReminder {
  id: string;
  listId: string;       // 'personal' or a shared-list id
  title: string;
  sub?: string;
  time?: string;
  dueDate?: string;
  done: boolean;
  kind: string;
  priority: string;
  cat: string;
}

export interface WidgetList {
  id: string;
  name: string;
}

export interface WidgetSnapshot {
  lists: WidgetList[];
  reminders: WidgetReminder[];
}

export interface PendingToggle {
  id: string;
  listId: string;
  done: boolean;
}

interface WidgetBridgePlugin {
  sync(data: WidgetSnapshot): Promise<void>;
  getPendingToggles(): Promise<{ toggles: PendingToggle[] }>;
}

export const widgetAvailable = Capacitor.isNativePlatform();

const Bridge = widgetAvailable
  ? registerPlugin<WidgetBridgePlugin>('WidgetBridge')
  : null;

export async function syncWidget(data: WidgetSnapshot): Promise<void> {
  if (!Bridge) return;
  try {
    await Bridge.sync(data);
  } catch (e) {
    console.warn('widget sync failed', e);
  }
}

export async function getPendingToggles(): Promise<PendingToggle[]> {
  if (!Bridge) return [];
  try {
    const res = await Bridge.getPendingToggles();
    return res.toggles ?? [];
  } catch (e) {
    console.warn('widget pending toggles failed', e);
    return [];
  }
}
