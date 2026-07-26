import { getMe } from "@/content";
import { Reveal } from "../anim/Reveal";
import { TypedCommand } from "../anim/TypedCommand";
import styles from "./AiLeadership.module.css";
import cmdStyles from "../common/CommandLine.module.css";

export async function AiLeadership() {
  const me = await getMe();
  return (
    <section id="ai" className={styles.section}>
      <div className={styles.inner}>
        {/* command line inlined: the AI-NATIVE badge sits on the same row */}
        <Reveal className={styles.cmdRow}>
          <span className={cmdStyles.prompt}>$</span>&nbsp;
          <span data-cmd>
            <TypedCommand text={me.ai.command} speed={32} mode="io" />
          </span>
          <span className={cmdStyles.cursor} aria-hidden="true">
            ▊
          </span>
          <span className={styles.badge}>{me.ai.badge}</span>
        </Reveal>

        <Reveal as="h2" className={styles.heading}>
          {me.ai.heading}
        </Reveal>
        <Reveal as="p" className={styles.intro} delay={60}>
          {me.ai.intro.map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </Reveal>

        <div className={styles.grid}>
          {me.ai.cards.map((c, i) => (
            <Reveal key={c.label} delay={i * 60} className={styles.card}>
              <div className={styles.cardLabel}>{c.label}</div>
              <p className={styles.cardCopy}>{c.copy}</p>
            </Reveal>
          ))}
          <Reveal delay={240} className={styles.highlight}>
            <div className={styles.status}>
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.statusText}>{me.ai.highlight.status}</span>
            </div>
            <h3 className={styles.highlightTitle}>{me.ai.highlight.title}</h3>
            <p className={styles.highlightCopy}>{me.ai.highlight.copy}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
