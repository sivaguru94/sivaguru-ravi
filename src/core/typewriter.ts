import type { CancelFn } from "./tween";

/*
 * Types `text` one character at a time at `msPerChar`, delivering each
 * prefix to `write` (the caller owns the DOM node). Cancelable; matches the
 * prototype's setTimeout-chain pacing exactly.
 */
export function typewriter(
  text: string,
  msPerChar: number,
  write: (s: string) => void,
  onComplete?: () => void,
): CancelFn {
  let i = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let cancelled = false;

  const tick = () => {
    if (cancelled) return;
    if (i <= text.length) {
      write(text.slice(0, i));
      i++;
      timer = setTimeout(tick, msPerChar);
    } else {
      onComplete?.();
    }
  };
  tick();

  return () => {
    cancelled = true;
    if (timer !== undefined) clearTimeout(timer);
  };
}
