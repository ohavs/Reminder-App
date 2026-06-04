import type { ReactNode } from 'react';

interface SectionTitleProps {
  children: ReactNode;
  action?: ReactNode;
}

export function SectionTitle({ children, action }: SectionTitleProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline',
      justifyContent: 'space-between', margin: '4px 2px 12px',
    }}>
      <h2 style={{
        font: '700 21px var(--font-display)',
        color: 'var(--md-on-surface)', margin: 0,
      }}>
        {children}
      </h2>
      {action}
    </div>
  );
}
