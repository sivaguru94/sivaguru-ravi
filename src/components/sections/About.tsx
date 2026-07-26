import { CommandLine } from "../common/CommandLine";
import { Reveal } from "../anim/Reveal";
import styles from "./About.module.css";

export function About() {
  return (
    <section id="about" className={styles.section}>
      <Reveal className={styles.cmd}>
        <CommandLine text="cat about.md" />
      </Reveal>
      <div className={styles.grid}>
        <Reveal as="h2" className={styles.heading}>
          Nine years of shipping systems people rely on.
        </Reveal>
        <div className={styles.copy}>
          <Reveal as="p" className={styles.lead}>
            9+ years architecting enterprise-grade applications, specialized in{" "}
            <b className={styles.accent}>Java Spring Boot</b> and{" "}
            <b className={styles.accent}>Angular</b>. Backend microservices,
            security frameworks, healthcare products, next-generation UI
            platforms.
          </Reveal>
          <Reveal as="p" className={styles.sub} delay={80}>
            Recognized with stock options in November 2025 for exceptional
            technical leadership. B.Tech Computer Science, Mahatma Gandhi
            University. Based in Bangalore, India.
          </Reveal>
        </div>
      </div>
    </section>
  );
}
