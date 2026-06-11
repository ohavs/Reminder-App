import { useEffect, useRef } from 'react';

const ITEM_H = 40;
const VISIBLE = 5;

interface WheelPickerProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  width?: number;
}

/** iOS-style vertical snap wheel, styled for the clay/M3 look. */
export function WheelPicker({ options, value, onChange, width = 64 }: WheelPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isUserScroll = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = options.indexOf(value);
    if (idx < 0) return;
    const target = idx * ITEM_H;
    if (Math.abs(el.scrollTop - target) > 2 && !isUserScroll.current) {
      el.scrollTop = target;
    }
  }, [value, options]);

  const handleScroll = () => {
    isUserScroll.current = true;
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;
      const idx = Math.max(0, Math.min(options.length - 1, Math.round(el.scrollTop / ITEM_H)));
      isUserScroll.current = false;
      if (options[idx] !== value) onChange(options[idx]);
    }, 130);
  };

  const pick = (idx: number) => {
    scrollRef.current?.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' });
    onChange(options[idx]);
  };

  return (
    <div style={{ position: 'relative', height: ITEM_H * VISIBLE, width, flexShrink: 0 }}>
      {/* Center selection pill */}
      <div style={{
        position: 'absolute', insetInline: 0, top: '50%', height: ITEM_H,
        transform: 'translateY(-50%)', borderRadius: 'var(--r-sm)',
        background: 'var(--md-secondary-container)',
        pointerEvents: 'none',
      }} />

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="hide-scroll"
        style={{
          position: 'relative', height: '100%', overflowY: 'auto',
          scrollSnapType: 'y mandatory',
          paddingBlock: ITEM_H * Math.floor(VISIBLE / 2),
        }}
      >
        {options.map((o, i) => {
          const sel = o === value;
          return (
            <div
              key={o}
              onClick={() => pick(i)}
              style={{
                height: ITEM_H, display: 'grid', placeItems: 'center',
                scrollSnapAlign: 'center', cursor: 'pointer',
                font: sel ? '800 22px var(--font-display)' : '500 17px var(--font-body)',
                fontVariantNumeric: 'tabular-nums',
                color: sel ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
                opacity: sel ? 1 : 0.55,
                transition: 'opacity 0.15s, color 0.15s',
                userSelect: 'none', WebkitTapHighlightColor: 'transparent',
              }}
            >
              {o}
            </div>
          );
        })}
      </div>

      {/* Top / bottom fades */}
      <div style={{
        position: 'absolute', insetInline: 0, top: 0, height: ITEM_H * 1.4,
        background: 'linear-gradient(to bottom, var(--md-surface-container-lowest), transparent)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', insetInline: 0, bottom: 0, height: ITEM_H * 1.4,
        background: 'linear-gradient(to top, var(--md-surface-container-lowest), transparent)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}
