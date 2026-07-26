import { Reveal } from "../anim/Reveal";
import { TypedCommand } from "../anim/TypedCommand";
import styles from "./AiLeadership.module.css";
import cmdStyles from "../common/CommandLine.module.css";

const CARDS = [
  {
    label: "[skill] pr-review-council",
    copy: "Multi-perspective automated review on every pull request, org-wide.",
  },
  {
    label: "[skill] epic-delivery",
    copy: "Takes an epic from breakdown through delivery with AI in the loop.",
  },
  {
    label: "[skill] worktree",
    copy: "Parallel JIRA deliveries without branch collisions.",
  },
  {
    label: "[skill] time-log",
    copy: "Automates time-log capture end to end. Zero manual overhead.",
  },
] as const;

export function AiLeadership() {
  return (
    <section id="ai" className={styles.section}>
      <div className={styles.inner}>
        {/* command line inlined: the AI-NATIVE badge sits on the same row */}
        <Reveal className={styles.cmdRow}>
          <span className={cmdStyles.prompt}>$</span>&nbsp;
          <span data-cmd>
            <TypedCommand text="./ai-leadership --status" speed={32} mode="io" />
          </span>
          <span className={cmdStyles.cursor} aria-hidden="true">
            ▊
          </span>
          <span className={styles.badge}>AI-NATIVE</span>
        </Reveal>

        <Reveal as="h2" className={styles.heading}>
          AI-ASSISTED ENGINEERING LEADERSHIP
        </Reveal>
        <Reveal as="p" className={styles.intro} delay={60}>
          # Driving Claude &amp; AI automation adoption across the org —
          <br /># turning individual workflows into reusable engineering
          leverage.
        </Reveal>

        <div className={styles.grid}>
          {CARDS.map((c, i) => (
            <Reveal key={c.label} delay={i * 60} className={styles.card}>
              <div className={styles.cardLabel}>{c.label}</div>
              <p className={styles.cardCopy}>{c.copy}</p>
            </Reveal>
          ))}
          <Reveal delay={240} className={styles.highlight}>
            <div className={styles.status}>
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.statusText}>
                PROCESS RUNNING · IN PROGRESS
              </span>
            </div>
            <h3 className={styles.highlightTitle}>
              org-level project-wide memory system for Claude
            </h3>
            <p className={styles.highlightCopy}>
              A shared memory layer so AI carries context across projects and
              teams.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
