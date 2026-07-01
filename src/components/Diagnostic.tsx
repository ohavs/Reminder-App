import { useEffect, useState } from 'react';

/**
 * TEMPORARY on-device diagnostic. Renders a fixed line at the top showing real
 * layout heights and any global/runtime error, so a single screenshot reveals
 * why the home view is blank on the device (it renders fine everywhere else).
 * Remove once the cause is found.
 */
export function Diagnostic() {
  const [info, setInfo] = useState('measuring…');
  const [errs, setErrs] = useState<string[]>([]);

  useEffect(() => {
    const onErr = (e: ErrorEvent) => setErrs((p) => [...p, `ERR: ${e.message} @${e.filename?.split('/').pop()}:${e.lineno}`]);
    const onRej = (e: PromiseRejectionEvent) => setErrs((p) => [...p, `REJ: ${String(e.reason).slice(0, 120)}`]);
    window.addEventListener('error', onErr);
    window.addEventListener('unhandledrejection', onRej);

    const measure = () => {
      const q = (s: string) => document.querySelector(s) as HTMLElement | null;
      const shell = q('.app-shell');
      const content = q('.app-content');
      const scroll = q('.scroll-area');
      const enter = q('.screen-enter');
      setInfo([
        `win ${window.innerHeight}`,
        `vh ${Math.round(window.visualViewport?.height ?? 0)}`,
        `shell ${shell?.offsetHeight ?? '∅'}`,
        `content ${content?.offsetHeight ?? '∅'}`,
        `scroll ${scroll?.offsetHeight ?? '∅'}/${scroll?.scrollHeight ?? '∅'}`,
        `enterKids ${enter?.childElementCount ?? '∅'}`,
        `ua ${/Chrome\/(\d+)/.exec(navigator.userAgent)?.[1] ?? '?'}`,
      ].join(' · '));
    };
    const t1 = setTimeout(measure, 1500);
    const t2 = setTimeout(measure, 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); window.removeEventListener('error', onErr); window.removeEventListener('unhandledrejection', onRej); };
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2147483647,
      background: '#000', color: '#0f0', font: '10px/1.35 monospace',
      padding: '3px 6px', direction: 'ltr', whiteSpace: 'pre-wrap', maxHeight: '35vh', overflow: 'auto',
      pointerEvents: 'none',
    }}>
      {info}
      {errs.length > 0 && '\n' + errs.slice(-6).join('\n')}
    </div>
  );
}
