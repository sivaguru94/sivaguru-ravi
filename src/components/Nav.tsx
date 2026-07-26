"use client";

import { useTheme } from "@/hooks/useTheme";
import { useActiveSection } from "@/hooks/useActiveSection";
import { BladeMark } from "./logos/BladeMark";
import styles from "./Nav.module.css";

const SECTIONS = [
  "about",
  "work",
  "skills",
  "ai",
  "projects",
  "contact",
] as const;

export function Nav() {
  const { theme, toggle } = useTheme();
  const active = useActiveSection(SECTIONS);

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <a href="#top" className={styles.brand}>
          <BladeMark size={19} />
          <span className={styles.wordmark}>shinigami-rog</span>
          <span className={styles.prompt}>:~$</span>
          <span className={styles.cursor} aria-hidden="true">
            ▊
          </span>
        </a>
        <div className={styles.menu}>
          {SECTIONS.map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className={styles.link}
              data-active={active === id || undefined}
            >
              ./{id}
            </a>
          ))}
        </div>
        <button
          type="button"
          onClick={() => toggle()}
          className={styles.toggle}
          title="Shortcut: press T"
          aria-label="Toggle theme"
        >
          [ {theme === "dark" ? "LIGHT" : "DARK"} ]
        </button>
      </div>
    </nav>
  );
}
