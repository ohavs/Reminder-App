import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from './config';
import { getOrCreateProfile } from './userProfile';

// Subscribe to auth state — call this once at app root
export function onAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

// Anonymous sign-in (works immediately, no email needed)
// Good for first launch before user creates an account
export async function signInAnon(): Promise<User> {
  const { user } = await signInAnonymously(auth);
  await getOrCreateProfile(user.uid, '', 'אנונימי');
  return user;
}

// Email / password registration
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

// Email / password sign-in
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function signOut(): Promise<void> {
  await fbSignOut(auth);
}

export { type User };
