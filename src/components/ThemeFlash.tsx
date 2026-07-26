"use client";

import { useEffect, useState } from "react";
import { BladeMark } from "./logos/BladeMark";
import styles from "./ThemeFlash.module.css";

/* 120px blade, centered fullscreen, fades out over ~450ms while scaling to
 * 1.35 (design/handoff README §Brand item 6). The prototype hardcodes the
 * dark accent green for the flash in both themes — kept for fidelity. */
export function ThemeFlash() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setGone(true), 500);
    return () => clearTimeout(t);
  }, []);

  if (gone) return null;
  return (
    <div className={styles.flash} data-theme-flash aria-hidden="true">
      <BladeMark size={120} fill="#4af07a" />
    </div>
  );
}
