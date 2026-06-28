import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: number;
  maxHeight?: string;  // e.g. '85%' — turns the sheet into a scroll container
  padding?: string;
}

/**
 * Shared bottom-sheet shell. Closes on:
 *   • tap on the scrim behind it
 *   • swipe / drag the sheet downward past a threshold
 * The drag only engages when the sheet's own scroll is at the top, so
 * scrollable content (e.g. the lists sheet) still scrolls normally.
 */
export function BottomSheet({
  open, onClose, children,
  maxWidth = 560, maxHeight, padding = '14px 24px 28px',
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const pointer = useRef<number | null>(null);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);

  // Reset any in-flight drag whenever the sheet is dismissed
  useEffect(() => {
    if (!open) { setDrag(0); setDragging(false); pointer.current = null; }
  }, [open]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    // Only start a dismiss-drag from the top of the content
    if ((sheetRef.current?.scrollTop ?? 0) > 4) return;
    startY.current = e.clientY;
    pointer.current = e.pointerId;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pointer.current !== e.pointerId) return;
    const dy = e.clientY - startY.current;
    if (dy <= 0) { if (dragging) setDrag(0); return; }
    if (!dragging) {
      if (dy < 6) return;             // tiny moves: let taps / clicks through
      setDragging(true);
      try { sheetRef.current?.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    }
    setDrag(dy);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (pointer.current !== e.pointerId) return;
    pointer.current = null;
    const shouldClose = drag > 120;
    setDragging(false);
    setDrag(0);
    if (shouldClose) onClose();
  };

  const scrimOpacity = open ? 0.4 * Math.max(0, 1 - drag / 500) : 0;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0, background: 'var(--md-scrim)',
          opacity: scrimOpacity, pointerEvents: open ? 'auto' : 'none',
          transition: dragging ? 'none' : 'opacity 0.3s var(--ease)', zIndex: 40,
        }}
      />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 41,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        // Transparent to taps so clicks above the sheet fall through to the
        // scrim (which closes it); the sheet itself re-enables pointer events.
        pointerEvents: 'none',
      }}>
        <div
          ref={sheetRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            width: '100%', maxWidth,
            ...(maxHeight ? { maxHeight, overflowY: 'auto' } : null),
            background: 'var(--md-surface-container-high)',
            borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
            padding,
            transform: open ? `translateY(${drag}px)` : 'translateY(110%)',
            transition: dragging ? 'none' : 'transform 0.42s var(--ease-spring)',
            boxShadow: '0 -8px 40px -8px rgba(0,0,0,.3)',
            pointerEvents: 'auto',
            touchAction: 'pan-y',
            overscrollBehavior: 'contain',
          }}
        >
          <div style={{
            width: 40, height: 5, borderRadius: 3,
            background: 'var(--md-outline-variant)', margin: '0 auto 18px',
            cursor: 'grab', flexShrink: 0,
          }} />
          {children}
        </div>
      </div>
    </>
  );
}
