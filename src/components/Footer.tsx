import { BladeMark } from "./logos/BladeMark";
import styles from "./Footer.module.css";

/* Server component — static content. The prototype's "view modern variant"
 * link is dropped in production (plan §6). */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.brand}>
          <BladeMark size={14} fill="var(--dim)" />© 2026 SIVAGURU_RAVI ·
          shinigami-rog · uptime 9y+ · exit 0
        </span>
        <span className={styles.hints}>
          <span>[T] toggle theme</span>
        </span>
      </div>
    </footer>
  );
}
