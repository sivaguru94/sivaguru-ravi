import { getMe } from "@/content";
import { CommandLine } from "../common/CommandLine";
import { Rich } from "../common/Rich";
import { Reveal } from "../anim/Reveal";
import styles from "./Work.module.css";

export async function Work() {
  const me = await getMe();
  return (
    <section id="work" className={styles.section}>
      <Reveal className={styles.cmd}>
        <CommandLine text={me.work.command} />
      </Reveal>
      <div className={styles.list}>
        {me.work.jobs.map((job, i) => (
          <Reveal
            key={i}
            delay={[0, 60, 90, 120, 150][i]}
            className={
              job.current ? `${styles.card} ${styles.current}` : styles.card
            }
          >
            <div className={styles.header}>
              <h3 className={styles.company}>
                {job.company}{" "}
                <span className={job.current ? styles.roleCurrent : styles.role}>
                  · {job.role}
                </span>
              </h3>
              <span className={styles.period}>{job.period}</span>
            </div>
            <div className={styles.location}>{job.location}</div>
            <div className={styles.bullets}>
              {job.bullets.map((b, j) => (
                <div key={j} className={styles.bullet}>
                  <span className={styles.caret}>&gt;</span>
                  <span>
                    <Rich text={b} />
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
