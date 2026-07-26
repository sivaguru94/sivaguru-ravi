/*
 * First-load JS budget for `/` (plan §8): fails the pipeline if the gzipped
 * sum of script chunks referenced by the prerendered home HTML exceeds the
 * budget. Keeps "sections are server components, shell is lazy" honest.
 *   node scripts/check-budget.mjs   (run after `next build`)
 */
import { readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";

/* Measured floor on Next 16.2 + React 19: ~151 KB gz of framework chunks;
 * our own client code (theme, nav, anim leaves, launcher) is ~9 KB. The
 * budget leaves ~5 KB headroom so any shell/section/library creep into
 * first-load fails CI. noModule (legacy-only) polyfills are excluded —
 * modern browsers never fetch them. */
const BUDGET_GZ = 165_000; // bytes, gzipped

const html = await readFile(
  new URL("../.next/server/app/index.html", import.meta.url),
  "utf8",
);
const files = [
  ...new Set(
    [...html.matchAll(/<script[^>]*src="\/_next\/(static\/[^"]+\.js)"[^>]*>/g)]
      .filter((m) => !m[0].includes("noModule"))
      .map((m) => m[1]),
  ),
];
if (!files.length) {
  console.error("budget: no script chunks found in prerendered index.html");
  process.exit(1);
}

let total = 0;
for (const f of files) {
  const buf = await readFile(new URL(`../.next/${f}`, import.meta.url));
  total += gzipSync(buf).length;
}

const kb = (n) => (n / 1024).toFixed(1) + " KB";
console.log(
  `first-load JS for /: ${kb(total)} gz across ${files.length} chunks (budget ${kb(BUDGET_GZ)})`,
);
if (total > BUDGET_GZ) {
  console.error("budget: EXCEEDED — did something client-side creep in?");
  process.exit(1);
}
