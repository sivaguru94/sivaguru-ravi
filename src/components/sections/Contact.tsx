import { getMe } from "@/content";
import { CommandLine } from "../common/CommandLine";
import { OpenShellButton } from "../shell/OpenShellButton";
import { Reveal } from "../anim/Reveal";
import styles from "./Contact.module.css";

export async function Contact() {
  const me = await getMe();
  return (
    <section id="contact" className={styles.section}>
      <div className={styles.inner}>
        <Reveal className={styles.cmd}>
          <CommandLine text={me.contact.command} />
        </Reveal>
        <Reveal as="h2" className={styles.heading}>
          {me.contact.headingLines[0]}
          <br />
          {me.contact.headingLines[1]}
          <span className={styles.underscore} aria-hidden="true">
            _
          </span>
        </Reveal>

        <Reveal delay={80} className={styles.rows}>
          {me.contact.channels.map((ch) =>
            ch.href ? (
              <a
                key={ch.label}
                href={ch.href}
                className={styles.rowLink}
                {...(ch.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                <span className={styles.label}>{ch.label}</span>
                <span className={ch.accent ? styles.accentValue : undefined}>
                  {ch.value}
                </span>
              </a>
            ) : (
              <div key={ch.label} className={styles.row}>
                <span className={styles.label}>{ch.label}</span>
                <span>{ch.value}</span>
              </div>
            ),
          )}
        </Reveal>

        <Reveal delay={120}>
          <OpenShellButton />
        </Reveal>
      </div>
    </section>
  );
}
