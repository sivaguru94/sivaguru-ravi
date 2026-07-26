import data from "./me.json";

/*
 * Single source of truth for all site content (author decision 2026-07-26).
 * Today it's a static JSON import; when content moves to a database or CMS,
 * ONLY this file changes — `getMe()` becomes a real async fetch and every
 * (server-component) consumer already awaits it. The shell registry imports
 * `me` synchronously; if content goes remote, pass a snapshot into the
 * engine instead.
 */

export type Me = typeof data;

export const me: Me = data;

export async function getMe(): Promise<Me> {
  return me;
}
