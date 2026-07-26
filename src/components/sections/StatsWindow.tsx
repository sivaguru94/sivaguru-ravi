import { getMe } from "@/content";
import { CountUp } from "../anim/CountUp";
import styles from "./StatsWindow.module.css";

/* Framed stats terminal window. Count-ups animate on scroll-in; final
 * geometry is reserved with min-width in ch (zero CLS). */
export async function StatsWindow({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const me = await getMe();
  return (
    <div
      className={className ? `${styles.window} ${className}` : styles.window}
      style={style}
    >
      <div className={styles.bar}>
        <span className={styles.lights}>
          <span className={styles.red} />
          <span className={styles.yellow} />
          <span className={styles.green} />
        </span>
        <span className={styles.label}>{me.hero.statsTitle}</span>
      </div>
      <div className={styles.grid}>
        {me.hero.stats.map((s) => (
          <div key={s.label} className={styles.cell}>
            <div
              className={styles.numeral}
              style={{ minWidth: `${String(s.to).length + s.suffix.length}ch` }}
            >
              <CountUp to={s.to} suffix={s.suffix} />
            </div>
            <div className={styles.caption}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
