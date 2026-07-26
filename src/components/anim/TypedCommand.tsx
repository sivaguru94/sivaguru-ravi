"use client";

import { useEffect, useRef } from "react";
import { typewriter } from "@/core/typewriter";
import type { CancelFn } from "@/core/tween";
import { isMotionReduced, onMotionChange } from "@/core/motion";
import styles from "./TypedCommand.module.css";

type Props = {
  text: string;
  /** ms per character: 45 hero, 32 sections (design spec) */
  speed?: number;
  /** "io" types on scroll-in (one-shot); "load" self-starts on mount */
  mode?: "io" | "load";
};

/*
 * Zero-CLS typewriter: an invisible copy of the full text reserves the exact
 * line box (including wraps at narrow widths); the visible overlay types on
 * top. Server HTML carries the full text in the overlay, so no-JS/SEO see
 * everything and hydration never mismatches (clearing happens post-mount).
 */
export function TypedCommand({ text, speed = 32, mode = "io" }: Props) {
  const overlayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el || isMotionReduced()) return;

    let cancel: CancelFn | undefined;
    let io: IntersectionObserver | undefined;
    let fontTimer: ReturnType<typeof setTimeout> | undefined;

    const type = () => {
      el.textContent = "";
      cancel = typewriter(text, speed, (s) => {
        el.textContent = s;
      });
    };

    if (mode === "load") {
      /* start after the mono font is ready (metric stutter guard), capped */
      let started = false;
      const start = () => {
        if (started) return;
        started = true;
        type();
      };
      document.fonts.ready.then(start);
      fontTimer = setTimeout(start, 300);
    } else {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            io?.disconnect();
            type();
          });
        },
        { threshold: 0.15 },
      );
      io.observe(el);
    }

    const offMotion = onMotionChange(() => {
      if (!isMotionReduced()) return;
      io?.disconnect();
      cancel?.();
      el.textContent = text;
    });

    return () => {
      io?.disconnect();
      cancel?.();
      offMotion();
      if (fontTimer !== undefined) clearTimeout(fontTimer);
      el.textContent = text; // StrictMode reset
    };
  }, [text, speed, mode]);

  return (
    <span className={styles.wrap}>
      <span className={styles.reserve} aria-hidden="true">
        {text}
      </span>
      <span ref={overlayRef} className={styles.overlay} data-typed-overlay>
        {text}
      </span>
    </span>
  );
}
