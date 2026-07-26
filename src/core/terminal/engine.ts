import { commands } from "./commands";
import {
  GREETING,
  PROMPT,
  type HostActions,
  type Line,
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
 */
export class TerminalEngine {
  private lines: Line[] = [GREETING];
  private history: string[] = [];
  private listeners = new Set<() => void>();

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

  /** append lines without a prompt echo (used by deep links' host, etc.) */
  print(texts: string[], tone: Line["tone"] = "dim"): void {
    this.lines = [...this.lines, ...texts.map((text) => ({ text, tone }))];
    this.emit();
  }

  run(raw: string): void {
    const cmd = raw.trim();
    const next: Line[] = [
      ...this.lines,
      { text: `${PROMPT} ${cmd}`, tone: "accent" },
    ];

    if (cmd) {
      this.history = [...this.history, cmd];
      const key = cmd.toLowerCase().split(/\s+/)[0];
      const command = commands[key];
      if (command?.clears) {
        this.lines = [];
        this.emit();
        return;
      }
      if (command) {
        const args = cmd.split(/\s+/).slice(1);
        const out = command.run(args, {
          history: this.history,
          host: this.host,
        });
        out.forEach((text) => next.push({ text, tone: "dim" }));
      } else {
        next.push({
          text: "command not found: " + key + " — try `help`",
          tone: "dim",
        });
      }
    }

    this.lines = next;
    this.emit();
  }
}
