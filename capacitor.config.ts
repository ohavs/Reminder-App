import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ultra.reminders',
  appName: 'ULTRA תזכורות',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Load the live web app over-the-air from Firebase Hosting so UI/logic
    // changes appear automatically on next app launch — no APK reinstall.
    // (Native changes — widget, geofence, plugins — still require a new APK.)
    // To run a fully offline/bundled build, comment out `url` below.
    url: 'https://reminder-app-eeb53.web.app',
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com'],
    },
  },
};

export default config;
