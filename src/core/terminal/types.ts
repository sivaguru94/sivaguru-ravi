/*
 * Terminal engine types — pure TS, zero React (future terminal-core pkg).
 * Side effects reach commands ONLY via the injected HostActions; command
 * handlers never touch document/window directly (plan §0/§5).
 */

export type LineTone = "normal" | "dim" | "accent";

export type Line = { text: string; tone: LineTone };

export type HostActions = {
  /** smooth-scroll the page to a section id ("top" for home) */
  scrollToSection(id: string): void;
  /** toggle dark/light (single theme owner does the flash) */
  toggleTheme(): void;
  /** download the resume PDF — fixed constant path, never from user input */
  downloadResume(): void;
  startMatrix(): void;
  startSnake(): void;
};

export type CommandContext = {
  history: readonly string[];
  host: HostActions;
};

export type Command = {
  run(args: string[], ctx: CommandContext): string[];
  man: string;
  /** hidden from `help` ONLY — completion and `man` still see it */
  hidden?: boolean;
  /** clears the log instead of appending output (`clear`) */
  clears?: boolean;
};

export const PROMPT = "guest@shinigami-rog:~$";

export const GREETING: Line = {
  text: "sivaguru-shell v1.0 — type `help` to see available commands · tab to autocomplete",
  tone: "dim",
};
