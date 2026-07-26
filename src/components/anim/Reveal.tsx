"use client";

import { useEffect, useRef } from "react";
import { tween, type CancelFn } from "@/core/tween";
import { isMotionReduced, onMotionChange } from "@/core/motion";
import styles from "./Reveal.module.css";

type Props = {
  children: React.ReactNode;
  /** ms, matches the prototype's data-delay */
  delay?: number;
  /** render as this element so grid/flex parents see the real child */
  as?: "div" | "h2" | "p";
  className?: string;
};

/*
 * Scroll-in reveal leaf: 700ms easeOutExpo, x −14→0 / opacity 0→1, one-shot.
 * Hidden initial state comes from CSS gated on html[data-js] (set pre-paint),
 * so no-JS renders full content and JS never paints-then-blanks. Per-frame
 * writes go to el.style directly; React state is never touched.
 */
export function Reveal({ children, delay = 0, as = "div", className }: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancel: CancelFn | undefined;

    const finish = () => {
      el.style.opacity = "";
      el.style.transform = "";
      el.classList.add(styles.done);
    };

    if (isMotionReduced()) {
      finish();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          cancel = tween({
            duration: 700,
            delay,
            onUpdate: (v) => {
              el.style.opacity = String(v);
              el.style.transform = `translateX(${-14 * (1 - v)}px)`;
            },
            onComplete: finish,
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
      finish();
    });

    return () => {
      io.disconnect();
      cancel?.();
      offMotion();
      // StrictMode: reset one-shot state so the remounted effect replays
      el.classList.remove(styles.done);
      el.style.opacity = "";
      el.style.transform = "";
    };
  }, [delay]);

  const El = as as React.ElementType;
  const cls = className ? `${styles.reveal} ${className}` : styles.reveal;
  return (
    <El ref={ref} className={cls}>
      {children}
    </El>
  );
}
