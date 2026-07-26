import { getMe } from "@/content";
import { CommandLine } from "../common/CommandLine";
import { Reveal } from "../anim/Reveal";
import styles from "./Projects.module.css";

export async function Projects() {
  const me = await getMe();
  return (
    <section id="projects" className={styles.section}>
      <Reveal className={styles.cmd}>
        <CommandLine text={me.projects.command} />
      </Reveal>
      <div className={styles.frame}>
        {me.projects.rows.map((row) => (
          <Reveal
            key={row.idx}
            className={
              row.highlight
                ? `${styles.row} ${styles.rowHighlight}`
                : styles.row
            }
          >
            <span className={styles.idx}>{row.idx}</span>
            <span className={styles.name}>{row.name}</span>
            <span className={styles.desc}>{row.desc}</span>
            <span className={styles.date}>{row.date}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
