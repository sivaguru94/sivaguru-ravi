"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import styles from "./Shell.module.css";

/*
 * Always-loaded part of the shell is just this provider + the 48px launcher.
 * The window, engine, registry, and completion live in a dynamically
 * imported chunk, fetched on first open (preloaded on launcher hover/focus).
 * Opens via launcher click, the contact button ("shell:open"), or a deep
 * link ("shell:run" with the command as detail).
 */
const ShellWindow = dynamic(() => import("./ShellWindow"), { ssr: false });

const preload = () => {
  import("./ShellWindow");
};

export function ShellProvider() {
  const [open, setOpen] = useState(false);
  const [pendingCmd, setPendingCmd] = useState<string | null>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onRun = (e: Event) => {
      setPendingCmd((e as CustomEvent<string>).detail);
      setOpen(true);
    };
    window.addEventListener("shell:open", onOpen);
    window.addEventListener("shell:run", onRun);
    return () => {
      window.removeEventListener("shell:open", onOpen);
      window.removeEventListener("shell:run", onRun);
    };
  }, []);

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  };

  return (
    <>
      {open && (
        <ShellWindow
          onClose={close}
          initialCmd={pendingCmd}
          onConsumedCmd={() => setPendingCmd(null)}
        />
      )}
      {!open && (
        <button
          ref={launcherRef}
          type="button"
          className={styles.launcher}
          aria-label="Open interactive shell"
          onClick={() => setOpen(true)}
          onMouseEnter={preload}
          onFocus={preload}
        >
          &gt;_
        </button>
      )}
    </>
  );
}
