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
        <div className={styles.cmdRow}>
          <span className={cmdStyles.prompt}>$</span>&nbsp;
          <span data-cmd>./ai-leadership --status</span>
          <span className={cmdStyles.cursor} aria-hidden="true">
            ▊
          </span>
          <span className={styles.badge}>AI-NATIVE</span>
        </div>

        <h2 className={styles.heading}>AI-ASSISTED ENGINEERING LEADERSHIP</h2>
        <p className={styles.intro}>
          # Driving Claude &amp; AI automation adoption across the org —
          <br /># turning individual workflows into reusable engineering
          leverage.
        </p>

        <div className={styles.grid}>
          {CARDS.map((c) => (
            <div key={c.label} className={styles.card}>
              <div className={styles.cardLabel}>{c.label}</div>
              <p className={styles.cardCopy}>{c.copy}</p>
            </div>
          ))}
          <div className={styles.highlight}>
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
          </div>
        </div>
      </div>
    </section>
  );
}
