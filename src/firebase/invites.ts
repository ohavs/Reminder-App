import {
  collection, doc,
  addDoc, updateDoc, onSnapshot,
  query, where, arrayUnion, serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { paths } from './schema';
import type { Invite, InviteStatus } from '../types';

function fromDoc(id: string, data: Record<string, unknown>): Invite {
  return {
    id,
    listId:   data.listId as string,
    listName: (data.listName as string) ?? 'רשימה',
    email:    (data.email as string) ?? '',
    fromName: (data.fromName as string) ?? '',
    fromUid:  data.fromUid as string,
    status:   (data.status as InviteStatus) ?? 'pending',
  };
}

// Send an invite to a specific list by email address
export async function shareListByEmail(opts: {
  listId: string; listName: string; email: string; fromName: string; fromUid: string;
}): Promise<void> {
  const email = opts.email.trim().toLowerCase();
  if (!email || !email.includes('@')) throw new Error('כתובת מייל לא תקינה');
  await addDoc(collection(db, paths.mailInvites()), {
    listId: opts.listId,
    listName: opts.listName,
    email,
    fromName: opts.fromName,
    fromUid: opts.fromUid,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}

// Invites addressed to me, still pending
export function subscribeIncomingInvites(email: string, onChange: (invites: Invite[]) => void): () => void {
  const q = query(
    collection(db, paths.mailInvites()),
    where('email', '==', email.toLowerCase()),
    where('status', '==', 'pending'),
  );
  return onSnapshot(q,
    (snap) => onChange(snap.docs.map((d) => fromDoc(d.id, d.data() as Record<string, unknown>))),
    (err) => { console.warn('incoming invites error', err); onChange([]); },
  );
}

// Invites I've sent (any status) — for showing acceptance status
export function subscribeSentInvites(uid: string, onChange: (invites: Invite[]) => void): () => void {
  const q = query(collection(db, paths.mailInvites()), where('fromUid', '==', uid));
  return onSnapshot(q,
    (snap) => onChange(snap.docs.map((d) => fromDoc(d.id, d.data() as Record<string, unknown>))),
    (err) => { console.warn('sent invites error', err); onChange([]); },
  );
}

export async function acceptInvite(inv: Invite, uid: string): Promise<void> {
  await updateDoc(doc(db, paths.list(inv.listId)), { members: arrayUnion(uid) });
  await updateDoc(doc(db, paths.mailInvite(inv.id)), { status: 'accepted' });
}

export async function declineInvite(inv: Invite): Promise<void> {
  await updateDoc(doc(db, paths.mailInvite(inv.id)), { status: 'declined' });
}
