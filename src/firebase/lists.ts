import {
  collection, doc,
  setDoc, getDoc, updateDoc, deleteDoc, onSnapshot,
  query, where,
  arrayUnion, arrayRemove, serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { paths } from './schema';
import type { SharedList } from '../types';

function randomCode(len = 6): string {
  // Unambiguous charset (no 0/O, 1/I/L)
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let out = '';
  const rnd = crypto.getRandomValues(new Uint8Array(len));
  for (let i = 0; i < len; i++) out += chars[rnd[i] % chars.length];
  return out;
}

function fromDoc(id: string, data: Record<string, unknown>): SharedList {
  return {
    id,
    name:       data.name as string,
    ownerId:    data.ownerId as string,
    members:    (data.members as string[]) ?? [],
    inviteCode: data.inviteCode as string,
  };
}

// Real-time subscription to all lists the user is a member of
export function subscribeToMyLists(
  uid: string,
  onChange: (lists: SharedList[]) => void,
): () => void {
  const q = query(
    collection(db, paths.lists()),
    where('members', 'array-contains', uid),
  );
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => fromDoc(d.id, d.data() as Record<string, unknown>)));
  }, (err) => {
    console.warn('lists subscription error', err);
  });
}

// Create a list; also creates the invite-code lookup doc
export async function createList(uid: string, name: string): Promise<string> {
  const code = randomCode();
  const listRef = doc(collection(db, paths.lists()));
  await setDoc(listRef, {
    name: name.trim() || 'רשימה משותפת',
    ownerId: uid,
    members: [uid],
    inviteCode: code,
    createdAt: serverTimestamp(),
  });
  await setDoc(doc(db, paths.invite(code)), {
    listId: listRef.id,
    createdBy: uid,
  });
  return listRef.id;
}

// Join a list using its invite code. Returns the list id.
export async function joinListByCode(uid: string, code: string): Promise<string> {
  const inviteSnap = await getDoc(doc(db, paths.invite(code.trim().toUpperCase())));
  if (!inviteSnap.exists()) throw new Error('קוד הזמנה לא נמצא');
  const listId = inviteSnap.data().listId as string;
  await updateDoc(doc(db, paths.list(listId)), { members: arrayUnion(uid) });
  return listId;
}

// Leave a list (owner leaving deletes it for everyone)
export async function leaveList(uid: string, list: SharedList): Promise<void> {
  if (list.ownerId === uid) {
    await deleteDoc(doc(db, paths.invite(list.inviteCode))).catch(() => {});
    await deleteDoc(doc(db, paths.list(list.id)));
  } else {
    await updateDoc(doc(db, paths.list(list.id)), { members: arrayRemove(uid) });
  }
}
