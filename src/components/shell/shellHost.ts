"use client";

import { TerminalEngine } from "@/core/terminal/engine";
import type { HostActions, TransferReport } from "@/core/terminal/types";
import type { CancelFn } from "@/core/tween";
import { isMotionReduced } from "@/core/motion";
import { themeStore } from "@/core/theme";

/*
 * Host actions + engine singleton for the browser shell. Lives inside the
 * dynamically-imported shell chunk (never in first-load JS). The download
 * path is a FIXED constant — command arguments never reach an href.
 */

const RESUME_PATH = "/Sivaguru_Ravi_Resume.pdf";
const RESUME_FILE = "Sivaguru_Ravi_Resume.pdf";

/* shortest time the bar is on screen — an 8 KB PDF lands in one chunk, so
 * without a floor the transfer would be over before the first frame */
const MIN_MS = 900;

/* The save itself stays a plain anchor on the constant path (blob: saves
 * misbehave in iOS Safari). The streamed fetch above it is what makes the
 * bar real; by the time this runs the file is in the HTTP cache. */
function saveResume(): void {
  const a = document.createElement("a");
  a.href = RESUME_PATH;
  a.download = RESUME_FILE;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** streams the PDF, reporting bytes as they arrive; resolves with the size */
async function fetchResume(onChunk: (loaded: number, total: number) => void) {
  const res = await fetch(RESUME_PATH);
  if (!res.ok || !res.body) throw new Error(`resume: HTTP ${res.status}`);
  const total = Number(res.headers.get("content-length")) || 0;
  const reader = res.body.getReader();
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    loaded += value.byteLength;
    onChunk(loaded, total);
  }
  return loaded;
}

/* one transfer at a time — a second `resume` cancels the first bar */
let cancelTransfer: CancelFn | null = null;

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
  /*
   * Measures the real transfer and paces the bar over it: the displayed
   * fraction is a linear MIN_MS ramp GATED by the bytes actually received —
   * so it tracks the network when the network is the slow part, and never
   * runs backwards. Linear, not the site's easeOutExpo: an eased bar spends
   * its whole second half near 99% and reads as a stall. Reduced motion
   * skips the ramp; a failure falls back to the plain save.
   */
  downloadResume(report: TransferReport) {
    cancelTransfer?.();

    let loaded = 0;
    let total = 0;
    let complete = false;
    let failed = false;

    const transfer = fetchResume((l, t) => {
      loaded = l;
      total = t;
    })
      .then((size) => {
        loaded = size;
        if (!total) total = size;
        complete = true;
      })
      .catch(() => {
        failed = true;
      });

    if (isMotionReduced()) {
      transfer.then(() => {
        cancelTransfer = null;
        saveResume();
        if (failed) report.onError();
        else report.onDone(loaded);
      });
      return;
    }

    const start = performance.now();
    let raf = 0;
    let cancelled = false;

    const frame = (now: number) => {
      if (cancelled) return;
      if (failed) {
        cancelTransfer = null;
        saveResume();
        report.onError();
        return;
      }
      const paced = Math.min(1, (now - start) / MIN_MS);
      const received = complete ? 1 : total ? loaded / total : 1;
      const shown = Math.min(paced, received);

      if (paced >= 1 && complete) {
        cancelTransfer = null;
        saveResume();
        report.onDone(loaded);
        return;
      }
      report.onProgress(shown, Math.round(shown * (total || loaded)));
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    cancelTransfer = () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      cancelTransfer = null;
    };
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
