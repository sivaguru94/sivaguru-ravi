"use client";

import { useEffect, useRef } from "react";
import { ScytheMark } from "../logos/ScytheMark";
import type { PendingCmd } from "./ShellProvider";
import { ShellBody } from "./ShellBody";
import { getEngine, host, SECTION_FOR, shellFocus } from "./shellHost";
import { useWindowControls } from "./useWindowControls";
import styles from "./Shell.module.css";

type Props = {
  onClose: () => void;
  pending: PendingCmd | null;
  onConsumedCmd: () => void;
};

export default function ShellWindow({
  onClose,
  pending,
  onConsumedCmd,
}: Props) {
  const winRef = useRef<HTMLDivElement>(null);
  const {
    state,
    style,
    onHeadDown,
    onResizeDown,
    minimize,
    restore,
    toggleMin,
    toggleMax,
  } = useWindowControls(winRef);

  /* Deep link / resume button: run once per token, restoring the window
   * first if it was minimized (the output would be invisible otherwise). */
  const ranToken = useRef(-1);
  useEffect(() => {
    if (!pending || ranToken.current === pending.token) return;
    ranToken.current = pending.token;
    const section = SECTION_FOR[pending.cmd.toLowerCase()];
    if (section) host.scrollToSection(section);
    restore();
    getEngine().run(pending.cmd);
    onConsumedCmd();
  }, [pending, onConsumedCmd, restore]);

  /* refocus prompt on restore / maximize */
  useEffect(() => {
    if (!state.min) shellFocus.fn?.();
  }, [state.min, state.max]);

  return (
    <div ref={winRef} className={styles.window} style={style} data-term-win>
      <div
        className={styles.bar}
        onClick={toggleMin}
        onPointerDown={onHeadDown}
      >
        <span className={styles.lights}>
          <button
            type="button"
            className={styles.lightRed}
            aria-label="Close shell"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          />
          <button
            type="button"
            className={styles.lightYellow}
            aria-label="Minimize shell"
            onClick={(e) => {
              e.stopPropagation();
              minimize();
            }}
          />
          <button
            type="button"
            className={styles.lightGreen}
            aria-label="Maximize shell"
            onClick={(e) => {
              e.stopPropagation();
              toggleMax();
            }}
          />
        </span>
        <ScytheMark size={13} />
        <span className={styles.title}>
          guest@shinigami-rog — interactive shell — try `help`
        </span>
      </div>
      {!state.min && <ShellBody engine={getEngine()} />}
      {!state.min && !state.max && (
        <div
          className={styles.resizeHandle}
          aria-hidden="true"
          onPointerDown={onResizeDown}
        >
          ◢
        </div>
      )}
    </div>
  );
}
