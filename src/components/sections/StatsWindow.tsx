import { CountUp } from "../anim/CountUp";
import styles from "./StatsWindow.module.css";

const STATS = [
  { to: 9, suffix: "+", label: "YRS_EXPERIENCE" },
  { to: 50, suffix: "+", label: "ENGINEERS_MENTORED" },
  { to: 70, suffix: "%", label: "FASTER_BUILDS" },
  { to: 8, suffix: "", label: "SECURITY_TOOLS" },
] as const;

/* Framed stats terminal window. Count-ups animate on scroll-in; final
 * geometry is reserved with min-width in ch (zero CLS). */
export function StatsWindow({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
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
        <span className={styles.label}>
          shinigami-rog: ~/stats — $ stats --summary
        </span>
      </div>
      <div className={styles.grid}>
        {STATS.map((s) => (
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
