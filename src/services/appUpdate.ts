import { Capacitor, registerPlugin } from '@capacitor/core';

// In-app updater for the side-loaded Android APK. The web layer auto-updates
// over-the-air from Hosting; this only covers native changes. The manifest is
// published as a GitHub release asset by CI (android.yml) alongside the APK,
// so it only ever advertises a versionCode whose APK actually exists.

const MANIFEST_URL =
  'https://github.com/ohavs/Reminder-App/releases/download/latest/update.json';

export interface UpdateInfo {
  available: boolean;
  currentVersionCode: number;
  versionCode: number;
  versionName: string;
  url: string;
  notes: string;
}

interface AppUpdaterPlugin {
  getInfo(): Promise<{ versionCode: number; versionName: string }>;
  checkForUpdate(opts: { manifestUrl: string }): Promise<UpdateInfo>;
  downloadAndInstall(opts: { url: string }): Promise<void>;
}

const isAndroid = Capacitor.getPlatform() === 'android';
const Updater = isAndroid ? registerPlugin<AppUpdaterPlugin>('AppUpdater') : null;

export async function checkForUpdate(): Promise<UpdateInfo | null> {
  if (!Updater) return null;
  try {
    const info = await Updater.checkForUpdate({ manifestUrl: MANIFEST_URL });
    return info.available && info.url ? info : null;
  } catch (e) {
    console.warn('update check failed', e);
    return null;
  }
}

export async function installUpdate(url: string): Promise<void> {
  if (!Updater) return;
  await Updater.downloadAndInstall({ url });
}
