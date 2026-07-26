import { CommandLine } from "../common/CommandLine";
import { Reveal } from "../anim/Reveal";
import { AsciiBar } from "../anim/AsciiBar";
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

export function Skills() {
  return (
    <section id="skills" className={styles.section}>
      <Reveal className={styles.cmd}>
        <CommandLine text="ls skills/ --proficiency" />
      </Reveal>
      <div className={styles.grid}>
        {COLUMNS.map((col, i) => (
          <Reveal key={col.header} delay={[0, 60, 90, 120][i]}>
            <div className={styles.colHeader}>{col.header}</div>
            <div className={styles.rows}>
              {col.rows.map((row) => (
                <div key={row.name} className={styles.row}>
                  <span>{row.name}</span>
                  <AsciiBar pct={row.pct} />
                </div>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={150} className={styles.footer}>
        <span className={styles.footerAccent}>/ai-assisted-dev</span> →
        Claude/Cursor-based workflows · custom Claude skills · org-wide
        automation tooling
      </Reveal>
    </section>
  );
}
