import {
  collection, doc,
  addDoc, updateDoc, deleteDoc, onSnapshot,
  query, orderBy,
  serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { scopePaths } from './schema';
import type { Scope } from './schema';
import type { Reminder } from '../types';

export type { Scope };

// Convert Firestore doc → app Reminder
function fromDoc(id: string, data: Record<string, unknown>): Reminder {
  return {
    id,
    title:    data.title    as string,
    sub:      data.sub      as string | undefined,
    icon:     data.icon     as string,
    kind:     data.kind     as 'time' | 'place',
    priority: data.priority as 'urgent' | 'normal',
    cat:      data.cat      as 'health' | 'work' | 'personal' | 'shopping',
    done:     data.done     as boolean,
    doneAt:   data.doneAt ? (data.doneAt as Timestamp).toDate().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : undefined,
    time:     data.time    as string | undefined,
    repeat:   data.repeat  as string | undefined,
    place:    data.place   as string | undefined,
    trigger:  data.trigger as 'arrive' | 'leave' | undefined,
    dueDate:  data.dueDate as string | undefined,
    lat:      data.lat    as number | undefined,
    lng:      data.lng    as number | undefined,
    radius:   data.radius as number | undefined,
  };
}

// Convert app Reminder → Firestore doc fields
function toDoc(r: Omit<Reminder, 'id'>, createdBy: string) {
  return {
    createdBy,
    title:    r.title,
    sub:      r.sub    ?? null,
    icon:     r.icon,
    kind:     r.kind,
    priority: r.priority,
    cat:      r.cat,
    done:     r.done,
    doneAt:   r.doneAt ? Timestamp.fromDate(new Date()) : null,
    time:     r.time    ?? null,
    repeat:   r.repeat  ?? null,
    place:    r.place   ?? null,
    trigger:  r.trigger ?? null,
    dueDate:  r.dueDate ?? null,
    lat:      r.lat    ?? null,
    lng:      r.lng    ?? null,
    radius:   r.radius ?? null,
    updatedAt: serverTimestamp(),
  };
}

// Subscribe to all reminders in a scope (real-time)
export function subscribeToReminders(
  scope: Scope,
  onChange: (reminders: Reminder[]) => void,
): () => void {
  const q = query(
    collection(db, scopePaths.reminders(scope)),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => fromDoc(d.id, d.data() as Record<string, unknown>));
    onChange(items);
  }, (err) => {
    // Permission errors can fire transiently when leaving a list
    console.warn('reminders subscription error', err);
    onChange([]);
  });
}

// Add a new reminder
export async function addReminder(
  scope: Scope,
  createdBy: string,
  data: Omit<Reminder, 'id' | 'done' | 'doneAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, scopePaths.reminders(scope)), {
    ...toDoc({ ...data, done: false }, createdBy),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// Toggle done state
export async function toggleReminder(
  scope: Scope,
  reminderId: string,
  done: boolean,
): Promise<void> {
  await updateDoc(doc(db, scopePaths.reminder(scope, reminderId)), {
    done,
    doneAt:    done ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  });
}

// Delete a reminder
export async function deleteReminder(
  scope: Scope,
  reminderId: string,
): Promise<void> {
  await deleteDoc(doc(db, scopePaths.reminder(scope, reminderId)));
}

// Update reminder fields
export async function updateReminder(
  scope: Scope,
  reminderId: string,
  fields: Partial<Omit<Reminder, 'id'>>,
): Promise<void> {
  await updateDoc(doc(db, scopePaths.reminder(scope, reminderId)), {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}
