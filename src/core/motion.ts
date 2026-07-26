import { prefsStore } from "./theme";

/*
 * Effective reduced-motion (plan §4 precedence):
 *   OS `prefers-reduced-motion: reduce`  OR  persisted `motion off`.
 * Live: subscribers fire on either source changing mid-session; animation
 * leaves cancel in-flight work and jump to final state.
 */

const QUERY = "(prefers-reduced-motion: reduce)";

export function isMotionReduced(): boolean {
  if (typeof window === "undefined") return false;
  return prefsStore.getMotion() === "off" || window.matchMedia(QUERY).matches;
}

export function onMotionChange(cb: () => void): () => void {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  const unsub = prefsStore.subscribe(cb);
  return () => {
    mq.removeEventListener("change", cb);
    unsub();
  };
}
