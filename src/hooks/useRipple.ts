import { useCallback } from 'react';
import type { MouseEvent } from 'react';

export function useRipple() {
  return useCallback((e: MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const d = Math.max(rect.width, rect.height) * 2;
    const span = document.createElement('span');
    span.className = 'ripple';
    span.style.width = span.style.height = d + 'px';
    span.style.left = e.clientX - rect.left - d / 2 + 'px';
    span.style.top = e.clientY - rect.top - d / 2 + 'px';
    el.appendChild(span);
    span.addEventListener('animationend', () => span.remove());
  }, []);
}
