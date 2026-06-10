import { Capacitor, registerPlugin } from '@capacitor/core';
import type { Reminder } from '../types';

// Backed by the custom native GeofencePlugin (android/.../GeofencePlugin.java),
// which uses Android's GeofencingClient: fires on arrive/leave even when the
// app is closed, and re-registers after reboot. No-op on web.

interface GeofenceNativePlugin {
  addGeofence(opts: {
    id: string;
    lat: number;
    lng: number;
    radius: number;
    trigger: 'arrive' | 'leave';
    title: string;
    body: string;
  }): Promise<void>;
  removeGeofence(opts: { id: string }): Promise<void>;
}

const GeofenceNative = registerPlugin<GeofenceNativePlugin>('Geofence');

export function isGeofencingAvailable(): boolean {
  return Capacitor.isNativePlatform();
}

export async function registerGeofence(
  r: Reminder,
  region: { lat: number; lng: number; radiusMeters: number },
): Promise<void> {
  if (!isGeofencingAvailable() || r.kind !== 'place') return;
  try {
    await GeofenceNative.addGeofence({
      id: r.id,
      lat: region.lat,
      lng: region.lng,
      radius: region.radiusMeters,
      trigger: r.trigger ?? 'arrive',
      title: r.title,
      body: r.sub ?? (r.trigger === 'leave' ? 'יצאת מהאזור' : 'הגעת לאזור'),
    });
  } catch (e) {
    console.warn('geofence registration failed', e);
  }
}

export async function removeGeofence(reminderId: string): Promise<void> {
  if (!isGeofencingAvailable()) return;
  try {
    await GeofenceNative.removeGeofence({ id: reminderId });
  } catch (e) {
    console.warn('geofence removal failed', e);
  }
}
