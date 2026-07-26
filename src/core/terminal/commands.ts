import type { Command, CommandContext } from "./types";
import { prefsStore, resolveOnOff } from "../theme";
import { me } from "../../content";

/*
 * Command registry — outputs follow the signed-off prototype, with personal
 * details sourced from src/content/me.json (single source of truth).
 * Author overrides 2026-07-26: `stock` command and phone number removed.
 */

const run = (
  name: string,
  args: string[],
  ctx: CommandContext,
): string[] => commands[name].run(args, ctx);

export const commands: Record<string, Command> = {
  help: {
    man: "list commands",
    run: () => [
      "available commands:",
      "  whoami       who is this guy",
      "  skills       top skills",
      "  experience   work history",
      "  projects     featured projects",
      "  ai           AI-assisted engineering work",
      "  contact      how to reach me",
      "  resume       download resume (PDF)",
      "  theme        toggle dark/light",
      "  clear        clear the terminal",
      "",
      "unix works too: ls · cat <file> · cd <section> · man <cmd> · pwd · history",
      "",
      "psst — not everything is listed here. `ls -a` sees more than `ls`.",
    ],
  },

  whoami: {
    man: "print who shinigami-rog is",
    run: () => [
      `${me.identity.firstName} ${me.identity.lastName} — ${me.identity.shortTitle}, ${me.identity.location}`,
      `alias: ${me.identity.alias}  ·  web: ${me.identity.domain}`,
      "9+ years architecting enterprise-grade applications.",
      "Java Spring Boot · Angular · AI-assisted engineering.",
    ],
  },

  skills: {
    man: "list top skills with levels",
    run: () => [...me.shell.skillsArt],
  },

  experience: {
    man: "print work history",
    run: () => [...me.shell.experienceLog],
  },

  projects: {
    man: "list featured projects",
    run: () => [...me.shell.projectsList],
  },

  ai: {
    man: "AI-assisted engineering work",
    run: () => [...me.shell.aiLines],
  },

  contact: {
    man: "ways to reach Sivaguru",
    run: () => [
      `email     ${me.identity.email}`,
      `web       ${me.identity.domain}`,
      `linkedin  linkedin.com${me.identity.linkedin.label.replace(" ↗", "")}`,
      `location  ${me.identity.location}`,
    ],
  },

  resume: {
    man: "download resume PDF",
    run: (_args, ctx) => {
      ctx.host.downloadResume();
      return [
        "fetching resume… download started ✓",
        "file: Sivaguru_Ravi_Resume.pdf",
      ];
    },
  },

  ls: {
    man: "list files",
    run: (args) =>
      args[0] === "-a"
        ? [
            ".  ..  .secrets  about.md  experience.log  skills/  projects/  ai/  contact.txt  resume.pdf",
          ]
        : [
            "about.md  experience.log  skills/  projects/  ai/  contact.txt  resume.pdf",
          ],
  },

  cat: {
    man: "cat <file> — print a file (try `ls`)",
    run: (args, ctx) => {
      if (!args.length) return ["usage: cat <file> — try `ls` to see files"];
      const f = args[0].toLowerCase().replace(/\/$/, "");
      if (f === ".secrets")
        return [
          "# .secrets — you found me. three doors remain:",
          "  1. follow the white rabbit — the movie knows the command.",
          "  2. an old nokia game lives here. it hisses.",
          "  3. ask for more power than you deserve.",
        ];
      const map: Record<string, string> = {
        me: "whoami",
        about: "whoami",
        "about.md": "whoami",
        "experience.log": "experience",
        experience: "experience",
        skills: "skills",
        projects: "projects",
        ai: "ai",
        "contact.txt": "contact",
        contact: "contact",
      };
      if (f === "resume.pdf" || f === "resume") return run("resume", [], ctx);
      if (map[f]) return run(map[f], [], ctx);
      return ["cat: " + args[0] + ": No such file or directory"];
    },
  },

  cd: {
    man: "cd <section> — jump to a page section",
    run: (args, ctx) => {
      const secs: Record<string, string> = {
        about: "about",
        work: "work",
        experience: "work",
        skills: "skills",
        ai: "ai",
        projects: "projects",
        contact: "contact",
        home: "top",
        "~": "top",
        "..": "top",
      };
      const t = (args[0] || "~").toLowerCase().replace(/\/$/, "");
      const id = secs[t];
      if (!id) return ["cd: no such directory: " + args[0] + " — try `ls`"];
      ctx.host.scrollToSection(id);
      return ["→ /" + (id === "top" ? "" : id)];
    },
  },

  open: {
    man: "open resume.pdf — download the resume",
    run: (args, ctx) => {
      const f = (args[0] || "").toLowerCase();
      if (f === "resume.pdf" || f === "resume") return run("resume", [], ctx);
      return ["open: usage: open resume.pdf"];
    },
  },

  man: {
    man: "man <cmd> — show a manual page",
    run: (args) => {
      const k = (args[0] || "").toLowerCase();
      return commands[k]
        ? [k + " — " + commands[k].man]
        : ["what manual page do you want? try `man cat`"];
    },
  },

  pwd: {
    man: "print working directory",
    run: () => ["/home/guest/shinigami-rog"],
  },

  history: {
    man: "show command history",
    run: (_args, ctx) =>
      ctx.history.length
        ? ctx.history.map((h, i) => "  " + (i + 1) + "  " + h)
        : ["(empty)"],
  },

  echo: {
    man: "echo <text> — print text",
    run: (args) => [args.join(" ")],
  },

  date: {
    man: "print the current date",
    run: () => [new Date().toString()],
  },

  uname: {
    man: "print system information",
    run: () => [
      "shinigami-rog 9.2.0-lts #built-with-java-and-angular SMP x86_64 GNU/Linux",
    ],
  },

  exit: {
    man: "there is no escape",
    run: () => ["there is no escape. try `contact` instead."],
  },

  sudo: {
    man: "you already know",
    hidden: true,
    run: () => ["nice try. permission denied."],
  },

  theme: {
    man: "toggle dark/light mode",
    run: (_args, ctx) => {
      ctx.host.toggleTheme();
      return ["theme toggled."];
    },
  },

  clear: {
    man: "clear the terminal",
    clears: true,
    run: () => [],
  },

  logo: {
    man: "the caret is the scythe",
    hidden: true,
    run: () => [
      "      ▄▄▄▄▄▄▄▄▄▄▄██",
      "   ▄██████████████▀",
      "  ▀▀▀▀▀▀▀▀    ██",
      "              ██",
      "              ██   shinigami-rog",
      "              ██   the caret is the scythe",
      "              ██",
    ],
  },

  matrix: {
    man: "you already know",
    hidden: true,
    run: (_args, ctx) => {
      ctx.host.startMatrix();
      return ["wake up, neo…", "the matrix has you. press any key to exit."];
    },
  },

  snake: {
    man: "ssssss",
    hidden: true,
    run: (_args, ctx) => {
      ctx.host.startSnake();
      return ["loading snake.exe… arrows/wasd to move, esc to quit."];
    },
  },

  /* plan §4/§11: the README's "toggleable" scanlines + motion, as hidden
   * shell commands. Not part of the prototype's registry — additive. */
  motion: {
    man: "motion on|off — toggle animations",
    hidden: true,
    run: (args) => {
      if (args[0] !== "on" && args[0] !== "off")
        return ["usage: motion on|off"];
      prefsStore.setMotion(resolveOnOff(args[0]));
      return ["motion " + args[0] + "."];
    },
  },

  scanlines: {
    man: "scanlines on|off — toggle the CRT overlay",
    hidden: true,
    run: (args) => {
      if (args[0] !== "on" && args[0] !== "off")
        return ["usage: scanlines on|off"];
      prefsStore.setScanlines(resolveOnOff(args[0]));
      return ["scanlines " + args[0] + "."];
    },
  },
};
