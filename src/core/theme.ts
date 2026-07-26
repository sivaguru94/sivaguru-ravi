/*
 * Theme store — the single owner of theme state (plan §3).
 * Pure TS, framework-agnostic: React binds via useSyncExternalStore
 * (src/hooks/useTheme.ts); an Angular binding would wrap it in a service.
 *
 * DOM application (the data-theme attribute) is done by the subscriber in
 * ThemeProvider, not here, so the store stays environment-free.
 */

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "theme";

/* localStorage throws on read AND write in blocked-storage contexts
 * (Safari private mode, storage-disabled embeds) — always go through this. */
export const safeStorage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* non-persistent session — theme still works in-memory */
    }
  },
};

export function resolveTheme(value: string | null | undefined): Theme {
  return value === "light" ? "light" : "dark";
}

type Listener = () => void;

class ThemeStore {
  private theme: Theme = "dark";
  private listeners = new Set<Listener>();

  /* Adopt the pre-paint value stamped on <html> by the layout inline script.
     Does not notify or persist. */
  init(initial: Theme): void {
    this.theme = initial;
  }

  get = (): Theme => this.theme;

  set(next: Theme): void {
    if (next === this.theme) return;
    this.theme = next;
    safeStorage.set(THEME_STORAGE_KEY, next);
    this.listeners.forEach((l) => l());
  }

  toggle = (): Theme => {
    const next: Theme = this.theme === "dark" ? "light" : "dark";
    this.set(next);
    return next;
  };

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
}

export const themeStore = new ThemeStore();

/* ── user prefs: motion + scanlines (README: both toggleable) ──────────────
 * Persisted like the theme; applied to <html data-motion|data-scanlines> by
 * ThemeProvider (and pre-paint by the layout inline script). The shell's
 * `motion`/`scanlines` commands (M4) call these setters. */

export type OnOff = "on" | "off";

export const MOTION_STORAGE_KEY = "motion";
export const SCANLINES_STORAGE_KEY = "scanlines";

export function resolveOnOff(value: string | null | undefined): OnOff {
  return value === "off" ? "off" : "on";
}

class PrefsStore {
  private motion: OnOff = "on";
  private scanlines: OnOff = "on";
  private listeners = new Set<Listener>();

  init(motion: OnOff, scanlines: OnOff): void {
    this.motion = motion;
    this.scanlines = scanlines;
  }

  getMotion = (): OnOff => this.motion;
  getScanlines = (): OnOff => this.scanlines;

  setMotion(v: OnOff): void {
    if (v === this.motion) return;
    this.motion = v;
    safeStorage.set(MOTION_STORAGE_KEY, v);
    this.listeners.forEach((l) => l());
  }

  setScanlines(v: OnOff): void {
    if (v === this.scanlines) return;
    this.scanlines = v;
    safeStorage.set(SCANLINES_STORAGE_KEY, v);
    this.listeners.forEach((l) => l());
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
}

export const prefsStore = new PrefsStore();
