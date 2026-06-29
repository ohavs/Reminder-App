/*
  ============================================================
  ULTRA Reminders — Firestore Schema (eur3 / europe-west)
  ============================================================

  Collection structure:
  ─────────────────────────────────────────────────────────────
  users/{userId}
    ├── profile subcollection (settings, display name, etc.)
    └── reminders/{reminderId}          ← main collection
          ├── categories/{categoryId}   ← subcollection (custom cats)
          └── (see Reminder type below)

  Indexes (create in Firebase Console → Firestore → Indexes):
  ─────────────────────────────────────────────────────────────
  Collection: reminders
    • cat (ASC) + dueDate (ASC)         → grouped list sorted by time
    • priority (ASC) + done (ASC)       → urgent-first dashboard
    • done (ASC) + cat (ASC)            → filter: pending by category

  Security Rules (paste in Firebase Console → Firestore → Rules):
  ─────────────────────────────────────────────────────────────
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId}/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
  ─────────────────────────────────────────────────────────────
*/

// These mirror the Reminder interface but describe Firestore document shape.
// Firestore Timestamps are used for dates; the service layer converts to/from.
export interface ReminderDoc {
  id: string;
  userId: string;

  title: string;
  sub?: string;
  icon: string;
  kind: 'time' | 'place';
  priority: 'urgent' | 'normal';
  cat: string;               // category key
  done: boolean;
  doneAt?: number;           // epoch ms (Timestamp.toMillis())

  // time-based
  time?: string;             // "HH:mm"
  repeat?: string;
  dueDate?: number;          // epoch ms — for ordering/calendar queries

  // place-based
  place?: string;
  lat?: number;
  lng?: number;
  radius?: number;           // meters, default 150
  trigger?: 'arrive' | 'leave';

  createdAt: number;         // epoch ms
  updatedAt: number;
}

export interface UserProfileDoc {
  displayName: string;
  email: string;
  seedColor: string;         // hex, default '#B5651D'
  themeMode: 'light' | 'dark';
  fontPair: string;
  radiusScale: number;
  geofenceEnabled: boolean;
  soundEnabled: boolean;
  analyticsEnabled: boolean;
  createdAt: number;
  updatedAt: number;
}

// Firestore path helpers — avoids string typos everywhere
export const paths = {
  userDoc:      (uid: string)               => `users/${uid}`,
  reminders:    (uid: string)               => `users/${uid}/reminders`,
  reminder:     (uid: string, rid: string)  => `users/${uid}/reminders/${rid}`,
  categories:   (uid: string)               => `users/${uid}/categories`,
  category:     (uid: string, cid: string)  => `users/${uid}/categories/${cid}`,
  places:       (uid: string)               => `users/${uid}/places`,
  place:        (uid: string, pid: string)  => `users/${uid}/places/${pid}`,
  lists:        ()                          => `lists`,
  list:         (lid: string)               => `lists/${lid}`,
  listReminders:(lid: string)               => `lists/${lid}/reminders`,
  listReminder: (lid: string, rid: string)  => `lists/${lid}/reminders/${rid}`,
  invite:       (code: string)              => `invites/${code}`,
  mailInvites:  ()                          => `mailInvites`,
  mailInvite:   (id: string)                => `mailInvites/${id}`,
};

// Where a reminder lives: the user's private collection or a shared list
export type Scope =
  | { kind: 'user'; uid: string }
  | { kind: 'list'; listId: string };

export const scopePaths = {
  reminders: (s: Scope) =>
    s.kind === 'user' ? paths.reminders(s.uid) : paths.listReminders(s.listId),
  reminder: (s: Scope, rid: string) =>
    s.kind === 'user' ? paths.reminder(s.uid, rid) : paths.listReminder(s.listId, rid),
};
