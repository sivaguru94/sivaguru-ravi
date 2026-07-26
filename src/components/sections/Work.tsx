import { CommandLine } from "../common/CommandLine";
import styles from "./Work.module.css";

type Job = {
  company: string;
  role: string;
  period: string;
  current?: boolean;
  bullets: React.ReactNode[];
};

const JOBS: Job[] = [
  {
    company: "Infrrd Inc",
    role: "TECHNICAL_SPECIALIST",
    period: "[2023-08 → PRESENT]",
    current: true,
    bullets: [
      <>
        Awarded <b>stock options (Nov 2025)</b> for technical leadership
      </>,
      <>
        Built OSS security framework integrating <b>8 security tools</b>
      </>,
      <>
        Led <b>Annie UI</b> platform on Angular 16
      </>,
      <>
        Cut build time <b>70%</b> (20–30 min → &lt;10 min) · mentored junior
        devs
      </>,
    ],
  },
  {
    company: "Philips India",
    role: "SOFTWARE_TECHNOLOGIST_1",
    period: "[2021-12 → 2023-07]",
    bullets: [
      <>Healthcare product development</>,
      <>Role-based API security implementation</>,
      <>Azure Pipelines automation · test suite development</>,
    ],
  },
  {
    company: "Infrrd Inc",
    role: "SENIOR_SOFTWARE_ENGINEER",
    period: "[2020-05 → 2021-11]",
    bullets: [
      <>
        Python SDK for AWS automation — <b>60% efficiency gain</b>
      </>,
      <>Third-party API integration · image processing SDK</>,
      <>Document processing improvements</>,
    ],
  },
  {
    company: "Mindtree Pvt Ltd",
    role: "SENIOR_SOFTWARE_ENGINEER",
    period: "[2017-01 → 2019-10]",
    bullets: [
      <>
        Built <b>3D Canvas UI for Bose VB1</b> (Angular 8, Electron)
      </>,
      <>
        Mentored <b>50+ engineers</b> · technical architecture leadership
      </>,
      <>BLE Mesh development for indoor localization</>,
    ],
  },
];

export function Work() {
  return (
    <section id="work" className={styles.section}>
      <CommandLine text="cat experience.log | sort -r" className={styles.cmd} />
      <div className={styles.list}>
        {JOBS.map((job, i) => (
          <div
            key={i}
            className={job.current ? `${styles.card} ${styles.current}` : styles.card}
          >
            <div className={styles.header}>
              <h3 className={styles.company}>
                {job.company}{" "}
                <span
                  className={job.current ? styles.roleCurrent : styles.role}
                >
                  · {job.role}
                </span>
              </h3>
              <span className={styles.period}>{job.period}</span>
            </div>
            <div className={styles.location}>Bangalore, India</div>
            <div className={styles.bullets}>
              {job.bullets.map((b, j) => (
                <div key={j} className={styles.bullet}>
                  <span className={styles.caret}>&gt;</span>
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
