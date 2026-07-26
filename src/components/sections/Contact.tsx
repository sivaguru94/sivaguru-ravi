import { CommandLine } from "../common/CommandLine";
import { OpenShellButton } from "../shell/OpenShellButton";
import styles from "./Contact.module.css";

export function Contact() {
  return (
    <section id="contact" className={styles.section}>
      <div className={styles.inner}>
        <CommandLine
          text="ping shinigami-rog --all-channels"
          className={styles.cmd}
        />
        <h2 className={styles.heading}>
          Let&apos;s build
          <br />
          something
          <span className={styles.underscore} aria-hidden="true">
            _
          </span>
        </h2>

        <div className={styles.rows}>
          <a href="mailto:sivaguru94@gmail.com" className={styles.rowLink}>
            <span className={styles.label}>EMAIL</span>
            <span className={styles.accentValue}>sivaguru94@gmail.com</span>
          </a>
          <a href="tel:+919020708677" className={styles.rowLink}>
            <span className={styles.label}>PHONE</span>
            <span>+91 90207 08677</span>
          </a>
          <a
            href="https://www.linkedin.com/in/sivaguru-ravi/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.rowLink}
          >
            <span className={styles.label}>LINKEDIN</span>
            <span className={styles.accentValue}>/in/sivaguru-ravi ↗</span>
          </a>
          <a
            href="https://shinigami-rog.cc"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.rowLink}
          >
            <span className={styles.label}>WEB</span>
            <span className={styles.accentValue}>shinigami-rog.cc ↗</span>
          </a>
          <div className={styles.row}>
            <span className={styles.label}>LOCATION</span>
            <span>Bangalore, India</span>
          </div>
        </div>

        <OpenShellButton />
      </div>
    </section>
  );
}
