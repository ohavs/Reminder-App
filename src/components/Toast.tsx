interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  return (
    <div style={{
      position: 'absolute', bottom: 96, insetInline: 0,
      display: 'grid', placeItems: 'center',
      zIndex: 50, pointerEvents: 'none',
    }}>
      <div
        className="toast-in"
        style={{
          background: 'var(--md-inverse-surface)',
          color: 'var(--md-inverse-on-surface)',
          padding: '12px 20px', borderRadius: 'var(--r-pill)',
          font: '600 14px var(--font-body)',
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 6px 20px -4px rgba(0,0,0,.4)',
        }}
      >
        <span className="msym" style={{ fontSize: 18, color: 'var(--md-primary)' }}>check_circle</span>
        {message}
      </div>
    </div>
  );
}
