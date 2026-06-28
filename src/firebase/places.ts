import {
  collection, doc,
  addDoc, deleteDoc, onSnapshot,
  query, orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { paths } from './schema';
import type { SavedPlace } from '../types';

function fromDoc(id: string, data: Record<string, unknown>): SavedPlace {
  return {
    id,
    name:    data.name    as string,
    address: data.address as string | undefined,
    lat:     data.lat     as number,
    lng:     data.lng     as number,
    radius:  (data.radius as number | undefined) ?? 200,
  };
}

// Real-time subscription to the user's saved places (most recent first)
export function subscribeToPlaces(
  uid: string,
  onChange: (places: SavedPlace[]) => void,
): () => void {
  const q = query(
    collection(db, paths.places(uid)),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => fromDoc(d.id, d.data() as Record<string, unknown>)));
  }, (err) => {
    console.warn('places subscription error', err);
    onChange([]);
  });
}

// Save a new named place
export async function addPlace(
  uid: string,
  place: Omit<SavedPlace, 'id'>,
): Promise<string> {
  const ref = await addDoc(collection(db, paths.places(uid)), {
    name:    place.name,
    address: place.address ?? null,
    lat:     place.lat,
    lng:     place.lng,
    radius:  place.radius,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// Delete a saved place
export async function deletePlace(uid: string, placeId: string): Promise<void> {
  await deleteDoc(doc(db, paths.place(uid, placeId)));
}
