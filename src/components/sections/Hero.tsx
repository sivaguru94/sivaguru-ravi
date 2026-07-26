import { BladeMark } from "../logos/BladeMark";
import { StatsWindow } from "./StatsWindow";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <header className={styles.hero}>
      {/* watermark: prototype hardcodes the dark accent green in both themes */}
      <div className={styles.watermark} aria-hidden="true">
        <BladeMark size={460} fill="#4af07a" />
      </div>

      <div className={styles.cmd}>
        <span className={styles.prompt}>$</span>{" "}
        <span data-hero-type>whoami --verbose</span>
        <span className={styles.cmdCursor} aria-hidden="true">
          ▊
        </span>
      </div>

      <h1 className={styles.title}>
        Sivaguru
        <br />
        Ravi<span className={styles.underscore}>_</span>
      </h1>

      <div className={styles.tagline}>
        &gt; SENIOR SDE · 9+ YRS · JAVA SPRING BOOT · ANGULAR
        <br />
        &gt; a.k.a. <span className={styles.alias}>shinigami-rog</span> ·
        shinigami-rog.cc
      </div>

      <p className={styles.comment}>
        # Architecting enterprise-grade applications for 9+ years.
        <br /># Recognized with stock options (Nov 2025) for technical
        leadership.
        <br /># Currently building the org&apos;s AI-assisted engineering
        playbook.
      </p>

      <div className={styles.actions}>
        <a href="#contact" className={styles.primary}>
          ./contact --now
        </a>
        <a href="#work" className={styles.secondary}>
          cat experience.log
        </a>
      </div>

      <StatsWindow />
    </header>
  );
}
