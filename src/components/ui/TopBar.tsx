import type { ReactNode } from 'react';

interface TopBarProps {
  title?: ReactNode;
  leading?: ReactNode;
  actions?: ReactNode[];
}

export function TopBar({ title, leading, actions }: TopBarProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '6px 4px 14px', minHeight: 56,
    }}>
      {leading}
      <div style={{ flex: 1 }}>{title}</div>
      {actions && <div style={{ display: 'flex', gap: 4 }}>{actions}</div>}
    </div>
  );
}
