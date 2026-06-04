import { useState, useEffect } from 'react';
import { hexToOklch, buildScheme, applyScheme } from '../theme/dynamicColor';
import type { ThemeMode } from '../types';

export function useDynamicColor() {
  const [seed, setSeed] = useState(
    () => localStorage.getItem('ultra-seed') || '#B5651D'
  );
  const [mode, setMode] = useState<ThemeMode>(
    () => (localStorage.getItem('ultra-mode') as ThemeMode) || 'light'
  );

  useEffect(() => {
    const { h, C } = hexToOklch(seed);
    const scheme = buildScheme(h, C, mode);
    const el = document.documentElement;
    applyScheme(el, scheme);
    el.dataset.dark = mode === 'dark' ? 'true' : 'false';
    localStorage.setItem('ultra-seed', seed);
    localStorage.setItem('ultra-mode', mode);
  }, [seed, mode]);

  return { seed, setSeed, mode, setMode };
}
