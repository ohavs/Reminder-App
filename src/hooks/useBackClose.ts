import { useEffect } from 'react';

/**
 * Makes the Android hardware/gesture "back" (and the browser back button) close
 * an open overlay instead of leaving the app. While `open`, a history entry is
 * pushed; a back navigation pops it and runs `close()`. An optional `guard`
 * returns false to veto closing (e.g. unsaved changes) — the entry is then
 * re-pushed so the next back press asks again.
 *
 * Capacitor routes the native back button through WebView history by default,
 * so this works without the @capacitor/app plugin.
 */
export function useBackClose(open: boolean, close: () => void, guard?: () => boolean) {
  useEffect(() => {
    if (!open) return;

    const marker = `sheet-${Date.now()}-${Math.random()}`;
    window.history.pushState({ _back: marker }, '');

    const onPop = () => {
      if (!guard || guard()) {
        close();
      } else {
        // Vetoed — restore the entry so back can be pressed again
        window.history.pushState({ _back: marker }, '');
      }
    };

    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      // Closed via UI (not back): pop the entry we added to keep history tidy
      if (window.history.state && window.history.state._back === marker) {
        window.history.back();
      }
    };
  }, [open]);  // eslint-disable-line react-hooks/exhaustive-deps
}
