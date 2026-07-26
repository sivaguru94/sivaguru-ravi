"use client";

import { useEffect, useRef } from "react";
import { tween, type CancelFn } from "@/core/tween";
import { isMotionReduced, onMotionChange } from "@/core/motion";
import styles from "./AsciiBar.module.css";

const CELLS = 20;

type Props = { pct: number };

/*
 * 20-cell █ skill bar: the split point animates 0→pct over 1300ms
 * easeOutExpo on scroll-in. Identical glyph for filled and rest (never mix
 * █ with ░/▌ — fallback fonts render them at different heights). Writes
 * textContent only when the filled count actually changes (≤20 writes).
 * Server HTML renders the final split for no-JS/SEO.
 */
export function AsciiBar({ pct }: Props) {
  const fillRef = useRef<HTMLSpanElement>(null);
  const restRef = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLSpanElement>(null);

  const finalFilled = Math.min(CELLS, Math.round(pct / 5));

  useEffect(() => {
    const root = rootRef.current;
    const fill = fillRef.current;
    const rest = restRef.current;
    if (!root || !fill || !rest || isMotionReduced()) return;

    let cancel: CancelFn | undefined;
    let last = -1;
    const write = (filled: number) => {
      if (filled === last) return;
      last = filled;
      fill.textContent = "█".repeat(filled);
      rest.textContent = "█".repeat(CELLS - filled);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          write(0);
          cancel = tween({
            duration: 1300,
            onUpdate: (v) => {
              write(Math.min(CELLS, Math.round((v * pct) / 5)));
            },
          });
        });
      },
      { threshold: 0.15 },
    );
    io.observe(root);

    const restore = () => write(finalFilled);
    const offMotion = onMotionChange(() => {
      if (!isMotionReduced()) return;
      io.disconnect();
      cancel?.();
      restore();
    });

    return () => {
      io.disconnect();
      cancel?.();
      offMotion();
      restore(); // StrictMode reset
    };
  }, [pct, finalFilled]);

  return (
    <span ref={rootRef} className={styles.bar} data-ascii data-pct={pct}>
      <span ref={fillRef} className={styles.fill}>
        {"█".repeat(finalFilled)}
      </span>
      <span ref={restRef} className={styles.rest}>
        {"█".repeat(CELLS - finalFilled)}
      </span>
    </span>
  );
}
