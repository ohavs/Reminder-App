import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from './config';
import { getOrCreateProfile } from './userProfile';

const googleProvider = new GoogleAuthProvider();

export function onAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle(): Promise<User> {
  const { user } = await signInWithPopup(auth, googleProvider);
  await getOrCreateProfile(
    user.uid,
    user.email ?? '',
    user.displayName ?? 'משתמש',
  );
  return user;
}

export async function signInAnon(): Promise<User> {
  const { user } = await signInAnonymously(auth);
  await getOrCreateProfile(user.uid, '', 'אורח');
  return user;
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
): Promise<User> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName });
  await getOrCreateProfile(user.uid, email, displayName);
  return user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function signOut(): Promise<void> {
  await fbSignOut(auth);
}

export { type User };
