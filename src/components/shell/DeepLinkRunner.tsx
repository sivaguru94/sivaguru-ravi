"use client";

import { useEffect } from "react";

/* Fires the deep-linked command into the shell once on mount. The
 * ShellProvider (mounted earlier in the tree, so its listener is already
 * attached) opens the window and runs it. */
export function DeepLinkRunner({ cmd }: { cmd: string }) {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("shell:run", { detail: cmd }));
  }, [cmd]);
  return null;
}
