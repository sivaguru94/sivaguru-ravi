"use client";

import { useEffect, useRef } from "react";
import { ScytheMark } from "../logos/ScytheMark";
import { ShellBody } from "./ShellBody";
import { getEngine, host, SECTION_FOR, shellFocus } from "./shellHost";
import { useWindowControls } from "./useWindowControls";
import styles from "./Shell.module.css";

type Props = {
  onClose: () => void;
  initialCmd: string | null;
  onConsumedCmd: () => void;
};

export default function ShellWindow({
  onClose,
  initialCmd,
  onConsumedCmd,
}: Props) {
  const winRef = useRef<HTMLDivElement>(null);
  const { state, style, onHeadDown, onResizeDown, minimize, toggleMin, toggleMax } =
    useWindowControls(winRef);

  /* deep-link command: scroll to its section (if any) and run it once */
  const consumed = useRef(false);
  useEffect(() => {
    if (!initialCmd || consumed.current) return;
    consumed.current = true;
    const section = SECTION_FOR[initialCmd.toLowerCase()];
    if (section) host.scrollToSection(section);
    getEngine().run(initialCmd);
    onConsumedCmd();
  }, [initialCmd, onConsumedCmd]);

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
