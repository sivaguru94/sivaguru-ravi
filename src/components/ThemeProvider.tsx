"use client";

import { useEffect, useState } from "react";
import {
  themeStore,
  prefsStore,
  resolveTheme,
  resolveOnOff,
  safeStorage,
  MOTION_STORAGE_KEY,
  SCANLINES_STORAGE_KEY,
} from "@/core/theme";
import { ThemeFlash } from "./ThemeFlash";

/*
 * Mounted exactly ONCE (in layout). Single owner of:
 *  - adopting the pre-paint theme stamped on <html> by the inline script
 *  - applying store changes back to <html data-theme>
 *  - the global `T` shortcut (ignored while typing)
 *  - the blade flash on every toggle, regardless of source (button, T key,
 *    later the shell `theme` command) — it subscribes to the store, so any
 *    caller gets the flash for free.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [flashTick, setFlashTick] = useState(0);

  useEffect(() => {
    themeStore.init(resolveTheme(document.documentElement.dataset.theme));
    prefsStore.init(
      resolveOnOff(safeStorage.get(MOTION_STORAGE_KEY)),
      resolveOnOff(safeStorage.get(SCANLINES_STORAGE_KEY)),
    );

    const unsubscribe = themeStore.subscribe(() => {
      document.documentElement.dataset.theme = themeStore.get();
      setFlashTick((t) => t + 1);
    });
    const unsubPrefs = prefsStore.subscribe(() => {
      const d = document.documentElement;
      if (prefsStore.getMotion() === "off") d.dataset.motion = "off";
      else delete d.dataset.motion;
      if (prefsStore.getScanlines() === "off") d.dataset.scanlines = "off";
      else delete d.dataset.scanlines;
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key?.toLowerCase() !== "t" || e.metaKey || e.ctrlKey || e.altKey)
        return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)
      )
        return;
      themeStore.toggle();
    };
    document.addEventListener("keydown", onKeyDown);

    /* interactivity marker: keyboard shortcuts are live from here (used by
     * e2e to avoid pre-hydration races) */
    document.documentElement.dataset.ready = "";

    return () => {
      unsubscribe();
      unsubPrefs();
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <>
      {children}
      {flashTick > 0 && <ThemeFlash key={flashTick} />}
    </>
  );
}
