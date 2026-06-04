import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ultra.reminders',
  appName: 'ULTRA תזכורות',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
