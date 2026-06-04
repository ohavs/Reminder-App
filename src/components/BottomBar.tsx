import { useRef, useState, useLayoutEffect } from 'react';
import type { NavTab } from '../types';
import { useRipple } from '../hooks/useRipple';

interface NavItem {
  id: NavTab;
  icon: string;
  label: string;
}

const NAV: NavItem[] = [
  { id: 'home',     icon: 'home',          label: 'בית' },
  { id: 'calendar', icon: 'calendar_month', label: 'לוח' },
  { id: 'stats',    icon: 'bar_chart',      label: 'סטטיסטיקה' },
  { id: 'profile',  icon: 'person',         label: 'פרופיל' },
];

interface BottomBarProps {
  active: NavTab;
  onNav: (tab: NavTab) => void;
  onAdd: () => void;
}

function Fab({ onAdd }: { onAdd: () => void }) {
  const ripple = useRipple();
  return (
    <button
      className="ripple-host fab-pulse pressable"
      aria-label="הוסף תזכורת"
      onClick={(e) => { ripple(e); onAdd(); }}
      style={{
        width: 66, height: 66, borderRadius: 'var(--r-lg)', border: 'none',
        cursor: 'pointer',
        background: 'radial-gradient(130% 130% at 32% 25%, color-mix(in oklab, var(--md-primary) 78%, #fff 22%), var(--md-primary))',
        color: 'var(--md-on-primary)',
        display: 'grid', placeItems: 'center',
        boxShadow: '0 10px 26px -6px var(--md-primary), var(--clay-hi)',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span className="msym" style={{ fontSize: 32, fontVariationSettings: "'wght' 500" }}>add</span>
    </button>
  );
}

interface NavBtnProps {
  item: NavItem;
  active: NavTab;
  onNav: (id: NavTab) => void;
  refCallback: (el: HTMLDivElement | null) => void;
}

function NavBtn({ item, active, onNav, refCallback }: NavBtnProps) {
  const on = active === item.id;
  return (
    <button
      onClick={() => onNav(item.id)}
      style={{
        flex: 1, border: 'none', background: 'transparent', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        WebkitTapHighlightColor: 'transparent',
        padding: '8px 0', position: 'relative', zIndex: 1,
      }}
    >
      <div
        ref={refCallback}
        style={{
          width: 54, height: 32, borderRadius: 'var(--r-pill)',
          display: 'grid', placeItems: 'center',
        }}
      >
        <span
          className="msym"
          style={{
            fontSize: 25,
            color: on ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
            fontVariationSettings: on ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400",
            transition: 'color 0.3s var(--ease), font-variation-settings 0.3s var(--ease)',
            transform: on ? 'translateY(-1px)' : 'none',
            display: 'block',
          }}
        >
          {item.icon}
        </span>
      </div>
      <span style={{
        font: `${on ? 700 : 500} 11px var(--font-body)`,
        color: on ? 'var(--md-on-surface)' : 'var(--md-on-surface-variant)',
        transition: 'color 0.3s',
      }}>
        {item.label}
      </span>
    </button>
  );
}

export function BottomBar({ active, onNav, onAdd }: BottomBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [pill, setPill] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const el = iconRefs.current[active];
    const bar = barRef.current;
    if (!el || !bar) return;
    const r = el.getBoundingClientRect();
    const br = bar.getBoundingClientRect();
    setPill({ left: r.left - br.left, top: r.top - br.top, width: r.width, height: r.height });
  }, [active]);

  return (
    <div style={{
      position: 'absolute', insetInline: 0, bottom: 0, zIndex: 30,
      padding: '0 16px 18px', pointerEvents: 'none',
    }}>
      <div
        ref={barRef}
        style={{
          position: 'relative', pointerEvents: 'auto',
          display: 'flex', alignItems: 'center', height: 70, padding: '0 6px',
          background: 'color-mix(in oklab, var(--md-surface-container) 86%, transparent)',
          backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
          borderRadius: 'var(--r-xl)',
          border: '1px solid color-mix(in oklab, var(--md-outline-variant) 55%, transparent)',
          boxShadow: 'var(--sh-2)',
        }}
      >
        {pill && (
          <div style={{
            position: 'absolute', left: pill.left, top: pill.top,
            width: pill.width, height: pill.height, borderRadius: 'var(--r-pill)',
            background: 'var(--md-secondary-container)',
            transition: 'left 0.45s var(--ease-spring), width 0.45s var(--ease-spring)',
            zIndex: 0,
          }} />
        )}

        {NAV.slice(0, 2).map((n) => (
          <NavBtn
            key={n.id} item={n} active={active} onNav={onNav}
            refCallback={(el) => { iconRefs.current[n.id] = el; }}
          />
        ))}

        <div style={{ flex: '0 0 auto', width: 70 }} />

        {NAV.slice(2).map((n) => (
          <NavBtn
            key={n.id} item={n} active={active} onNav={onNav}
            refCallback={(el) => { iconRefs.current[n.id] = el; }}
          />
        ))}
      </div>

      <div style={{
        position: 'absolute', left: '50%', bottom: 32,
        transform: 'translateX(-50%)', pointerEvents: 'auto',
      }}>
        <Fab onAdd={onAdd} />
      </div>
    </div>
  );
}
