import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { auth } from './config';
import { getOrCreateProfile } from './userProfile';

const googleProvider = new GoogleAuthProvider();

export function onAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle(): Promise<User> {
  let user: User;

  if (Capacitor.isNativePlatform()) {
    // Google blocks OAuth inside WebViews — use the native Google
    // Sign-In flow, then hand the credential to the web SDK so the
    // rest of the app (Firestore listeners etc.) works unchanged.
    const result = await FirebaseAuthentication.signInWithGoogle();
    const idToken = result.credential?.idToken;
    if (!idToken) throw new Error('Google sign-in returned no credential');
    ({ user } = await signInWithCredential(auth, GoogleAuthProvider.credential(idToken)));
  } else {
    ({ user } = await signInWithPopup(auth, googleProvider));
  }

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
  if (Capacitor.isNativePlatform()) {
    await FirebaseAuthentication.signOut().catch(() => {});
  }
  await fbSignOut(auth);
}

export { type User };
