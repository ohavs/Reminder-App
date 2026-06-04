import type { NavTab } from '../types';
import { useRipple } from '../hooks/useRipple';
import { Icon } from './ui/Icon';

const NAV = [
  { id: 'home'     as NavTab, icon: 'home',     label: 'בית' },
  { id: 'calendar' as NavTab, icon: 'calendar', label: 'לוח שנה' },
  { id: 'stats'    as NavTab, icon: 'stats',    label: 'סטטיסטיקה' },
  { id: 'profile'  as NavTab, icon: 'user',     label: 'פרופיל' },
];

interface SideBarProps {
  active: NavTab;
  onNav: (tab: NavTab) => void;
  onAdd: () => void;
}

function NavItem({ item, active, onNav }: { item: typeof NAV[0]; active: NavTab; onNav: (id: NavTab) => void }) {
  const on = active === item.id;
  const ripple = useRipple();
  return (
    <button
      onClick={(e) => { ripple(e); onNav(item.id); }}
      className="ripple-host pressable"
      style={{
        width: '100%', border: 'none', cursor: 'pointer', borderRadius: 'var(--r-md)',
        background: on ? 'var(--md-secondary-container)' : 'transparent',
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '13px 16px',
        transition: 'background 0.25s var(--ease)',
        WebkitTapHighlightColor: 'transparent',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <Icon
        name={item.icon}
        size={22}
        color={on ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)'}
      />
      <span style={{
        font: `${on ? 700 : 500} 15px var(--font-body)`,
        color: on ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
        transition: 'color 0.25s var(--ease)',
      }}>
        {item.label}
      </span>
    </button>
  );
}

export function SideBar({ active, onNav, onAdd }: SideBarProps) {
  const ripple = useRipple();
  return (
    <aside className="app-sidebar">
      <div style={{ padding: '8px 12px 24px' }}>
        <div style={{ font: '900 26px var(--font-display)', color: 'var(--md-primary)', letterSpacing: '-0.5px', lineHeight: 1 }}>
          ULTRA
        </div>
        <div style={{ font: '500 13px var(--font-body)', color: 'var(--md-on-surface-variant)', marginTop: 2 }}>
          תזכורות
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--md-outline-variant)', marginBottom: 12 }} />

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map((item) => (
          <NavItem key={item.id} item={item} active={active} onNav={onNav} />
        ))}
      </nav>

      <button
        className="ripple-host pressable"
        onClick={(e) => { ripple(e); onAdd(); }}
        style={{
          width: '100%', border: 'none', cursor: 'pointer',
          borderRadius: 'var(--r-lg)',
          background: 'radial-gradient(130% 130% at 32% 25%, color-mix(in oklab, var(--md-primary) 78%, #fff 22%), var(--md-primary))',
          color: 'var(--md-on-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: '15px 20px',
          font: '700 16px var(--font-body)',
          boxShadow: '0 6px 20px -6px var(--md-primary)',
          transition: 'opacity 0.2s',
          position: 'relative', overflow: 'hidden',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <Icon name="plus" size={22} color="var(--md-on-primary)" />
        תזכורת חדשה
      </button>
    </aside>
  );
}
