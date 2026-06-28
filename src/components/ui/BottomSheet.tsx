import { useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: number;
  maxHeight?: string;  // e.g. '85%' — turns the sheet into a scroll container
  padding?: string;
}

const SPRING = 'transform 0.42s cubic-bezier(0.34,1.3,0.5,1)';
const CLOSE_T = 'transform 0.26s cubic-bezier(0.2,0,0,1)';

/**
 * Shared bottom-sheet shell. Closes on:
 *   • tap on the scrim behind it
 *   • a downward swipe past a distance/velocity threshold
 *
 * The drag is applied straight to the DOM node (no React state per frame) for a
 * buttery follow, and `touch-action` is set so the browser doesn't hijack the
 * vertical gesture. Non-scrolling sheets drag from anywhere; scrolling sheets
 * drag from the grab handle (so their content can still scroll).
 */
export function BottomSheet({
  open, onClose, children,
  maxWidth = 560, maxHeight, padding = '14px 24px 28px',
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const scrollable = !!maxHeight;
  const g = useRef({ pending: false, active: false, fromHandle: false, id: -1, startY: 0, dy: 0, t0: 0 });

  // Drive base open/closed position imperatively (before paint, so no flash)
  useLayoutEffect(() => {
    const el = sheetRef.current, sc = scrimRef.current;
    if (!el) return;
    el.style.transition = open ? SPRING : CLOSE_T;
    el.style.transform = open ? 'translateY(0)' : 'translateY(110%)';
    if (sc) {
      sc.style.transition = 'opacity 0.3s cubic-bezier(0.2,0,0,1)';
      sc.style.opacity = open ? '0.4' : '0';
    }
  }, [open]);

  const follow = (dy: number) => {
    const el = sheetRef.current, sc = scrimRef.current;
    if (el) { el.style.transition = 'none'; el.style.transform = `translateY(${dy}px)`; }
    if (sc) { sc.style.transition = 'none'; sc.style.opacity = String(0.4 * Math.max(0, 1 - dy / 600)); }
  };

  const snapBack = () => {
    const el = sheetRef.current, sc = scrimRef.current;
    if (el) { el.style.transition = SPRING; el.style.transform = 'translateY(0)'; }
    if (sc) { sc.style.transition = 'opacity 0.3s'; sc.style.opacity = '0.4'; }
  };

  const animateClose = () => {
    const el = sheetRef.current, sc = scrimRef.current;
    if (el) { el.style.transition = CLOSE_T; el.style.transform = 'translateY(110%)'; }
    if (sc) { sc.style.transition = 'opacity 0.26s'; sc.style.opacity = '0'; }
    window.setTimeout(onClose, 170);
  };

  const begin = (e: React.PointerEvent, fromHandle = false) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    g.current = { pending: true, active: false, fromHandle, id: e.pointerId, startY: e.clientY, dy: 0, t0: Date.now() };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const s = g.current;
    if (s.id !== e.pointerId || (!s.pending && !s.active)) return;
    const dy = e.clientY - s.startY;
    if (!s.active) {
      if (dy < 6) return;                      // small move → let taps/clicks through
      // For scrollable sheets started from the body, only drag when at the top
      if (scrollable && !s.fromHandle && (sheetRef.current?.scrollTop ?? 0) > 0) {
        s.pending = false; return;
      }
      s.active = true;
      try { sheetRef.current?.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    }
    s.dy = Math.max(0, dy);
    follow(s.dy);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const s = g.current;
    if (s.id !== e.pointerId) return;
    const wasActive = s.active;
    s.pending = false; s.active = false; s.id = -1;
    if (!wasActive) return;                     // it was a tap
    const v = s.dy / Math.max(Date.now() - s.t0, 1);  // px per ms
    if (s.dy > 110 || v > 0.45) animateClose(); else snapBack();
  };

  return (
    <>
      <div
        ref={scrimRef}
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0, background: 'var(--md-scrim)',
          opacity: 0, pointerEvents: open ? 'auto' : 'none', zIndex: 40,
        }}
      />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 41,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        // Transparent to taps so clicks above the sheet reach the scrim;
        // the sheet itself re-enables pointer events.
        pointerEvents: 'none',
      }}>
        <div
          ref={sheetRef}
          onPointerDown={scrollable ? undefined : begin}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            width: '100%', maxWidth,
            ...(maxHeight ? { maxHeight, overflowY: 'auto' } : null),
            background: 'var(--md-surface-container-high)',
            borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
            padding,
            transform: 'translateY(110%)',
            boxShadow: '0 -8px 40px -8px rgba(0,0,0,.3)',
            pointerEvents: 'auto',
            touchAction: scrollable ? 'pan-y' : 'none',
            overscrollBehavior: 'contain',
          }}
        >
          <div
            onPointerDown={(e) => begin(e, true)}
            style={{
              width: 44, height: 5, borderRadius: 3,
              background: 'var(--md-outline-variant)', margin: '0 auto 18px',
              cursor: 'grab', flexShrink: 0, touchAction: 'none',
              // bigger invisible hit area for easy grabbing
              padding: '10px 40px', boxSizing: 'content-box',
              backgroundClip: 'content-box',
            }}
          />
          {children}
        </div>
      </div>
    </>
  );
}
