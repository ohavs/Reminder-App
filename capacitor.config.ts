import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ultra.reminders',
  appName: 'ULTRA תזכורות',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // OTA loading via Hosting was hiding which code actually ran on the device
    // and is disabled for now — the APK bundles the web build and loads it
    // locally, so a fresh install is guaranteed to run the current code.
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com'],
    },
  },
};

export default config;
