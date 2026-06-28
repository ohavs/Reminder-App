import { useEffect, useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useBackClose } from '../../hooks/useBackClose';

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
 * Shared bottom-sheet shell. Closes on a scrim tap or a downward swipe.
 *
 * The swipe is handled with a non-passive `touchmove` listener that calls
 * preventDefault once it owns a downward drag — this works no matter which
 * child element is touched (CSS `touch-action` is not inherited, so relying on
 * it alone let the browser hijack the gesture). The transform is written
 * straight to the DOM for a smooth, re-render-free follow.
 */
export function BottomSheet({
  open, onClose, children,
  maxWidth = 560, maxHeight, padding = '14px 24px 28px',
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const scrollable = !!maxHeight;

  // Android back / edge-swipe closes the sheet
  useBackClose(open, onClose);

  // Base open/closed position, set before paint so there's no flash
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

  // Drag gesture (touch + mouse)
  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;

    let startY = 0, dy = 0, t0 = 0, dragging = false, candidate = false, mouse = false;

    const follow = (y: number) => {
      el.style.transition = 'none';
      el.style.transform = `translateY(${y}px)`;
      const sc = scrimRef.current;
      if (sc) { sc.style.transition = 'none'; sc.style.opacity = String(0.4 * Math.max(0, 1 - y / 600)); }
    };
    const settle = (close: boolean) => {
      const sc = scrimRef.current;
      if (close) {
        el.style.transition = CLOSE_T; el.style.transform = 'translateY(110%)';
        if (sc) { sc.style.transition = 'opacity 0.26s'; sc.style.opacity = '0'; }
        window.setTimeout(() => onCloseRef.current(), 170);
      } else {
        el.style.transition = SPRING; el.style.transform = 'translateY(0)';
        if (sc) { sc.style.transition = 'opacity 0.3s'; sc.style.opacity = '0.4'; }
      }
    };
    const finish = () => {
      if (!dragging) { candidate = false; return; }
      dragging = false; candidate = false;
      const v = dy / Math.max(Date.now() - t0, 1); // px/ms
      settle(dy > 100 || v > 0.4);
    };

    // ---- touch ----
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) { candidate = false; return; }
      startY = e.touches[0].clientY; dy = 0; t0 = Date.now(); dragging = false;
      candidate = !(scrollable && el.scrollTop > 0); // scrollable: only from the top
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!candidate && !dragging) return;
      const d = e.touches[0].clientY - startY;
      if (!dragging) {
        if (d < -2) { candidate = false; return; }      // scrolling up → release
        if (d <= 6) return;                              // not yet a drag
        if (scrollable && el.scrollTop > 0) { candidate = false; return; }
        dragging = true;
      }
      dy = Math.max(0, d);
      follow(dy);
      e.preventDefault();                                // own the gesture
    };

    // ---- mouse (desktop) ----
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (scrollable && el.scrollTop > 0) return;
      startY = e.clientY; dy = 0; t0 = Date.now(); dragging = false; candidate = true; mouse = true;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!mouse) return;
      const d = e.clientY - startY;
      if (!dragging) { if (d <= 6) return; dragging = true; }
      dy = Math.max(0, d); follow(dy);
    };
    const onMouseUp = () => { if (mouse) { mouse = false; finish(); } };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', finish);
    el.addEventListener('touchcancel', finish);
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', finish);
      el.removeEventListener('touchcancel', finish);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [scrollable]);

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
        pointerEvents: 'none',   // taps above the sheet fall through to the scrim
      }}>
        <div
          ref={sheetRef}
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
          <div style={{
            width: 44, height: 5, borderRadius: 3,
            background: 'var(--md-outline-variant)', margin: '0 auto 16px',
            flexShrink: 0,
          }} />
          {children}
        </div>
      </div>
    </>
  );
}
