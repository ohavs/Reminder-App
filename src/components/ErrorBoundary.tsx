import { Component } from 'react';
import type { ReactNode } from 'react';

interface State { err: Error | null; }

/**
 * Catches render-time crashes so the app shows a recoverable error screen
 * instead of a blank/frozen view, and surfaces the message for diagnosis.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { err: null };

  static getDerivedStateFromError(err: Error): State { return { err }; }

  componentDidCatch(err: Error) { console.error('App crash:', err); }

  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16, padding: 28,
        textAlign: 'center', background: 'var(--md-surface, #fdf6ee)', color: 'var(--md-on-surface, #1b1b1b)',
        font: '500 15px system-ui, sans-serif', direction: 'rtl',
      }}>
        <div style={{ fontSize: 40 }}>😵‍💫</div>
        <div style={{ fontWeight: 800, fontSize: 20 }}>משהו השתבש</div>
        <div style={{ opacity: 0.7, maxWidth: 360 }}>האפליקציה נתקלה בשגיאה. נסה לרענן — אם זה חוזר, שלח צילום מסך של ההודעה הזו.</div>
        <pre style={{
          maxWidth: '100%', overflow: 'auto', textAlign: 'left', direction: 'ltr',
          background: 'rgba(0,0,0,.06)', padding: 12, borderRadius: 12,
          font: '12px monospace', whiteSpace: 'pre-wrap', maxHeight: 200,
        }}>
          {this.state.err.message}
        </pre>
        <button
          onClick={() => { window.location.reload(); }}
          style={{
            height: 48, padding: '0 28px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: 'var(--md-primary, #6750A4)', color: 'var(--md-on-primary, #fff)',
            font: '700 16px system-ui, sans-serif',
          }}
        >
          רענון
        </button>
      </div>
    );
  }
}
