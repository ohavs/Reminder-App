import { useState, useEffect } from 'react';
import { SEED_COLORS } from '../data/sampleData';
import { hexToOklch, oklchHueToHex } from '../theme/dynamicColor';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';

interface ColorSheetProps {
  open: boolean;
  onClose: () => void;
  seed: string;
  setSeed: (s: string) => void;
}

export function ColorSheet({ open, onClose, seed, setSeed }: ColorSheetProps) {
  const [hue, setHue] = useState(0);

  useEffect(() => {
    if (open) {
      const { h } = hexToOklch(seed);
      setHue(Math.round(h));
    }
  }, [open, seed]);

  const applyHue = (val: number) => {
    setHue(val);
    setSeed(oklchHueToHex(val));
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0, background: 'var(--md-scrim)',
          opacity: open ? 0.4 : 0, pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s var(--ease)', zIndex: 40,
        }}
      />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 41,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        pointerEvents: open ? 'auto' : 'none',
      }}>
        <div style={{
          width: '100%', maxWidth: 520,
          background: 'var(--md-surface-container-high)',
          borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
          padding: '14px 22px 32px',
          transform: open ? 'translateY(0)' : 'translateY(110%)',
          transition: 'transform 0.42s var(--ease-spring)',
          boxShadow: '0 -8px 40px -8px rgba(0,0,0,.3)',
          pointerEvents: 'auto',
        }}>
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'var(--md-outline-variant)', margin: '0 auto 18px',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Icon name="palette" size={24} color="var(--md-primary)" />
          <h3 style={{ font: '800 20px var(--font-display)', color: 'var(--md-on-surface)', margin: 0 }}>
            צבע דינמי
          </h3>
        </div>
        <p style={{
          font: '500 14px var(--font-body)', color: 'var(--md-on-surface-variant)', margin: '0 0 20px',
        }}>
          בחר צבע בסיס — כל הממשק יתאים את עצמו אוטומטית
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
          {SEED_COLORS.map((c) => {
            const sel = c.hex.toLowerCase() === seed.toLowerCase();
            return (
              <button
                key={c.hex}
                onClick={() => setSeed(c.hex)}
                title={c.name}
                style={{
                  aspectRatio: '1', borderRadius: 'var(--r-md)', cursor: 'pointer',
                  border: sel ? '3px solid var(--md-on-surface)' : '2px solid transparent',
                  background: c.hex, display: 'grid', placeItems: 'center',
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'transform 0.2s var(--ease-spring)',
                  transform: sel ? 'scale(1.06)' : 'scale(1)',
                }}
              >
                {sel && <Icon name="check" size={22} color="#fff" />}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Icon name="sliders" size={19} color="var(--md-on-surface-variant)" />
          <span style={{ font: '700 14px var(--font-body)', color: 'var(--md-on-surface-variant)' }}>
            גוון מותאם אישית
          </span>
        </div>
        <input
          type="range" min="0" max="360" value={hue}
          onChange={(e) => applyHue(+e.target.value)}
          className="hue-slider"
          style={{
            width: '100%', height: 22, borderRadius: 'var(--r-pill)',
            appearance: 'none', WebkitAppearance: 'none',
            background: 'linear-gradient(to left, oklch(.6 .15 0), oklch(.6 .15 60), oklch(.6 .15 120), oklch(.6 .15 180), oklch(.6 .15 240), oklch(.6 .15 300), oklch(.6 .15 360))',
            cursor: 'pointer',
          }}
        />

        <div style={{ marginTop: 22 }}>
          <Button full onClick={onClose}>סיום</Button>
        </div>
        </div>
      </div>
    </>
  );
}
