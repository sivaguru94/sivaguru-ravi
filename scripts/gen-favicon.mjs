/*
 * One-shot: renders src/app/icon.svg → 16/32/48px PNGs → src/app/favicon.ico.
 * Output is committed; rerun only if the favicon source changes:
 *   node scripts/gen-favicon.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const svg = await readFile(new URL("../src/app/icon.svg", import.meta.url));
const pngs = await Promise.all(
  [16, 32, 48].map((size) => sharp(svg).resize(size, size).png().toBuffer()),
);
const ico = await pngToIco(pngs);
await writeFile(new URL("../src/app/favicon.ico", import.meta.url), ico);
console.log("favicon.ico written:", ico.length, "bytes");
