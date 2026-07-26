import { getMe } from "@/content";
import { CommandLine } from "../common/CommandLine";
import { Rich } from "../common/Rich";
import { Reveal } from "../anim/Reveal";
import styles from "./About.module.css";

export async function About() {
  const me = await getMe();
  return (
    <section id="about" className={styles.section}>
      <Reveal className={styles.cmd}>
        <CommandLine text={me.about.command} />
      </Reveal>
      <div className={styles.grid}>
        <Reveal as="h2" className={styles.heading}>
          {me.about.heading}
        </Reveal>
        <div className={styles.copy}>
          <Reveal as="p" className={styles.lead}>
            <Rich text={me.about.lead} boldClassName={styles.accent} />
          </Reveal>
          <Reveal as="p" className={styles.sub} delay={80}>
            {me.about.sub}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
