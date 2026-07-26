import { CommandLine } from "../common/CommandLine";
import styles from "./Skills.module.css";

const COLUMNS = [
  {
    header: "/backend",
    rows: [
      { name: "Java & Spring Boot", pct: 95 },
      { name: "RESTful APIs", pct: 95 },
      { name: "Microservices", pct: 90 },
      { name: "Node.js & Python", pct: 85 },
    ],
  },
  {
    header: "/frontend",
    rows: [
      { name: "Angular 2–16", pct: 95 },
      { name: "RxJS", pct: 90 },
      { name: "React & TypeScript", pct: 88 },
      { name: "UI/UX Optimization", pct: 85 },
    ],
  },
  {
    header: "/cloud-devops",
    rows: [
      { name: "Build Optimization", pct: 92 },
      { name: "Azure DevOps", pct: 90 },
      { name: "Docker & CI/CD", pct: 88 },
      { name: "AWS", pct: 85 },
    ],
  },
  {
    header: "/security",
    rows: [
      { name: "OSS Vulnerability", pct: 90 },
      { name: "Security Remediation", pct: 90 },
      { name: "License Compliance", pct: 88 },
      { name: "OWASP", pct: 85 },
    ],
  },
] as const;

const CELLS = 20;

/* Static final-state bar; M3 swaps in the <AsciiBar> client leaf. Identical
 * glyph (█) for filled and rest — never mix with ░/▌, fallback fonts render
 * them at different heights (design README §Skills). */
function Bar({ pct }: { pct: number }) {
  const filled = Math.round(pct / 5);
  return (
    <span className={styles.bar} data-ascii data-pct={pct}>
      <span className={styles.barFill}>{"█".repeat(filled)}</span>
      <span className={styles.barRest}>{"█".repeat(CELLS - filled)}</span>
    </span>
  );
}

export function Skills() {
  return (
    <section id="skills" className={styles.section}>
      <CommandLine text="ls skills/ --proficiency" className={styles.cmd} />
      <div className={styles.grid}>
        {COLUMNS.map((col) => (
          <div key={col.header}>
            <div className={styles.colHeader}>{col.header}</div>
            <div className={styles.rows}>
              {col.rows.map((row) => (
                <div key={row.name} className={styles.row}>
                  <span>{row.name}</span>
                  <Bar pct={row.pct} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.footer}>
        <span className={styles.footerAccent}>/ai-assisted-dev</span> →
        Claude/Cursor-based workflows · custom Claude skills · org-wide
        automation tooling
      </div>
    </section>
  );
}
