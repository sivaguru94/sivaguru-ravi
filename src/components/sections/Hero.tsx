import { BladeMark } from "../logos/BladeMark";
import { TypedCommand } from "../anim/TypedCommand";
import { StatsWindow } from "./StatsWindow";
import styles from "./Hero.module.css";

/*
 * Hero entrance is pure CSS (keyframes + per-child delay in server HTML):
 * it starts at first paint and never waits for hydration — the H1 is the
 * LCP element (plan §4). Stagger: 850ms, 130ms apart, 300ms base delay.
 */
const delay = (i: number) => ({ animationDelay: `${300 + i * 130}ms` });

export function Hero() {
  return (
    <header className={styles.hero}>
      {/* watermark: prototype hardcodes the dark accent green in both themes */}
      <div className={styles.watermark} aria-hidden="true">
        <BladeMark size={460} fill="#4af07a" />
      </div>

      <div className={`${styles.cmd} ${styles.anim}`} style={delay(0)}>
        <span className={styles.prompt}>$</span>{" "}
        <span data-hero-type>
          <TypedCommand text="whoami --verbose" speed={45} mode="load" />
        </span>
        <span className={styles.cmdCursor} aria-hidden="true">
          ▊
        </span>
      </div>

      <h1 className={`${styles.title} ${styles.anim}`} style={delay(1)}>
        Sivaguru
        <br />
        Ravi<span className={styles.underscore}>_</span>
      </h1>

      <div className={`${styles.tagline} ${styles.anim}`} style={delay(2)}>
        &gt; SENIOR SDE · 9+ YRS · JAVA SPRING BOOT · ANGULAR
        <br />
        &gt; a.k.a. <span className={styles.alias}>shinigami-rog</span> ·
        shinigami-rog.cc
      </div>

      <p className={`${styles.comment} ${styles.anim}`} style={delay(3)}>
        # Architecting enterprise-grade applications for 9+ years.
        <br /># Recognized with stock options (Nov 2025) for technical
        leadership.
        <br /># Currently building the org&apos;s AI-assisted engineering
        playbook.
      </p>

      <div className={`${styles.actions} ${styles.anim}`} style={delay(4)}>
        <a href="#contact" className={styles.primary}>
          ./contact --now
        </a>
        <a href="#work" className={styles.secondary}>
          cat experience.log
        </a>
      </div>

      <StatsWindow className={styles.anim} style={delay(5)} />
    </header>
  );
}
