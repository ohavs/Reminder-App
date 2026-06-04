/* =========================================================================
   ULTRA · Dynamic Color engine (MD3-style, OKLCH based)
   Converts a seed hex -> hue/chroma, then builds a full tonal scheme
   for light & dark. Injects CSS custom properties (--md-*).
   ========================================================================= */

// ---- sRGB hex -> OKLCH -------------------------------------------------
function srgbToLinear(c) {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function hexToOklch(hex) {
  const m = hex.replace('#', '');
  const r = srgbToLinear(parseInt(m.slice(0, 2), 16));
  const g = srgbToLinear(parseInt(m.slice(2, 4), 16));
  const b = srgbToLinear(parseInt(m.slice(4, 6), 16));
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const mm = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(mm), s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  const C = Math.sqrt(A * A + B * B);
  let h = (Math.atan2(B, A) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { L, C, h };
}

// ---- scheme builder ----------------------------------------------------
// All roles produced as oklch() strings so the browser interpolates nicely.
function ok(L, C, h) {
  return `oklch(${L.toFixed(4)} ${C.toFixed(4)} ${h.toFixed(2)})`;
}

function buildScheme(hue, baseChroma, mode) {
  const h = hue;
  const ht = (hue + 48) % 360;      // tertiary hue offset (analogous-warm)
  const hn = hue;                   // neutral carries a faint tint of seed
  // chroma scaled a touch by the seed's own saturation
  const cP = Math.min(0.16, Math.max(0.09, baseChroma));
  const cS = cP * 0.42;
  const cT = cP * 0.72;
  const cNeutral = 0.008;
  const cNeutralVar = 0.018;

  if (mode === 'dark') {
    return {
      primary: ok(0.815, cP, h),
      onPrimary: ok(0.27, cP * 0.7, h),
      primaryContainer: ok(0.40, cP * 0.85, h),
      onPrimaryContainer: ok(0.92, cP * 0.45, h),
      secondary: ok(0.80, cS, h),
      onSecondary: ok(0.26, cS, h),
      secondaryContainer: ok(0.36, cS, h),
      onSecondaryContainer: ok(0.92, cS * 0.7, h),
      tertiary: ok(0.82, cT, ht),
      onTertiary: ok(0.27, cT * 0.7, ht),
      tertiaryContainer: ok(0.40, cT * 0.85, ht),
      onTertiaryContainer: ok(0.93, cT * 0.5, ht),
      error: ok(0.78, 0.16, 25),
      onError: ok(0.25, 0.10, 25),
      errorContainer: ok(0.38, 0.13, 25),
      onErrorContainer: ok(0.92, 0.07, 25),
      background: ok(0.155, cNeutral, hn),
      onBackground: ok(0.92, cNeutral, hn),
      surface: ok(0.155, cNeutral, hn),
      surfaceDim: ok(0.155, cNeutral, hn),
      surfaceBright: ok(0.27, cNeutral, hn),
      surfaceContainerLowest: ok(0.115, cNeutral, hn),
      surfaceContainerLow: ok(0.185, cNeutral, hn),
      surfaceContainer: ok(0.205, cNeutral, hn),
      surfaceContainerHigh: ok(0.245, cNeutral, hn),
      surfaceContainerHighest: ok(0.29, cNeutral, hn),
      onSurface: ok(0.925, cNeutral, hn),
      onSurfaceVariant: ok(0.80, cNeutralVar, hn),
      outline: ok(0.62, cNeutralVar, hn),
      outlineVariant: ok(0.38, cNeutralVar, hn),
      inverseSurface: ok(0.92, cNeutral, hn),
      inverseOnSurface: ok(0.22, cNeutral, hn),
      shadow: 'oklch(0 0 0)',
      scrim: 'oklch(0 0 0)',
      isDark: 1,
    };
  }
  // light
  return {
    primary: ok(0.545, cP, h),
    onPrimary: ok(0.995, cP * 0.2, h),
    primaryContainer: ok(0.905, cP * 0.55, h),
    onPrimaryContainer: ok(0.34, cP, h),
    secondary: ok(0.55, cS, h),
    onSecondary: ok(0.99, cS * 0.2, h),
    secondaryContainer: ok(0.915, cS, h),
    onSecondaryContainer: ok(0.32, cS, h),
    tertiary: ok(0.56, cT, ht),
    onTertiary: ok(0.99, cT * 0.2, ht),
    tertiaryContainer: ok(0.905, cT * 0.6, ht),
    onTertiaryContainer: ok(0.33, cT, ht),
    error: ok(0.55, 0.20, 27),
    onError: ok(0.99, 0.04, 27),
    errorContainer: ok(0.92, 0.07, 27),
    onErrorContainer: ok(0.36, 0.16, 27),
    background: ok(0.985, cNeutral * 1.6, hn),
    onBackground: ok(0.20, cNeutral, hn),
    surface: ok(0.987, cNeutral * 1.6, hn),
    surfaceDim: ok(0.915, cNeutral * 1.8, hn),
    surfaceBright: ok(0.992, cNeutral * 1.6, hn),
    surfaceContainerLowest: ok(1.0, 0, hn),
    surfaceContainerLow: ok(0.972, cNeutral * 1.8, hn),
    surfaceContainer: ok(0.955, cNeutral * 2, hn),
    surfaceContainerHigh: ok(0.935, cNeutral * 2.2, hn),
    surfaceContainerHighest: ok(0.915, cNeutral * 2.4, hn),
    onSurface: ok(0.205, cNeutral, hn),
    onSurfaceVariant: ok(0.44, cNeutralVar, hn),
    outline: ok(0.58, cNeutralVar, hn),
    outlineVariant: ok(0.84, cNeutralVar, hn),
    inverseSurface: ok(0.27, cNeutral, hn),
    inverseOnSurface: ok(0.95, cNeutral, hn),
    shadow: 'oklch(0 0 0)',
    scrim: 'oklch(0 0 0)',
    isDark: 0,
  };
}

const ROLE_TO_VAR = (k) =>
  '--md-' + k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());

function applyScheme(target, scheme) {
  const el = target || document.documentElement;
  Object.entries(scheme).forEach(([k, v]) => {
    if (k === 'isDark') {
      el.dataset.dark = v ? 'true' : 'false';
      return;
    }
    el.style.setProperty(ROLE_TO_VAR(k), String(v));
  });
}

/* React hook: holds seed + mode, applies CSS vars, persists to localStorage */
function useDynamicColor(rootRef) {
  const [seed, setSeed] = React.useState(
    () => localStorage.getItem('ultra-seed') || '#B5651D'
  );
  const [mode, setMode] = React.useState(
    () => localStorage.getItem('ultra-mode') || 'light'
  );

  React.useEffect(() => {
    const { h, C } = hexToOklch(seed);
    const scheme = buildScheme(h, C, mode);
    applyScheme(rootRef ? rootRef.current : document.documentElement, scheme);
    localStorage.setItem('ultra-seed', seed);
    localStorage.setItem('ultra-mode', mode);
  }, [seed, mode]);

  return { seed, setSeed, mode, setMode };
}

Object.assign(window, { hexToOklch, buildScheme, applyScheme, useDynamicColor });
