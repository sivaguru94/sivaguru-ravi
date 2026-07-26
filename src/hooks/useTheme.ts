"use client";

import { useSyncExternalStore } from "react";
import { themeStore, type Theme } from "@/core/theme";

export function useTheme(): { theme: Theme; toggle: () => Theme } {
  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.get,
    () => "dark" as const,
  );
  return { theme, toggle: themeStore.toggle };
}
