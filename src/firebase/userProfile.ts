import {
  doc, getDoc, setDoc, updateDoc, onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { paths } from './schema';
import type { UserProfileDoc } from './schema';
import type { ThemeMode, FontPair } from '../types';

const DEFAULTS: Omit<UserProfileDoc, 'createdAt' | 'updatedAt'> = {
  displayName:      'משתמש',
  email:            '',
  seedColor:        '#B5651D',
  themeMode:        'light',
  fontPair:         'rubik',
  radiusScale:      1,
  geofenceEnabled:  true,
  soundEnabled:     true,
  analyticsEnabled: false,
};

// Get or create user profile
export async function getOrCreateProfile(
  userId: string,
  email: string,
  displayName: string,
): Promise<UserProfileDoc> {
  const ref  = doc(db, paths.userDoc(userId));
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as UserProfileDoc;

  const profile: UserProfileDoc = {
    ...DEFAULTS,
    email,
    displayName,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await setDoc(ref, { ...profile, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return profile;
}

// Subscribe to profile changes (real-time)
export function subscribeToProfile(
  userId: string,
  onChange: (profile: UserProfileDoc) => void,
): () => void {
  return onSnapshot(doc(db, paths.userDoc(userId)), (snap) => {
    if (snap.exists()) onChange(snap.data() as UserProfileDoc);
  });
}

// Update individual settings
export async function updateSeedColor(userId: string, seedColor: string) {
  await updateDoc(doc(db, paths.userDoc(userId)), { seedColor, updatedAt: serverTimestamp() });
}

export async function updateThemeMode(userId: string, themeMode: ThemeMode) {
  await updateDoc(doc(db, paths.userDoc(userId)), { themeMode, updatedAt: serverTimestamp() });
}

export async function updateFontPair(userId: string, fontPair: FontPair) {
  await updateDoc(doc(db, paths.userDoc(userId)), { fontPair, updatedAt: serverTimestamp() });
}

export async function updateRadiusScale(userId: string, radiusScale: number) {
  await updateDoc(doc(db, paths.userDoc(userId)), { radiusScale, updatedAt: serverTimestamp() });
}

export async function updatePrivacySettings(
  userId: string,
  settings: { geofenceEnabled?: boolean; soundEnabled?: boolean; analyticsEnabled?: boolean },
) {
  await updateDoc(doc(db, paths.userDoc(userId)), { ...settings, updatedAt: serverTimestamp() });
}
