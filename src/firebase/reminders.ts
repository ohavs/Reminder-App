import {
  collection, doc,
  addDoc, updateDoc, deleteDoc, onSnapshot,
  query, orderBy, where,
  serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { paths } from './schema';
import type { Reminder } from '../types';

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
  };
}

// Convert app Reminder → Firestore doc fields
function toDoc(r: Omit<Reminder, 'id'>, userId: string) {
  return {
    userId,
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
    updatedAt: serverTimestamp(),
  };
}

// Subscribe to all reminders for a user (real-time)
export function subscribeToReminders(
  userId: string,
  onChange: (reminders: Reminder[]) => void,
): () => void {
  const q = query(
    collection(db, paths.reminders(userId)),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => fromDoc(d.id, d.data() as Record<string, unknown>));
    onChange(items);
  });
}

// Subscribe to today's pending reminders only
export function subscribeTodayReminders(
  userId: string,
  onChange: (reminders: Reminder[]) => void,
): () => void {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const q = query(
    collection(db, paths.reminders(userId)),
    where('done', '==', false),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => fromDoc(d.id, d.data() as Record<string, unknown>));
    onChange(items);
  });
}

// Add a new reminder
export async function addReminder(
  userId: string,
  data: Omit<Reminder, 'id' | 'done' | 'doneAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, paths.reminders(userId)), {
    ...toDoc({ ...data, done: false }, userId),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// Toggle done state
export async function toggleReminder(
  userId: string,
  reminderId: string,
  done: boolean,
): Promise<void> {
  await updateDoc(doc(db, paths.reminder(userId, reminderId)), {
    done,
    doneAt:    done ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  });
}

// Delete a reminder
export async function deleteReminder(
  userId: string,
  reminderId: string,
): Promise<void> {
  await deleteDoc(doc(db, paths.reminder(userId, reminderId)));
}

// Update reminder fields
export async function updateReminder(
  userId: string,
  reminderId: string,
  fields: Partial<Omit<Reminder, 'id'>>,
): Promise<void> {
  await updateDoc(doc(db, paths.reminder(userId, reminderId)), {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}
