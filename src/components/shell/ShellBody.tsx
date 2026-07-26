"use client";

import {
  memo,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { TerminalEngine } from "@/core/terminal/engine";
import { PROMPT, type Line } from "@/core/terminal/types";
import {
  candidates,
  completeTab,
  ghost,
  matchesFor,
} from "@/core/terminal/completion";
import { shellFocus } from "./shellHost";
import styles from "./Shell.module.css";

/* Log is memoized and keyed off the engine's immutable lines array — a
 * keystroke re-renders only the prompt row, never the log (plan §5). Lines
 * render as TEXT NODES exclusively; tones map to CSS classes. */
const LogView = memo(function LogView({ lines }: { lines: readonly Line[] }) {
  return (
    <>
      {lines.map((l, i) => (
        <div key={i} className={styles.line} data-tone={l.tone}>
          {l.text}
        </div>
      ))}
    </>
  );
});

export function ShellBody({ engine }: { engine: TerminalEngine }) {
  const lines = useSyncExternalStore(
    engine.subscribe,
    engine.getLines,
    engine.getLines,
  );
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // completion-cycle + history-walk state (never triggers log re-render)
  const [value, setValue] = useState("");
  const matchBase = useRef<string | null>(null);
  const matchIdx = useRef(-1);
  const histIdx = useRef(-1);

  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [lines]);

  useEffect(() => {
    shellFocus.fn = () => inputRef.current?.focus();
    inputRef.current?.focus();
    return () => {
      shellFocus.fn = null;
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      matchBase.current = null;
      histIdx.current = -1;
      engine.run(value);
      setValue("");
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      matchBase.current = null;
      const r = completeTab(value);
      if (r.kind === "completed") {
        setValue(r.value);
      } else if (r.kind === "ambiguous") {
        engine.print([`${PROMPT} ${value.trim()}`], "accent");
        engine.print([r.candidates.join("  ")], "dim");
        setValue(r.value);
      }
      return;
    }

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const dir = e.key === "ArrowUp" ? -1 : 1;

      // cycle completion candidates while a prefix is typed
      const base = matchBase.current !== null ? matchBase.current : value;
      const cand = base ? candidates(base) : null;
      if (cand && cand.prefix) {
        const matches = matchesFor(cand);
        if (matches.length) {
          if (matchBase.current === null) {
            matchBase.current = base;
            matchIdx.current = -1;
          }
          matchIdx.current =
            (matchIdx.current + dir + matches.length) % matches.length;
          setValue(cand.head + matches[matchIdx.current]);
          return;
        }
      }

      // otherwise walk history
      const history = engine.getHistory();
      if (!history.length) return;
      let i = histIdx.current === -1 ? history.length : histIdx.current;
      i += dir;
      if (i < 0) i = 0;
      if (i >= history.length) {
        histIdx.current = -1;
        setValue("");
        return;
      }
      histIdx.current = i;
      setValue(history[i]);
    }
  };

  const ghostText = ghost(value);

  return (
    <div
      ref={bodyRef}
      className={styles.body}
      data-term-body
      onClick={() => inputRef.current?.focus()}
    >
      <LogView lines={lines} />
      <div className={styles.promptRow}>
        <span className={styles.promptLabel}>{PROMPT}</span>
        <span className={styles.inputWrap}>
          <span aria-hidden="true" className={styles.ghost} data-term-ghost>
            <span className={styles.ghostHidden}>{value}</span>
            <span className={styles.ghostRemainder}>{ghostText}</span>
          </span>
          <input
            ref={inputRef}
            className={styles.input}
            data-term-input
            value={value}
            onChange={(e) => {
              matchBase.current = null;
              setValue(e.target.value);
            }}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal command input"
          />
        </span>
      </div>
    </div>
  );
}
