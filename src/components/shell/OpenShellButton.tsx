"use client";

import styles from "./OpenShellButton.module.css";

/*
 * Contact-section shell opener. Decoupled from the shell via a window event
 * so this stays a tiny always-loaded client leaf while the shell itself is
 * dynamically imported (M5): ShellProvider listens for "shell:open".
 */
export function OpenShellButton() {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => window.dispatchEvent(new CustomEvent("shell:open"))}
    >
      <span className={styles.caret}>&gt;_</span> open interactive shell
    </button>
  );
}
