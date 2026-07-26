import { getMe } from "@/content";
import { CommandLine } from "../common/CommandLine";
import { Reveal } from "../anim/Reveal";
import { AsciiBar } from "../anim/AsciiBar";
import styles from "./Skills.module.css";

export async function Skills() {
  const me = await getMe();
  return (
    <section id="skills" className={styles.section}>
      <Reveal className={styles.cmd}>
        <CommandLine text={me.skills.command} />
      </Reveal>
      <div className={styles.grid}>
        {me.skills.columns.map((col, i) => (
          <Reveal key={col.header} delay={[0, 60, 90, 120][i]}>
            <div className={styles.colHeader}>{col.header}</div>
            <div className={styles.rows}>
              {col.rows.map((row) => (
                <div key={row.name} className={styles.row}>
                  <span>{row.name}</span>
                  <AsciiBar pct={row.pct} />
                </div>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={150} className={styles.footer}>
        <span className={styles.footerAccent}>{me.skills.footerLabel}</span>{" "}
        {me.skills.footerText}
      </Reveal>
    </section>
  );
}
