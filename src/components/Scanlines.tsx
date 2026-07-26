import styles from "./Scanlines.module.css";

/*
 * CRT scanline overlay — single top-level fixed element so it stays on its
 * own compositor layer (scrolling under it is pure compositing; verify with
 * DevTools paint-flashing per M1 done-criteria). Dark-only via the
 * --scanlines-opacity derived token; no JS involved in theming it.
 */
export function Scanlines() {
  return <div className={styles.scanlines} data-scanlines aria-hidden="true" />;
}
