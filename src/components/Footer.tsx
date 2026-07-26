import { getMe } from "@/content";
import { BladeMark } from "./logos/BladeMark";
import styles from "./Footer.module.css";

/* Server component — static content. The prototype's "view modern variant"
 * link is dropped in production (plan §6). */
export async function Footer() {
  const me = await getMe();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.brand}>
          <BladeMark size={14} fill="var(--dim)" />
          {me.footer.line}
        </span>
        <span className={styles.hints}>
          <span>{me.footer.hint}</span>
        </span>
      </div>
    </footer>
  );
}
