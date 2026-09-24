import { commands } from "./commands";
import {
  GREETING,
  PROMPT,
  type CommandOutput,
  type HostActions,
  type Line,
  type LineTone,
  type LiveLine,
} from "./types";

/*
 * Terminal engine — owns the log, history, and dispatch. Pure TS with a
 * subscribe() interface: React binds via useSyncExternalStore (M5); an
 * Angular service would wrap the same instance. Lines array is replaced
 * immutably on every change so snapshots are referentially stable.
 *
 * Prototype semantics preserved:
 * - every submission echoes `guest@…:~$ <cmd>` (accent), even empty
 * - `clear` wipes the whole log including its own echo
 * - unknown → "command not found: X — try `help`"
 *
 * On top of that: ONE optional "live" line at the tail of the log, which an
 * async command (`resume`) rewrites per frame. It is deliberately outside
 * the lines array — bindings paint it imperatively — so animating it never
 * re-renders the log (plan §4).
 */
export class TerminalEngine {
  private lines: Line[] = [GREETING];
  private history: string[] = [];
  private listeners = new Set<() => void>();

  /* live line: snapshot identity changes only on open/close */
  private live: { tone: LineTone; token: number } | null = null;
  private liveText = "";
  private liveToken = 0;
  private liveListeners = new Set<(text: string) => void>();

  constructor(private host: HostActions) {}

  getLines = (): readonly Line[] => this.lines;
  getHistory = (): readonly string[] => this.history;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private emit(): void {
    this.listeners.forEach((l) => l());
  }

  /* ── live line ──────────────────────────────────────────────── */

  /** null when no live line is open; stable identity while one is */
  getLive = (): { tone: LineTone; token: number } | null => this.live;
  getLiveText = (): string => this.liveText;

  /** per-frame channel — bindings write textContent, no state involved */
  subscribeLiveText = (listener: (text: string) => void): (() => void) => {
    this.liveListeners.add(listener);
    return () => this.liveListeners.delete(listener);
  };

  /** open a live line; any line still open is committed to the log first */
  beginLive(text: string, tone: LineTone = "accent"): LiveLine {
    this.commitLive();
    const token = ++this.liveToken;
    this.live = { tone, token };
    this.liveText = text;
    this.emit();

    const owns = () => this.live?.token === token;
    return {
      update: (t) => {
        if (!owns()) return;
        this.liveText = t;
        this.liveListeners.forEach((l) => l(t));
      },
      end: (t) => {
        if (!owns()) return;
        this.liveText = t;
        this.commitLive();
        this.emit();
      },
    };
  }

  /** move the live line into the log (no-op when none is open) */
  private commitLive(): void {
    if (!this.live) return;
    this.lines = [...this.lines, { text: this.liveText, tone: this.live.tone }];
    this.live = null;
    this.liveText = "";
  }

  /** drop the live line without keeping it (used by `clear`) */
  private dropLive(): void {
    this.live = null;
    this.liveText = "";
  }

  private readonly out: CommandOutput = {
    live: (text) => this.beginLive(text),
    print: (texts, tone) => this.print(texts, tone),
  };

  /** append lines without a prompt echo (used by deep links' host, etc.) */
  print(texts: string[], tone: Line["tone"] = "dim"): void {
    this.lines = [...this.lines, ...texts.map((text) => ({ text, tone }))];
    this.emit();
  }

  /*
   * Appends to `this.lines` in place of a local snapshot: a command may
   * open a live line mid-dispatch (which commits through the same array),
   * and a stale snapshot would swallow it.
   */
  run(raw: string): void {
    const cmd = raw.trim();
    this.lines = [...this.lines, { text: `${PROMPT} ${cmd}`, tone: "accent" }];

    if (cmd) {
      this.history = [...this.history, cmd];
      const key = cmd.toLowerCase().split(/\s+/)[0];
      const command = commands[key];
      if (command?.clears) {
        this.dropLive();
        this.lines = [];
        this.emit();
        return;
      }
      if (command) {
        const args = cmd.split(/\s+/).slice(1);
        const out = command.run(args, {
          history: this.history,
          host: this.host,
          out: this.out,
        });
        this.lines = [
          ...this.lines,
          ...out.map((text): Line => ({ text, tone: "dim" })),
        ];
      } else {
        this.lines = [
          ...this.lines,
          {
            text: "command not found: " + key + " — try `help`",
            tone: "dim",
          },
        ];
      }
    }

    this.emit();
  }
}
