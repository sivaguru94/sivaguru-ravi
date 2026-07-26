import { CommandLine } from "../common/CommandLine";
import styles from "./About.module.css";

export function About() {
  return (
    <section id="about" className={styles.section}>
      <CommandLine text="cat about.md" className={styles.cmd} />
      <div className={styles.grid}>
        <h2 className={styles.heading}>
          Nine years of shipping systems people rely on.
        </h2>
        <div className={styles.copy}>
          <p className={styles.lead}>
            9+ years architecting enterprise-grade applications, specialized in{" "}
            <b className={styles.accent}>Java Spring Boot</b> and{" "}
            <b className={styles.accent}>Angular</b>. Backend microservices,
            security frameworks, healthcare products, next-generation UI
            platforms.
          </p>
          <p className={styles.sub}>
            Recognized with stock options in November 2025 for exceptional
            technical leadership. B.Tech Computer Science, Mahatma Gandhi
            University. Based in Bangalore, India.
          </p>
        </div>
      </div>
    </section>
  );
}
