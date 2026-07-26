import styles from "./CommandLine.module.css";

/*
 * Section command line: `$ <cmd>▊`. Server component — renders the full text
 * (SEO/no-JS). M3 wraps the text in the TypedCommand client leaf, which
 * reserves this exact line box and types over it (zero CLS).
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
      <span className={styles.prompt}>$</span> <span data-cmd>{text}</span>
      <span className={styles.cursor} aria-hidden="true">
        ▊
      </span>
    </div>
  );
}
