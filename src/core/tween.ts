/*
 * rAF tween core — the only animation engine on the site (no libraries).
 * Pure TS, framework-agnostic. Every tween returns a cancel handle; React
 * hooks MUST cancel in cleanup (StrictMode-safe). Consumers write per-frame
 * values to the DOM directly (refs/textContent) — never through React state.
 */

export type CancelFn = () => void;
export type Easing = (t: number) => number;

/* the prototype's anime.js curve */
export const easeOutExpo: Easing = (t) =>
  t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);

export function tween(opts: {
  duration: number;
  delay?: number;
  easing?: Easing;
  onUpdate: (v: number) => void;
  onComplete?: () => void;
}): CancelFn {
  const { duration, delay = 0, easing = easeOutExpo, onUpdate, onComplete } =
    opts;
  let raf = 0;
  let cancelled = false;
  const start = performance.now() + delay;

  const frame = (now: number) => {
    if (cancelled) return;
    if (now < start) {
      raf = requestAnimationFrame(frame);
      return;
    }
    const t = Math.min(1, (now - start) / duration);
    onUpdate(easing(t));
    if (t < 1) {
      raf = requestAnimationFrame(frame);
    } else {
      onComplete?.();
    }
  };
  raf = requestAnimationFrame(frame);

  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
  };
}
