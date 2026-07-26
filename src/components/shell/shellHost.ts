"use client";

import { TerminalEngine } from "@/core/terminal/engine";
import type { HostActions } from "@/core/terminal/types";
import { themeStore } from "@/core/theme";

/*
 * Host actions + engine singleton for the browser shell. Lives inside the
 * dynamically-imported shell chunk (never in first-load JS). The download
 * path is a FIXED constant — command arguments never reach an href.
 */

const RESUME_PATH = "/Sivaguru_Ravi_Resume.pdf";

/* set by ShellBody on mount; games refocus the prompt on exit */
export const shellFocus: { fn: (() => void) | null } = { fn: null };

const host: HostActions = {
  scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 64,
      behavior: "smooth",
    });
  },
  toggleTheme() {
    themeStore.toggle();
  },
  downloadResume() {
    const a = document.createElement("a");
    a.href = RESUME_PATH;
    a.download = "Sivaguru_Ravi_Resume.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  },
  startMatrix() {
    import("@/core/games/matrix").then((m) =>
      m.startMatrix(() => shellFocus.fn?.()),
    );
  },
  startSnake() {
    import("@/core/games/snake").then((m) =>
      m.startSnake(() => shellFocus.fn?.()),
    );
  },
};

let engine: TerminalEngine | null = null;

export function getEngine(): TerminalEngine {
  if (!engine) engine = new TerminalEngine(host);
  return engine;
}

/** sections some deep-linked commands scroll to before running */
export const SECTION_FOR: Record<string, string> = {
  whoami: "about",
  skills: "skills",
  experience: "work",
  projects: "projects",
  ai: "ai",
  contact: "contact",
};

export { host };
