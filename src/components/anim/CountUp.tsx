"use client";

import { useEffect, useRef } from "react";
import { tween, type CancelFn } from "@/core/tween";
import { isMotionReduced, onMotionChange } from "@/core/motion";

type Props = { to: number; suffix?: string };

/*
 * Stat count-up: 0→to over 1400ms easeOutExpo on scroll-in (one-shot).
 * Server HTML carries the final value; the parent reserves final width
 * (min-width in ch), so digit growth never shifts layout. Writes go through
 * textContent — never React state.
 */
export function CountUp({ to, suffix = "" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || isMotionReduced()) return;

    let cancel: CancelFn | undefined;
    const final = `${to}${suffix}`;

    /* zero out only once JS owns the animation (post-hydration) */
    el.textContent = `0${suffix}`;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          cancel = tween({
            duration: 1400,
            onUpdate: (v) => {
              el.textContent = `${Math.round(v * to)}${suffix}`;
            },
          });
        });
      },
      { threshold: 0.15 },
    );
    io.observe(el);

    const offMotion = onMotionChange(() => {
      if (!isMotionReduced()) return;
      io.disconnect();
      cancel?.();
      el.textContent = final;
    });

    return () => {
      io.disconnect();
      cancel?.();
      offMotion();
      el.textContent = final; // StrictMode reset
    };
  }, [to, suffix]);

  return (
    <span ref={ref} data-count>
      {to}
      {suffix}
    </span>
  );
}
