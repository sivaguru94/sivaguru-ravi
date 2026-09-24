"use client";

/*
 * Hero resume button. With JS it opens the shell and runs `resume`, so the
 * download plays out through the terminal (progress bar, then the save).
 *
 * It stays a real <a download> underneath: no-JS still downloads the file,
 * and middle-click / "save link as" / modified clicks keep working — those
 * are let through untouched rather than hijacked into the shell.
 */

const preloadShell = () => {
  import("./ShellWindow");
};

type Props = {
  label: string;
  aria: string;
  href: string;
  file: string;
  className?: string;
};

export function ResumeLink({ label, aria, href, file, className }: Props) {
  return (
    <a
      className={className}
      href={href}
      download={file}
      aria-label={aria}
      onMouseEnter={preloadShell}
      onFocus={preloadShell}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        window.dispatchEvent(
          new CustomEvent("shell:run", { detail: "resume" }),
        );
      }}
    >
      {label}
    </a>
  );
}
