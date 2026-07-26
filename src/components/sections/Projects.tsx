import { CommandLine } from "../common/CommandLine";
import styles from "./Projects.module.css";

const ROWS = [
  {
    idx: "001",
    name: "annie-ui-platform",
    desc: "Next-gen UI platform · Angular 16, TypeScript, RxJS, Spring Boot",
    date: "2023—NOW",
  },
  {
    idx: "002",
    name: "security-framework",
    desc: "8 integrated tools · OWASP, Semgrep, TruffleHog, Snyk, SonarQube",
    date: "2023—2024",
  },
  {
    idx: "003",
    name: "build-optimization",
    desc: "70% faster builds · 20–30 min → <10 min",
    date: "2023",
  },
  {
    idx: "004",
    name: "failed-page-handler",
    desc: "Document processing with failure recovery · Java, Spring Boot, Angular",
    date: "2023",
  },
  {
    idx: "005",
    name: "angular-modernization",
    desc: "Angular 8 → 14 migration · zero downtime, backward compatible",
    date: "2022—2023",
  },
  {
    idx: "006",
    name: "aws-automation-sdk",
    desc: "Python + Boto3 · 60% manual work reduction",
    date: "2020—2021",
  },
  {
    idx: "007",
    name: "claude-automation-skills",
    desc: "PR review council, epic delivery, worktrees, time-log + org memory system (WIP)",
    date: "ONGOING",
    highlight: true,
  },
] as const;

export function Projects() {
  return (
    <section id="projects" className={styles.section}>
      <CommandLine text="ls -la projects/" className={styles.cmd} />
      <div className={styles.frame}>
        {ROWS.map((row) => (
          <div
            key={row.idx}
            className={
              "highlight" in row && row.highlight
                ? `${styles.row} ${styles.rowHighlight}`
                : styles.row
            }
          >
            <span className={styles.idx}>{row.idx}</span>
            <span className={styles.name}>{row.name}</span>
            <span className={styles.desc}>{row.desc}</span>
            <span className={styles.date}>{row.date}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
