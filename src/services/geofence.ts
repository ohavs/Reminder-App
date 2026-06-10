import { Capacitor } from '@capacitor/core';
import type { Reminder } from '../types';

// Geofencing requires a native background-location plugin and is only
// functional in the Android/iOS build. This module is the single seam:
// when the Android platform is added, only registerNativeGeofence /
// removeNativeGeofence below need real implementations.

export interface GeofenceRegion {
  reminderId: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  trigger: 'arrive' | 'leave';
}

export function isGeofencingAvailable(): boolean {
  return Capacitor.isNativePlatform();
}

export async function registerGeofence(r: Reminder, region: Omit<GeofenceRegion, 'reminderId' | 'trigger'>): Promise<void> {
  if (!isGeofencingAvailable() || r.kind !== 'place') return;
  // TODO(android): wire to @capacitor-community geofence plugin once the
  // android platform is added (npx cap add android).
  void region;
}

export async function removeGeofence(reminderId: string): Promise<void> {
  if (!isGeofencingAvailable()) return;
  // TODO(android): remove the native geofence registration.
  void reminderId;
}
