import type { NavTab } from '../types';
import { useRipple } from '../hooks/useRipple';
import { Icon } from './ui/Icon';

interface NavItem {
  id: NavTab;
  icon: string;
  label: string;
}

const NAV: NavItem[] = [
  { id: 'home',     icon: 'home',     label: 'בית' },
  { id: 'calendar', icon: 'calendar', label: 'לוח' },
  { id: 'profile',  icon: 'user',     label: 'פרופיל' },
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
        width: 62, height: 62, borderRadius: 'var(--r-lg)', border: 'none',
        cursor: 'pointer',
        background: 'radial-gradient(130% 130% at 32% 25%, color-mix(in oklab, var(--md-primary) 78%, #fff 22%), var(--md-primary))',
        color: 'var(--md-on-primary)',
        display: 'grid', placeItems: 'center',
        boxShadow: '0 10px 26px -6px var(--md-primary), var(--clay-hi)',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <Icon name="plus" size={28} color="var(--md-on-primary)" />
    </button>
  );
}

function NavBtn({ item, active, onNav }: { item: NavItem; active: NavTab; onNav: (id: NavTab) => void }) {
  const on = active === item.id;
  return (
    <button
      onClick={() => onNav(item.id)}
      style={{
        flex: 1, border: 'none',
        background: on ? 'var(--md-secondary-container)' : 'transparent',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
        borderRadius: 'var(--r-md)',
        margin: '5px 3px',
        transition: 'background 0.3s var(--ease)',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <Icon
        name={item.icon}
        size={23}
        color={on ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)'}
      />
      <span style={{
        font: `${on ? 700 : 500} 11px var(--font-body)`,
        color: on ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
        transition: 'color 0.3s',
      }}>
        {item.label}
      </span>
    </button>
  );
}

export function BottomBar({ active, onNav, onAdd }: BottomBarProps) {
  return (
    <div style={{
      position: 'absolute', insetInline: 0, bottom: 0, zIndex: 30,
      padding: '0 16px 18px', pointerEvents: 'none',
    }}>
      <div style={{
        pointerEvents: 'auto',
        display: 'flex', alignItems: 'stretch', height: 70, padding: '0 4px',
        background: 'color-mix(in oklab, var(--md-surface-container) 86%, transparent)',
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        borderRadius: 'var(--r-xl)',
        border: '1px solid color-mix(in oklab, var(--md-outline-variant) 55%, transparent)',
        boxShadow: 'var(--sh-2)',
      }}>
        {NAV.slice(0, 2).map((n) => (
          <NavBtn key={n.id} item={n} active={active} onNav={onNav} />
        ))}

        <div style={{ flex: '0 0 auto', width: 70 }} />

        {NAV.slice(2).map((n) => (
          <NavBtn key={n.id} item={n} active={active} onNav={onNav} />
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
