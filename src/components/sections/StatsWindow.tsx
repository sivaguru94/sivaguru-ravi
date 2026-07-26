import styles from "./StatsWindow.module.css";

const STATS = [
  { to: 9, suffix: "+", label: "YRS_EXPERIENCE" },
  { to: 50, suffix: "+", label: "ENGINEERS_MENTORED" },
  { to: 70, suffix: "%", label: "FASTER_BUILDS" },
  { to: 8, suffix: "", label: "SECURITY_TOOLS" },
] as const;

/* Framed stats terminal window. M3 swaps the numeral text for <CountUp>
 * leaves (final geometry already reserved by min-width in ch). */
export function StatsWindow() {
  return (
    <div className={styles.window}>
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
            <div className={styles.numeral}>
              <span
                data-count
                style={{ minWidth: `${String(s.to).length + s.suffix.length}ch` }}
              >
                {s.to}
                {s.suffix}
              </span>
            </div>
            <div className={styles.caption}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
