"use client";

import { useEffect, useState } from "react";
import { themeStore, resolveTheme } from "@/core/theme";
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

    const unsubscribe = themeStore.subscribe(() => {
      document.documentElement.dataset.theme = themeStore.get();
      setFlashTick((t) => t + 1);
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
