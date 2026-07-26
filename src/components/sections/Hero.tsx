import { getMe } from "@/content";
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

export async function Hero() {
  const me = await getMe();
  return (
    <header className={styles.hero}>
      {/* watermark: prototype hardcodes the dark accent green in both themes */}
      <div className={styles.watermark} aria-hidden="true">
        <BladeMark size={460} fill="#4af07a" />
      </div>

      <div className={`${styles.cmd} ${styles.anim}`} style={delay(0)}>
        <span className={styles.prompt}>$</span>{" "}
        <span data-hero-type>
          <TypedCommand text={me.hero.command} speed={45} mode="load" />
        </span>{" "}
        <span className={styles.cmdCursor} aria-hidden="true">
          ▊
        </span>
      </div>

      <h1 className={`${styles.title} ${styles.anim}`} style={delay(1)}>
        {me.identity.firstName}
        <br />
        {me.identity.lastName}
        <span className={styles.underscore}>_</span>
      </h1>

      <div className={`${styles.tagline} ${styles.anim}`} style={delay(2)}>
        &gt; {me.hero.tagline}
        <br />
        &gt; a.k.a. <span className={styles.alias}>{me.identity.alias}</span> ·{" "}
        {me.identity.domain}
      </div>

      <p className={`${styles.comment} ${styles.anim}`} style={delay(3)}>
        {me.hero.comments.map((line, i) => (
          <span key={i}>
            {i > 0 && <br />}
            {line}
          </span>
        ))}
      </p>

      <div className={`${styles.actions} ${styles.anim}`} style={delay(4)}>
        {me.hero.actions.map((a) => (
          <a
            key={a.href}
            href={a.href}
            className={a.primary ? styles.primary : styles.secondary}
          >
            {a.label}
          </a>
        ))}
      </div>

      <StatsWindow className={styles.anim} style={delay(5)} />
    </header>
  );
}
