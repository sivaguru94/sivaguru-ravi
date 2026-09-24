/*
 * Terminal engine types — pure TS, zero React (future terminal-core pkg).
 * Side effects reach commands ONLY via the injected HostActions; command
 * handlers never touch document/window directly (plan §0/§5).
 */

export type LineTone = "normal" | "dim" | "accent";

export type Line = { text: string; tone: LineTone };

/*
 * A log line the host rewrites per animation frame. Writes go straight to
 * the DOM as textContent — never through React state (plan §4) — so a
 * 60fps progress bar costs the log exactly two renders: open and close.
 */
export type LiveLine = {
  /** per-frame text; a no-op once the line ended or was superseded */
  update(text: string): void;
  /** freeze the final text into the log and close the line */
  end(text: string): void;
};

/** what a command may write beyond its returned lines */
export type CommandOutput = {
  /** open a live line at the tail of the log */
  live(text: string): LiveLine;
  /** append finished lines */
  print(texts: string[], tone?: LineTone): void;
};

/** progress callbacks a transferring host action reports back on */
export type TransferReport = {
  /** animation frame: fraction 0…1 and the bytes it corresponds to */
  onProgress(fraction: number, loaded: number): void;
  /** transfer finished and the browser save was triggered */
  onDone(bytes: number): void;
  /** transfer failed — the host has already fallen back to a direct save */
  onError(): void;
};

export type HostActions = {
  /** smooth-scroll the page to a section id ("top" for home) */
  scrollToSection(id: string): void;
  /** toggle dark/light (single theme owner does the flash) */
  toggleTheme(): void;
  /**
   * Download the resume PDF — fixed constant path, never from user input.
   * Reports transfer progress; every callback fires asynchronously, so a
   * command's own returned lines always land in the log first.
   */
  downloadResume(report: TransferReport): void;
  startMatrix(): void;
  startSnake(): void;
};

export type CommandContext = {
  history: readonly string[];
  host: HostActions;
  out: CommandOutput;
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
