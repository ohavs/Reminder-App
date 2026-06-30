import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// No service worker: the app ships bundled inside the APK and loads locally,
// so a SW added no value — and a self-destroying SW was force-reloading the
// WebView ~1s after launch, blanking the screen. Keep the build SW-free.
export default defineConfig({
  plugins: [react()],
});
