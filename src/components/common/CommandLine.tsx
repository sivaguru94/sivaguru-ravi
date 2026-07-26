import { TypedCommand } from "../anim/TypedCommand";
import styles from "./CommandLine.module.css";

/*
 * Section command line: `$ <cmd>▊`. Server component — SSR carries the full
 * text; the TypedCommand leaf reserves the exact line box and types over it
 * on scroll-in (32ms/char, zero CLS).
 */
export function CommandLine({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div className={className ? `${styles.line} ${className}` : styles.line}>
      <span className={styles.prompt}>$</span>{" "}
      <span data-cmd>
        <TypedCommand text={text} speed={32} mode="io" />
      </span>
      <span className={styles.cursor} aria-hidden="true">
        ▊
      </span>
    </div>
  );
}
