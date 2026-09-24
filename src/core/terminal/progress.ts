/*
 * Transfer-progress rendering for the shell — pure presentation, zero DOM,
 * zero React (future terminal-core pkg). The host measures bytes and paces
 * the frames; this file only turns numbers into a line of text.
 *
 * 18 cells keeps the rendered line at 34 chars, which still fits the
 * minimum-width shell window (340px) on a 360px viewport without wrapping.
 * Glyphs match the skills art in me.json (█ filled, ░ rest).
 */

export const BAR_CELLS = 18;

/*
 * `[██████░░░░░░░░░░░░]` — fraction clamped to 0…1. Cells FLOOR rather than
 * round: a full bar (and "100%") must mean finished, not 97% rounded up.
 */
export function progressBar(fraction: number): string {
  const f = Math.max(0, Math.min(1, fraction));
  const filled = f >= 1 ? BAR_CELLS : Math.floor(f * BAR_CELLS);
  return `[${"█".repeat(filled)}${"░".repeat(BAR_CELLS - filled)}]`;
}

/** 8606 → "8.4 KB" (one decimal below 10, whole units above) */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${Math.max(0, Math.round(bytes))} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

/** `[██████░░░░░░░░░░░░]  36%  3.1 KB` */
export function transferLine(fraction: number, loaded: number): string {
  const f = Math.max(0, Math.min(1, fraction));
  const pct = `${f >= 1 ? 100 : Math.floor(f * 100)}%`;
  return `${progressBar(fraction)} ${pct.padStart(4)}  ${formatBytes(loaded)}`;
}
